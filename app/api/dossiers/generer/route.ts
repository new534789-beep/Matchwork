import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_GENERATION, buildGenerationMessage } from "@/lib/ia/prompts/generation";
import { getQuotaGratuit } from "@/lib/parametres";
import { rateLimit } from "@/lib/rate-limit";

function estPlanGratuit(plan: string) {
  return plan === "gratuit" || plan === "GRATUIT";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const rl = await rateLimit(`generer:${userId}`, 5, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { erreur: "Trop de requêtes. Attendez une minute." },
      { status: 429 }
    );
  }

  const { opportuniteId, dossierId: reqDossierId, briefOnly } = (await req.json()) as {
    opportuniteId?: string;
    dossierId?: string;
    briefOnly?: boolean;
  };
  if (!opportuniteId && !reqDossierId) {
    return NextResponse.json({ erreur: "opportuniteId ou dossierId manquant" }, { status: 400 });
  }

  let existant: { id: string; statut: string; briefProjet: string | null; opportuniteId: string } | null = null;
  if (reqDossierId) {
    existant = await prisma.dossier.findFirst({
      where: { id: reqDossierId, userId },
      select: { id: true, statut: true, briefProjet: true, opportuniteId: true },
    });
  } else if (opportuniteId) {
    existant = await prisma.dossier.findFirst({
      where: { userId, opportuniteId },
      select: { id: true, statut: true, briefProjet: true, opportuniteId: true },
    });
  }

  const oppId = opportuniteId ?? existant?.opportuniteId;
  if (!oppId) {
    return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 400 });
  }

  const [user, profil, opportunite] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    prisma.profil.findUnique({ where: { userId } }),
    prisma.opportunite.findUnique({ where: { id: oppId } }),
  ]);

  if (existant && !["a_preparer", "brief_en_cours", "brief_pret"].includes(existant.statut)) {
    return NextResponse.json({ dossierId: existant.id, statut: existant.statut });
  }

  if (!profil?.complete) {
    return NextResponse.json({ erreur: "Profil incomplet. Terminez l'onboarding." }, { status: 400 });
  }
  if (!opportunite) {
    return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  }

  if (briefOnly && opportunite.type === "APPEL_PROJET") {
    const d = existant
      ? existant
      : await prisma.dossier.create({ data: { userId, opportuniteId: oppId, statut: "brief_en_cours" } });
    if (existant && existant.statut === "a_preparer") {
      await prisma.dossier.update({ where: { id: d.id }, data: { statut: "brief_en_cours" } });
    }
    return NextResponse.json({ dossierId: d.id, statut: "brief_en_cours" });
  }

  const dossier = existant
    ? { id: existant.id, briefProjet: existant.briefProjet }
    : await prisma.dossier.create({ data: { userId, opportuniteId: oppId, statut: "a_preparer" } }).then((d) => ({ id: d.id, briefProjet: null as string | null }));

  const jour = new Date().toISOString().slice(0, 10);
  const gratuit = estPlanGratuit(user?.plan ?? "gratuit");

  if (gratuit) {
    const quotaMax = await getQuotaGratuit();
    const quota = await prisma.quotaUsage.findUnique({ where: { userId_mois: { userId, mois: jour } } });
    if ((quota?.generationsUtilisees ?? 0) >= quotaMax) {
      return NextResponse.json(
        { dossierId: dossier.id, statut: "a_preparer", quotaAtteint: true, cta: "/compte" },
        { status: 200 }
      );
    }
  }

  if (!hasMistralKey()) {
    return NextResponse.json(
      { dossierId: dossier.id, statut: "a_preparer", erreur: "IA non configurée (MISTRAL_API_KEY manquante)." },
      { status: 200 }
    );
  }

  try {
    const [coffre, docsAnciens] = await Promise.all([
      prisma.document.findMany({ where: { userId }, select: { type: true, infosExtraites: true } }),
      prisma.documentGenere.findMany({ where: { dossier: { userId } }, select: { accroches: true } }),
    ]);

    const historiqueAccroches: string[] = docsAnciens.flatMap((d) => {
      try { return JSON.parse(d.accroches) as string[]; }
      catch { return []; }
    });

    type PieceReq = { nom?: string; type?: string; categorie?: string };
    let piecesArray: PieceReq[] = [];
    try { piecesArray = JSON.parse(opportunite.piecesExigees) as PieceReq[]; } catch { piecesArray = []; }

    let documentsAGenerer: { type: string; nom: string }[] = (Array.isArray(piecesArray) ? piecesArray : [])
      .filter((p) => p && p.categorie === "generable" && p.type !== "lettre_reco")
      .map((p) => ({ type: (p.type || "lettre").toString(), nom: (p.nom || p.type || "Document").toString() }));
    if (documentsAGenerer.length === 0) {
      if (opportunite.type === "APPEL_PROJET") {
        documentsAGenerer = [
          { type: "note_conceptuelle", nom: "Note conceptuelle" },
          { type: "budget_previsionnel", nom: "Budget prévisionnel" },
        ];
      } else {
        documentsAGenerer = [{ type: "lettre", nom: "Lettre de motivation" }];
      }
    }

    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages: [
        { role: "system", content: SYSTEM_GENERATION },
        { role: "user", content: buildGenerationMessage(profil, coffre, opportunite, historiqueAccroches, documentsAGenerer, dossier.briefProjet) },
      ],
      responseFormat: { type: "json_object" },
    });

    const raw = ((result.choices?.[0]?.message?.content as string) ?? "").trim();
    const parsed = JSON.parse(raw) as { documents?: { type?: string; contenu?: string }[]; accrochesCles?: string[] };
    const docs = (Array.isArray(parsed.documents) ? parsed.documents : [])
      .filter((d) => d && typeof d.contenu === "string" && d.contenu.trim().length > 0);
    if (docs.length === 0) throw new Error("Réponse Mistral incomplète (aucun document généré)");

    const langue = opportunite.langueDetectee ?? "fr";
    const accroches = JSON.stringify(Array.isArray(parsed.accrochesCles) ? parsed.accrochesCles : []);

    await prisma.$transaction([
      ...docs.map((d) =>
        prisma.documentGenere.create({
          data: {
            dossierId: dossier.id,
            type: (d.type || "autre").toString().slice(0, 40),
            contenu: d.contenu as string,
            langue,
            accroches,
          },
        })
      ),
      prisma.dossier.update({ where: { id: dossier.id }, data: { statut: "genere" } }),
    ]);

    if (gratuit) {
      await prisma.quotaUsage.upsert({
        where: { userId_mois: { userId, mois: jour } },
        update: { generationsUtilisees: { increment: 1 } },
        create: { userId, mois: jour, generationsUtilisees: 1 },
      });
    }

    return NextResponse.json({ dossierId: dossier.id, statut: "genere" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const dispo = !(msg.includes("429") || msg.includes("rate") || msg.includes("quota"));
    return NextResponse.json(
      { dossierId: dossier.id, statut: "a_preparer", erreur: dispo ? "Erreur lors de la génération." : "Service IA temporairement indisponible." },
      { status: 200 }
    );
  }
}
