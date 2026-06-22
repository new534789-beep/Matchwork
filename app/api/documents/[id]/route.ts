import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supprimerFichier } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ erreur: "Document introuvable" }, { status: 404 });
  }
  if (doc.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  try {
    await supprimerFichier(doc.refStockage, session.user.id);
  } catch (err) {
    console.error("Erreur suppression fichier:", err);
    // On continue pour supprimer l'entrée DB même si le fichier est introuvable
  }

  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ succes: true });
}
