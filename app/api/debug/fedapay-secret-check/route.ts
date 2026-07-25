import { NextResponse } from "next/server";
import crypto from "crypto";

// Diagnostic temporaire — ne révèle jamais le secret, juste un HMAC d'une
// chaîne fixe connue, pour confirmer si le secret chargé en prod correspond
// à celui attendu. À supprimer une fois le diagnostic terminé.
export async function GET() {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ present: false });

  const empreinte = crypto.createHmac("sha256", secret).update("test-diagnostic-fixe").digest("hex");
  return NextResponse.json({ present: true, longueur: secret.length, empreinte });
}
