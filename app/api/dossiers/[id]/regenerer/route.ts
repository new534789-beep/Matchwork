import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_GENERATION, buildGenerationMessage } from "@/lib/ia/prompts/generation";

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  if (!hasMistralKey()) {
    return NextResponse.json(
      { erreur: "L'IA n'est pas encore configurée (MISTRAL_API_KEY manquante). Ajoutez votre clé dans .env.local." },
      { status: 503 }
    );
  }

  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: { opportunite: true },
  });
  if (!dossier || dossier.userId !== userId) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  const [profil, coffre, docsAnciens] = await Promise.all([
    prisma.profil.findUnique({ where: { userId } }),
    prisma.document.findMany({
      where: { userId },
      select: { type: true, infosExtraites: true },
    }),
    prisma.documentGenere.findMany({
      where: { dossier: { userId } },
      select: { accroches: true },
    }),
  ]);

  if (!profil?.complete) {
    return NextResponse.json({ erreur: "Profil incomplet. Terminez l'onboarding." }, { status: 400 });
  }

  const historiqueAccroches: string[] = docsAnciens.flatMap((d) => {
    try { return JSON.parse(d.accroches) as string[]; }
    catch { return []; }
  });

  const langue = dossier.opportunite.langueDetectee ?? "fr";

  // Documents rédactionnels demandés par l'offre (categorie "generable"), min. une lettre.
  type PieceReq = { nom?: string; type?: string; categorie?: string };
  let documentsAGenerer: { type: string; nom: string }[] = [];
  try {
    const pieces = JSON.parse(dossier.opportunite.piecesExigees) as PieceReq[];
    documentsAGenerer = (Array.isArray(pieces) ? pieces : [])
      .filter((p) => p && p.categorie === "generable")
      .map((p) => ({ type: (p.type || "lettre").toString(), nom: (p.nom || p.type || "Document").toString() }));
  } catch {
    documentsAGenerer = [];
  }
  if (documentsAGenerer.length === 0) documentsAGenerer = [{ type: "lettre", nom: "Lettre de motivation" }];

  let docs: { type: string; contenu: string }[];
  let accrochesCles: string[];

  try {
    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages: [
        { role: "system", content: SYSTEM_GENERATION },
        { role: "user", content: buildGenerationMessage(profil, coffre, dossier.opportunite, historiqueAccroches, documentsAGenerer) },
      ],
      responseFormat: { type: "json_object" },
    });

    const raw = ((result.choices?.[0]?.message?.content as string) ?? "").trim();
    const parsed = JSON.parse(raw) as { documents?: { type?: string; contenu?: string }[]; accrochesCles?: string[] };
    docs = (Array.isArray(parsed.documents) ? parsed.documents : [])
      .filter((d) => d && typeof d.contenu === "string" && d.contenu.trim().length > 0)
      .map((d) => ({ type: (d.type || "autre").toString().slice(0, 40), contenu: d.contenu as string }));
    if (docs.length === 0) throw new Error("Réponse Mistral incomplète");
    accrochesCles = Array.isArray(parsed.accrochesCles) ? parsed.accrochesCles : [];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.includes("rate") || msg.includes("quota")) {
      return NextResponse.json(
        { erreur: "Service IA temporairement indisponible. Réessayez dans quelques minutes." },
        { status: 503 }
      );
    }
    return NextResponse.json({ erreur: "Erreur lors de la génération. Réessayez." }, { status: 500 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.documentGenere.deleteMany({ where: { dossierId: id } });
    for (const d of docs) {
      await tx.documentGenere.create({
        data: { dossierId: id, type: d.type, contenu: d.contenu, langue, accroches: JSON.stringify(accrochesCles) },
      });
    }
    await tx.dossier.update({ where: { id }, data: { statut: "genere" } });
  });

  return NextResponse.json({ ok: true });
}
