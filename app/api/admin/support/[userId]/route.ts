import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Non autorise" }, { status: 403 });
  }

  const { userId } = await params;

  const [user, messages] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, plan: true, createdAt: true } }),
    prisma.message.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  if (!user) {
    return NextResponse.json({ erreur: "Utilisateur introuvable" }, { status: 404 });
  }

  await prisma.message.updateMany({
    where: { userId, auteur: "candidat", lu: false },
    data: { lu: true },
  });

  return NextResponse.json({
    user: { email: user.email, plan: user.plan, createdAt: user.createdAt.toISOString() },
    messages: messages.map((m) => ({
      id: m.id,
      auteur: m.auteur,
      nomAuteur: m.nomAuteur,
      contenu: m.contenu,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
