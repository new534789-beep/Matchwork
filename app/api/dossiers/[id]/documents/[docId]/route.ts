import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string; docId: string }> };

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id, docId } = await params;

  const doc = await prisma.documentGenere.findUnique({
    where: { id: docId },
    include: { dossier: { select: { userId: true, id: true } } },
  });
  if (!doc || doc.dossier.userId !== userId || doc.dossier.id !== id) {
    return NextResponse.json({ erreur: "Document introuvable" }, { status: 404 });
  }

  const body = await req.json() as { contenu?: string };
  if (typeof body.contenu !== "string" || body.contenu.trim() === "") {
    return NextResponse.json({ erreur: "Contenu invalide" }, { status: 400 });
  }

  await prisma.documentGenere.update({
    where: { id: docId },
    data: { contenu: body.contenu },
  });

  return NextResponse.json({ ok: true });
}
