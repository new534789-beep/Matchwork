import { NextResponse } from "next/server";
import crypto from "crypto";

// Diagnostic temporaire — ne révèle jamais la clé, juste un HMAC d'une chaîne
// fixe connue, pour confirmer si la clé chargée en prod correspond à celle
// attendue. À supprimer une fois le diagnostic terminé.
export async function GET() {
  const secret = process.env.FEDAPAY_SECRET_KEY;
  if (!secret) return NextResponse.json({ present: false });

  const empreinte = crypto.createHmac("sha256", secret).update("test-diagnostic-fixe").digest("hex");
  return NextResponse.json({
    present: true,
    longueur: secret.length,
    prefixe: secret.slice(0, 8),
    empreinte,
  });
}
