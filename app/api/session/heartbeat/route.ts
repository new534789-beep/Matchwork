import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifie" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  const maintenant = new Date();

  if (sessionId) {
    const existing = await prisma.sessionActivity.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, debutAt: true },
    });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ erreur: "Session invalide" }, { status: 400 });
    }
    const dureeMs = maintenant.getTime() - existing.debutAt.getTime();
    await prisma.sessionActivity.update({
      where: { id: sessionId },
      data: { finAt: maintenant, dureeMs },
    });
    return NextResponse.json({ sessionId });
  }

  const nouvelle = await prisma.sessionActivity.create({
    data: {
      userId: session.user.id,
      debutAt: maintenant,
      finAt: maintenant,
      dureeMs: 0,
    },
  });

  return NextResponse.json({ sessionId: nouvelle.id });
}
