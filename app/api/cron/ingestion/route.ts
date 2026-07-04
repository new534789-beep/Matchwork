import { NextResponse } from "next/server";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { retirerExpirees } from "@/lib/ingestion/expiration";

export const maxDuration = 60;

/**
 * Endpoint cron (production) — appelle le MÊME service que le bouton admin.
 * Protégé par CRON_SECRET : Vercel envoie automatiquement
 * `Authorization: Bearer <CRON_SECRET>` quand la variable est définie.
 * En dev (CRON_SECRET non défini), l'endpoint est ouvert sur localhost.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const h = req.headers.get("authorization");
    if (h !== `Bearer ${secret}`) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }
  }

  const action = new URL(req.url).searchParams.get("action");
  if (action === "expirer") {
    const expirees = await retirerExpirees();
    return NextResponse.json({ ok: true, expirees });
  }

  const rapport = await ingererToutesLesSources();
  const expirees = await retirerExpirees();
  return NextResponse.json({ ok: true, rapport, expirees });
}
