import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Vérifie la signature FedaPay : header "x-fedapay-signature" = "t=<timestamp>,s=<hmac-sha256>[,s=<autre>...]"
// hmac = HMAC-SHA256(FEDAPAY_WEBHOOK_SECRET, `${timestamp}.${rawBody}`)
// Référence : implémentation officielle fedapay-php (lib/WebhookSignature.php) — tolérance 300s par défaut.
const TOLERANCE_SECONDES = 300;

function verifierSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  let timestamp: string | undefined;
  const signatures: string[] = [];
  for (const item of signatureHeader.split(",")) {
    const [k, v] = item.split("=");
    const cle = k?.trim();
    const val = v?.trim();
    if (cle === "t" && val) timestamp = val;
    else if (cle === "s" && val) signatures.push(val);
  }
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;

  // Protection anti-rejeu : rejette les webhooks trop anciens (secret compromis/rejoué).
  const maintenant = Math.floor(Date.now() / 1000);
  if (Math.abs(maintenant - parseInt(timestamp, 10)) > TOLERANCE_SECONDES) return false;

  const attendu = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const bufAttendu = Buffer.from(attendu, "hex");

  return signatures.some((sig) => {
    const bufRecu = Buffer.from(sig, "hex");
    if (bufAttendu.length !== bufRecu.length) return false;
    return crypto.timingSafeEqual(bufAttendu, bufRecu);
  });
}

// FedaPay envoie un POST JSON avec l'événement de transaction
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-fedapay-signature");

    if (!verifierSignature(rawBody, signatureHeader)) {
      return NextResponse.json({ erreur: "Signature invalide" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as {
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
