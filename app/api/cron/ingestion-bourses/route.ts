import { NextResponse } from "next/server";
import { ingererBourses } from "@/lib/ingestion/scholarship-scraper";

export const maxDuration = 120;

/**
 * Endpoint cron pour l'ingestion des bourses d'études (scraping portails gouvernementaux/universitaires).
 *
 *   GET /api/cron/ingestion-bourses
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const rapport = await ingererBourses();
  return NextResponse.json({ ok: true, rapport });
}
