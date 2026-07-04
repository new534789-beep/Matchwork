import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const opportunites = await prisma.opportunite.findMany({
    where: {
      type: "BOURSE",
      actif: true,
      interactions: {
        none: { userId: session.user.id },
      },
    },
    orderBy: [
      { dateLimite: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      organisme: true,
      intitule: true,
      description: true,
      langueDetectee: true,
      conditions: true,
      piecesExigees: true,
      exigenceLangue: true,
      dateLimite: true,
      lien: true,
      source: true,
    },
  });

  const parsed = opportunites.map((o) => ({
    ...o,
    piecesExigees: (() => {
      try { return JSON.parse(o.piecesExigees); } catch { return []; }
    })(),
    dateLimite: o.dateLimite?.toISOString() ?? null,
  }));

  return NextResponse.json({ opportunites: parsed });
}
