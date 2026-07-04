import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/paiement/factory";
import type { FournisseurPaiement } from "@/lib/paiement/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json() as { paiementId?: string };
  const { paiementId } = body;
  if (!paiementId) {
    return NextResponse.json({ erreur: "paiementId manquant" }, { status: 400 });
  }

  const paiement = await prisma.paiement.findUnique({ where: { id: paiementId } });
  if (!paiement || paiement.userId !== userId) {
    return NextResponse.json({ erreur: "Paiement introuvable" }, { status: 404 });
  }
  if (paiement.statut !== "en_attente") {
    return NextResponse.json({ statut: paiement.statut });
  }

  const provider = getProvider(paiement.fournisseur as FournisseurPaiement);
  const { statut } = await provider.verifierStatut(paiement.reference ?? "");

  await prisma.paiement.update({ where: { id: paiementId }, data: { statut } });

  if (statut === "reussi") {
    // Passer l'utilisateur en plan payant → plus de quota
    await prisma.user.update({ where: { id: userId }, data: { plan: "payant" } });
  }

  return NextResponse.json({ statut });
}
