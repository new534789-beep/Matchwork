import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ succes: true });
}
