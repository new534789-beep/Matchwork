import { NextResponse } from "next/server";
import { validerAutomatiquement } from "@/lib/ingestion/auto-validation";

export const maxDuration = 120;

/**
 * Bot de validation automatique — publie/rejette les offres en file sans admin.
 * Appelé par cron ou manuellement.
 *
 *   GET /api/cron/auto-validation
 *   GET /api/cron/auto-validation?limite=1000
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const h = req.headers.get("authorization");
    if (h !== `Bearer ${secret}`) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const limite = Number(url.searchParams.get("limite")) || 500;

  const rapport = await validerAutomatiquement({ limite });
  return NextResponse.json({ ok: true, rapport });
}
