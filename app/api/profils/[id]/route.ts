import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activerProfil } from "@/lib/profil/actif";
import { z } from "zod";

type Props = { params: Promise<{ id: string }> };

const schemaMaj = z.object({
  nom: z.string().min(1).max(100).optional(),
  actif: z.literal(true).optional(),
});

// Renommer un profil, ou l'activer (actif: true → bascule, désactive les autres).
export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;

  const profil = await prisma.profil.findUnique({ where: { id }, select: { userId: true } });
  if (!profil || profil.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Profil introuvable" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schemaMaj.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Données invalides" }, { status: 400 });
  }

  if (parsed.data.actif) {
    await activerProfil(session.user.id, id);
  }
  if (parsed.data.nom) {
    await prisma.profil.update({ where: { id }, data: { nom: parsed.data.nom } });
  }

  return NextResponse.json({ ok: true });
}

// Supprime un profil — jamais le dernier restant. Si c'était le profil actif,
// active automatiquement le plus récent des profils restants.
export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;

  const profil = await prisma.profil.findUnique({ where: { id } });
  if (!profil || profil.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Profil introuvable" }, { status: 404 });
  }

  const total = await prisma.profil.count({ where: { userId: session.user.id } });
  if (total <= 1) {
    return NextResponse.json({ erreur: "Impossible de supprimer votre dernier profil." }, { status: 400 });
  }

  await prisma.profil.delete({ where: { id } });

  if (profil.actif) {
    const remplacant = await prisma.profil.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (remplacant) await prisma.profil.update({ where: { id: remplacant.id }, data: { actif: true } });
  }

  return NextResponse.json({ ok: true });
}
