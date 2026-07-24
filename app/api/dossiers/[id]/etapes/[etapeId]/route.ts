import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Props = { params: Promise<{ id: string; etapeId: string }> };

const schema = z.object({ fait: z.boolean() });

// Coche/décoche une étape de la checklist post-obtention.
export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const { id, etapeId } = await params;

  const etape = await prisma.etapePostObtention.findUnique({
    where: { id: etapeId },
    select: { dossierId: true, dossier: { select: { userId: true } } },
  });
  if (!etape || etape.dossierId !== id || etape.dossier.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Étape introuvable" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Données invalides" }, { status: 400 });
  }

  await prisma.etapePostObtention.update({ where: { id: etapeId }, data: { fait: parsed.data.fait } });
  return NextResponse.json({ ok: true });
}
