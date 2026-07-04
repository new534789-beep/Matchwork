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

  const message = await prisma.message.create({
    data: {
      userId: session.user.id,
      auteur: "candidat",
      nomAuteur: (nomAuteur?.trim() || "Matchwork").slice(0, 120),
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
