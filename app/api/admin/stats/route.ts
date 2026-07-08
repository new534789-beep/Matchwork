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
      SELECT date("createdAt") as jour, CAST(COUNT(*) AS INTEGER) as total
      FROM users
      WHERE "createdAt" >= ${il30j.toISOString()}
      GROUP BY date("createdAt")
      ORDER BY jour
    `,
    prisma.$queryRaw<{ jour: string; dureeMoyenneMs: number; utilisateursActifs: number }[]>`
      SELECT date("debutAt") as jour,
             CAST(AVG("dureeMs") AS INTEGER) as "dureeMoyenneMs",
             CAST(COUNT(DISTINCT "userId") AS INTEGER) as "utilisateursActifs"
      FROM session_activities
      WHERE "debutAt" >= ${il30j.toISOString()}
      GROUP BY date("debutAt")
      ORDER BY jour
    `,
    prisma.$queryRaw<{ jour: string; total: number }[]>`
      SELECT date("createdAt") as jour, CAST(COUNT(*) AS INTEGER) as total
      FROM interactions
      WHERE "createdAt" >= ${il30j.toISOString()}
      GROUP BY date("createdAt")
      ORDER BY jour
    `,
  ]);

  return NextResponse.json({
    inscriptionsParJour: inscriptions,
    sessionsParJour: sessions,
    interactionsParJour: interactions,
  });
}
