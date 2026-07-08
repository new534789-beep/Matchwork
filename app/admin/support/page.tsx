import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { SupportAdmin } from "@/components/admin/SupportAdmin";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  const parUser = new Map<string, {
    userId: string;
    email: string;
    nonLus: number;
    totalMessages: number;
    dernierMessage: string;
    dernierAt: Date;
  }>();

  for (const m of messages) {
    const existing = parUser.get(m.userId);
    if (existing) {
      existing.totalMessages++;
      if (!m.lu && m.auteur === "candidat") existing.nonLus++;
    } else {
      parUser.set(m.userId, {
        userId: m.userId,
        email: m.user.email,
        nonLus: !m.lu && m.auteur === "candidat" ? 1 : 0,
        totalMessages: 1,
        dernierMessage: m.contenu.slice(0, 100),
        dernierAt: m.createdAt,
      });
    }
  }

  const conversations = [...parUser.values()]
    .sort((a, b) => b.dernierAt.getTime() - a.dernierAt.getTime())
    .map((c) => ({
      userId: c.userId,
      email: c.email,
      nonLus: c.nonLus,
      totalMessages: c.totalMessages,
      dernierMessage: c.dernierMessage,
      dernierAt: c.dernierAt.toISOString(),
    }));

  return (
    <>
      <EnteteAdmin titre="Support client" sousTitre="Messages des utilisateurs" />
      <main style={{ padding: "0 24px 24px" }}>
        <SupportAdmin initial={conversations} />
      </main>
    </>
  );
}
