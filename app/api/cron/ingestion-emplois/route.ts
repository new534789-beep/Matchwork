import { NextResponse } from "next/server";
import { ingererOffresATS } from "@/lib/ingestion/ats-scraper";

export const maxDuration = 120;

/**
 * Endpoint cron pour l'ingestion des offres d'emploi ATS.
 * Même pattern de sécurité que /api/cron/ingestion.
 *
 *   GET /api/cron/ingestion-emplois
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const rapport = await ingererOffresATS();
  return NextResponse.json({ ok: true, rapport });
}
