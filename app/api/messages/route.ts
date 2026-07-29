import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Envoi d'un message par le candidat dans une conversation existante.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { contenu, nomAuteur } = await req.json() as { contenu?: string; nomAuteur?: string };
  if (!contenu?.trim()) {
    return NextResponse.json({ erreur: "Message vide" }, { status: 400 });
  }
  if (contenu.trim().length > 4000) {
    return NextResponse.json({ erreur: "Message trop long (4000 caractères max)." }, { status: 400 });
  }

  const nom = (nomAuteur?.trim() || "Matchwork").slice(0, 120);
  // Rattache le message à l'organisme du fil (si ce nom correspond à un
  // organisme réel) pour que l'organisme retrouve la conversation de son
  // côté — best-effort, un message système/support reste organismeId: null.
  const organisme = nom !== "Matchwork" ? await prisma.organisme.findFirst({ where: { nom } }) : null;

  const message = await prisma.message.create({
    data: {
      userId: session.user.id,
      auteur: "candidat",
      nomAuteur: nom,
      organismeId: organisme?.id ?? null,
      contenu: contenu.trim(),
      lu: true,
    },
  });

  return NextResponse.json({
    id: message.id,
    auteur: message.auteur,
    nomAuteur: message.nomAuteur,
    contenu: message.contenu,
    createdAt: message.createdAt.toISOString(),
  });
}
