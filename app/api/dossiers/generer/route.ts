import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_GENERATION, buildGenerationMessage } from "@/lib/ia/prompts/generation";
import { getQuotaGratuit } from "@/lib/parametres";

function estPlanGratuit(plan: string) {
  return plan === "gratuit" || plan === "GRATUIT";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const { opportuniteId } = (await req.json()) as { opportuniteId?: string };
  if (!opportuniteId) {
    return NextResponse.json({ erreur: "opportuniteId manquant" }, { status: 400 });
  }

  const [existant, user, profil, opportunite] = await Promise.all([
    prisma.dossier.findFirst({
      where: { userId, opportuniteId },
      select: { id: true, statut: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    prisma.profil.findUnique({ where: { userId } }),
    prisma.opportunite.findUnique({ where: { id: opportuniteId } }),
  ]);

  if (existant && existant.statut !== "a_preparer") {
    return NextResponse.json({ dossierId: existant.id, statut: existant.statut });
  }

  if (!profil?.complete) {
    return NextResponse.json({ erreur: "Profil incomplet. Terminez l'onboarding." }, { status: 400 });
  }
  if (!opportunite) {
    return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  }

  const dossier = existant
    ? { id: existant.id }
    : await prisma.dossier.create({ data: { userId, opportuniteId, statut: "a_preparer" } });

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
      .filter((p) => p && p.categorie === "generable")
      .map((p) => ({ type: (p.type || "lettre").toString(), nom: (p.nom || p.type || "Document").toString() }));
    if (documentsAGenerer.length === 0) documentsAGenerer = [{ type: "lettre", nom: "Lettre de motivation" }];

    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages: [
        { role: "system", content: SYSTEM_GENERATION },
        { role: "user", content: buildGenerationMessage(profil, coffre, opportunite, historiqueAccroches, documentsAGenerer) },
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
