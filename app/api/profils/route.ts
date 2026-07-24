import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Liste légère de tous les profils de l'utilisateur (multi-profils Pro),
// pour le sélecteur — pas les gros champs JSON (formations, etc.).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const profils = await prisma.profil.findMany({
    where: { userId: session.user.id },
    select: { id: true, nom: true, actif: true, complete: true, nomComplet: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ profils });
}

const schemaCreation = z.object({ nom: z.string().min(1).max(100) });

const LIMITE_PROFILS = 5;

// Crée un nouveau profil (vide) — réservé Pro : plusieurs profils complets
// n'a de sens que pour varier ses candidatures par secteur, une fonctionnalité
// Pro. Le nouveau profil n'est PAS activé automatiquement — l'utilisateur
// bascule explicitement (POST /api/profils/[id]/activer) quand il veut s'en
// servir, pour ne jamais changer silencieusement le profil utilisé en cours
// de swipe.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  if (user?.plan !== "pro" && user?.plan !== "pro_plus") {
    return NextResponse.json({ erreur: "Fonctionnalité réservée aux comptes Pro." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schemaCreation.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Nom de profil invalide" }, { status: 400 });
  }

  const total = await prisma.profil.count({ where: { userId: session.user.id } });
  if (total >= LIMITE_PROFILS) {
    return NextResponse.json({ erreur: `Maximum ${LIMITE_PROFILS} profils.` }, { status: 400 });
  }

  const profil = await prisma.profil.create({
    data: { userId: session.user.id, nom: parsed.data.nom, actif: false },
  });

  return NextResponse.json(profil);
}
