import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

function estPlanGratuit(plan: string) {
  return plan === "gratuit" || plan === "GRATUIT";
}

const STATUTS_VALIDES = ["a_preparer", "genere", "utilise", "soumis"];

export async function GET(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;

  const dossier = await prisma.dossier.findUnique({
    where: { id, userId: session.user.id },
    include: {
      opportunite: { select: { id: true, intitule: true, organisme: true, langueDetectee: true, dateLimite: true, lien: true } },
      docsGeneres: true,
    },
  });
  if (!dossier) return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  return NextResponse.json(dossier);
}

// Passer un dossier à un statut (notamment « utilise » lors de Postuler / Télécharger / Recevoir).
export async function PATCH(req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;
  const { statut } = (await req.json()) as { statut?: string };
  if (!statut || !STATUTS_VALIDES.includes(statut)) {
    return NextResponse.json({ erreur: "Statut invalide" }, { status: 400 });
  }

  const dossier = await prisma.dossier.findUnique({ where: { id }, select: { userId: true } });
  if (!dossier || dossier.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  await prisma.dossier.update({ where: { id }, data: { statut } });
  return NextResponse.json({ ok: true, statut });
}

// Annuler (supprimer) un dossier. Rend le crédit si le dossier est « genere » (jamais utilisé).
export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  const dossier = await prisma.dossier.findUnique({ where: { id }, select: { userId: true, statut: true } });
  if (!dossier || dossier.userId !== userId) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  // Remboursement : uniquement sur un dossier « genere » non utilisé, plan gratuit.
  let creditRendu = false;
  if (dossier.statut === "genere") {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    if (estPlanGratuit(user?.plan ?? "gratuit")) {
      const mois = new Date().toISOString().slice(0, 7);
      const quota = await prisma.quotaUsage.findUnique({ where: { userId_mois: { userId, mois } } });
      if (quota && quota.generationsUtilisees > 0) {
        await prisma.quotaUsage.update({
          where: { userId_mois: { userId, mois } },
          data: { generationsUtilisees: { decrement: 1 } },
        });
        creditRendu = true;
      }
    }
  }

  await prisma.dossier.delete({ where: { id } }); // cascade → documents générés

  return NextResponse.json({ ok: true, creditRendu });
}
