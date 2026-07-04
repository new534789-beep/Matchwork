import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FedaPay envoie un POST JSON avec l'événement de transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string;
      data?: { id?: number; status?: string };
    };

    if (body.name !== "transaction.approved" && body.name !== "transaction.declined") {
      return NextResponse.json({ ok: true });
    }

    const fedapayId = body.data?.id;
    const status = body.data?.status;
    if (!fedapayId) return NextResponse.json({ ok: true });

    const paiement = await prisma.paiement.findFirst({ where: { fedapayId } });
    if (!paiement || paiement.statut !== "en_attente") {
      return NextResponse.json({ ok: true });
    }

    if (status === "approved") {
      await Promise.all([
        prisma.paiement.update({ where: { id: paiement.id }, data: { statut: "reussi" } }),
        prisma.user.update({ where: { id: paiement.userId }, data: { plan: paiement.plan } }),
      ]);
    } else if (status === "declined" || status === "cancelled" || status === "error") {
      await prisma.paiement.update({ where: { id: paiement.id }, data: { statut: "echoue" } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook FedaPay erreur:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
