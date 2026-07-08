import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, journaliserActionAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Non autorise" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  const parUser = new Map<string, {
    userId: string;
    email: string;
    messages: typeof messages;
    nonLus: number;
    dernierMessage: Date;
  }>();

  for (const m of messages) {
    const existing = parUser.get(m.userId);
    if (existing) {
      existing.messages.push(m);
      if (!m.lu && m.auteur === "candidat") existing.nonLus++;
    } else {
      parUser.set(m.userId, {
        userId: m.userId,
        email: m.user.email,
        messages: [m],
        nonLus: !m.lu && m.auteur === "candidat" ? 1 : 0,
        dernierMessage: m.createdAt,
      });
    }
  }

  const conversations = [...parUser.values()]
    .sort((a, b) => b.dernierMessage.getTime() - a.dernierMessage.getTime())
    .map((c) => ({
      userId: c.userId,
      email: c.email,
      nonLus: c.nonLus,
      totalMessages: c.messages.length,
      dernierMessage: c.messages[0]?.contenu.slice(0, 100) ?? "",
      dernierAt: c.dernierMessage.toISOString(),
    }));

  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorise" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { userId, contenu } = body as { userId?: string; contenu?: string };

  if (!userId?.trim() || !contenu?.trim()) {
    return NextResponse.json({ erreur: "userId et contenu requis" }, { status: 400 });
  }

  if (contenu.trim().length > 4000) {
    return NextResponse.json({ erreur: "Message trop long" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      userId: userId.trim(),
      auteur: "systeme",
      nomAuteur: "Matchwork Support",
      contenu: contenu.trim(),
      lu: false,
    },
  });

  await journaliserActionAdmin(session.user!.id as string, "support.message", userId.trim());

  return NextResponse.json({
    id: message.id,
    auteur: message.auteur,
    nomAuteur: message.nomAuteur,
    contenu: message.contenu,
    createdAt: message.createdAt.toISOString(),
  });
}
