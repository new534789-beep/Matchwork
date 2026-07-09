import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Non autorise" }, { status: 403 });
  }

  const il30j = new Date();
  il30j.setDate(il30j.getDate() - 30);

  const [inscriptions, sessions, interactions] = await Promise.all([
    prisma.$queryRaw<{ jour: string; total: number }[]>`
      SELECT "createdAt"::date::text as jour, COUNT(*)::int as total
      FROM users
      WHERE "createdAt" >= ${il30j}
      GROUP BY "createdAt"::date
      ORDER BY jour
    `,
    prisma.$queryRaw<{ jour: string; dureeMoyenneMs: number; utilisateursActifs: number }[]>`
      SELECT "debutAt"::date::text as jour,
             AVG("dureeMs")::int as "dureeMoyenneMs",
             COUNT(DISTINCT "userId")::int as "utilisateursActifs"
      FROM session_activities
      WHERE "debutAt" >= ${il30j}
      GROUP BY "debutAt"::date
      ORDER BY jour
    `,
    prisma.$queryRaw<{ jour: string; total: number }[]>`
      SELECT "createdAt"::date::text as jour, COUNT(*)::int as total
      FROM interactions
      WHERE "createdAt" >= ${il30j}
      GROUP BY "createdAt"::date
      ORDER BY jour
    `,
  ]);

  return NextResponse.json({
    inscriptionsParJour: inscriptions,
    sessionsParJour: sessions,
    interactionsParJour: interactions,
  });
}
