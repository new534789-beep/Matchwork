import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

function genererCode(): string {
  return "MW-" + randomBytes(3).toString("hex").toUpperCase();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { codeParrainage: true },
  });

  if (!user?.codeParrainage) {
    const code = genererCode();
    user = await prisma.user.update({
      where: { id: session.user.id },
      data: { codeParrainage: code },
      select: { codeParrainage: true },
    });
  }

  const parrainages = await prisma.parrainage.findMany({
    where: { parrainId: session.user.id },
    select: { statut: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: parrainages.length,
    inscrits: parrainages.filter((p) => p.statut === "inscrit" || p.statut === "actif").length,
    actifs: parrainages.filter((p) => p.statut === "actif").length,
  };

  return NextResponse.json({
    code: user!.codeParrainage,
    parrainages,
    stats,
  });
}

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ erreur: "Code requis" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const parrain = await prisma.user.findFirst({
    where: { codeParrainage: code.toUpperCase().trim() },
  });

  if (!parrain) {
    return NextResponse.json({ erreur: "Code invalide" }, { status: 404 });
  }

  if (parrain.id === session.user.id) {
    return NextResponse.json({ erreur: "Vous ne pouvez pas utiliser votre propre code" }, { status: 400 });
  }

  const dejaParraine = await prisma.parrainage.findFirst({
    where: { filleulId: session.user.id },
  });

  if (dejaParraine) {
    return NextResponse.json({ erreur: "Vous avez déjà utilisé un code de parrainage" }, { status: 400 });
  }

  await prisma.parrainage.create({
    data: {
      parrainId: parrain.id,
      filleulId: session.user.id,
      code: code.toUpperCase().trim(),
      statut: "inscrit",
    },
  });

  return NextResponse.json({ ok: true, message: "Parrainage enregistré" });
}
