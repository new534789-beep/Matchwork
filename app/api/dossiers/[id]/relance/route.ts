import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_RELANCE, buildRelanceMessage } from "@/lib/ia/prompts/relance";
import { getProfilActifSelect } from "@/lib/profil/actif";

type Props = { params: Promise<{ id: string }> };

// Génère à la demande un brouillon de message de relance (jamais envoyé
// automatiquement) — le candidat le copie et l'envoie lui-même s'il le souhaite.
export async function POST(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;

  const dossier = await prisma.dossier.findUnique({
    where: { id },
    select: {
      userId: true,
      createdAt: true,
      opportunite: { select: { intitule: true, organisme: true, langueDetectee: true } },
    },
  });
  if (!dossier || dossier.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }
  if (!hasMistralKey()) {
    return NextResponse.json({ erreur: "Génération indisponible pour le moment." }, { status: 503 });
  }

  const profilActif = await getProfilActifSelect(session.user.id, { nomComplet: true, signature: true });
  const nomCandidat = profilActif?.signature ?? profilActif?.nomComplet ?? "Le candidat";
  const dateEnvoi = dossier.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  try {
    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages: [
        { role: "system", content: SYSTEM_RELANCE },
        {
          role: "user",
          content: buildRelanceMessage({
            nomCandidat,
            intitule: dossier.opportunite.intitule,
            organisme: dossier.opportunite.organisme,
            dateEnvoi,
            langue: dossier.opportunite.langueDetectee,
          }),
        },
      ],
    });
    const message = ((result.choices?.[0]?.message?.content as string) ?? "").trim();
    if (!message) throw new Error("vide");
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ erreur: "Impossible de générer le message pour le moment." }, { status: 502 });
  }
}
