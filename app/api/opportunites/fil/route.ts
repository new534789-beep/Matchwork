import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculerScore } from "@/lib/matching/score";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const [opportunites, profil] = await Promise.all([
    prisma.opportunite.findMany({
      where: {
        type: "BOURSE",
        actif: true,
        statut: "publiee",
        interactions: { none: { userId: session.user.id } },
      },
      orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
      select: {
        id: true, type: true, organisme: true, intitule: true, description: true,
        langueDetectee: true, conditions: true, piecesExigees: true,
        exigenceLangue: true, dateLimite: true, lien: true, source: true,
      },
    }),
    prisma.profil.findUnique({
      where: { userId: session.user.id },
      select: { formations: true, experiences: true, competences: true, langues: true, objectifs: true, nationalite: true },
    }),
  ]);

  const parsed = opportunites.map((o) => {
    const pieces = (() => { try { return JSON.parse(o.piecesExigees); } catch { return []; } })();
    const score = profil
      ? calculerScore(profil, { type: o.type, description: o.description, conditions: o.conditions, exigenceLangue: o.exigenceLangue, piecesExigees: o.piecesExigees })
      : null;
    return {
      ...o,
      piecesExigees: pieces,
      dateLimite: o.dateLimite?.toISOString() ?? null,
      score,
    };
  });

  if (profil) {
    parsed.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  return NextResponse.json({ opportunites: parsed });
}
