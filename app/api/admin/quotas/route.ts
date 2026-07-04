import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function moisCourant() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

// Ajuste manuellement le nombre de générations utilisées pour le mois courant.
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const b = (await req.json()) as { userId?: string; generationsUtilisees?: unknown; mois?: string };
  const userId = (b.userId ?? "").trim();
  const n = Number(b.generationsUtilisees);

  if (!userId || !Number.isFinite(n) || n < 0) {
    return NextResponse.json({ erreur: "userId et un nombre >= 0 sont requis." }, { status: 400 });
  }
  const mois = b.mois && /^\d{4}-\d{2}$/.test(b.mois) ? b.mois : moisCourant();

  const existe = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existe) return NextResponse.json({ erreur: "Utilisateur introuvable" }, { status: 404 });

  await prisma.quotaUsage.upsert({
    where: { userId_mois: { userId, mois } },
    update: { generationsUtilisees: Math.floor(n) },
    create: { userId, mois, generationsUtilisees: Math.floor(n) },
  });
  return NextResponse.json({ ok: true });
}
