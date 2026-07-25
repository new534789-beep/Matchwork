import { NextResponse } from "next/server";

// Diagnostic temporaire — FEDAPAY_BASE_URL n'est pas un secret (c'est une URL
// publique documentée), donc on peut la renvoyer directement pour vérifier
// si elle a été inversée avec FEDAPAY_SECRET_KEY. À supprimer après diagnostic.
export async function GET() {
  return NextResponse.json({ valeur: process.env.FEDAPAY_BASE_URL ?? null });
}
