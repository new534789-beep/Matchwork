import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creerTransaction, genererUrlPaiement } from "@/lib/paiement/fedapay";

const PLANS: Record<string, { montant: number; label: string }> = {
  pro:     { montant: 1700, label: "Abonnement Matchwork Pro" },
  premium: { montant: 2900, label: "Abonnement Matchwork Premium" },
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;
  const email = session.user.email;

  const body = await req.json() as { plan?: string };
  const planId = body.plan ?? "pro";
  const planConfig = PLANS[planId];
  if (!planConfig) {
    return NextResponse.json({ erreur: "Plan invalide" }, { status: 400 });
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const callbackUrl = `${baseUrl}/paiement/retour`;

  try {
    const { id: fedapayId, reference } = await creerTransaction({
      montant: planConfig.montant,
      description: planConfig.label,
      email,
      callbackUrl,
    });

    const urlPaiement = await genererUrlPaiement(fedapayId);

    const paiement = await prisma.paiement.create({
      data: {
        userId,
        montant: planConfig.montant,
        fournisseur: "fedapay",
        plan: planId,
        statut: "en_attente",
        reference,
        fedapayId,
      },
    });

    return NextResponse.json({ paiementId: paiement.id, redirectUrl: urlPaiement });
  } catch (err) {
    console.error("Erreur initiation FedaPay:", err);
    return NextResponse.json(
      { erreur: err instanceof Error ? err.message : "Erreur FedaPay" },
      { status: 500 }
    );
  }
}
