import { NextResponse } from "next/server";
import { ingererFormations } from "@/lib/ingestion/formation-scraper";

export const maxDuration = 120;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const h = req.headers.get("authorization");
    if (h !== `Bearer ${secret}`) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }
  }

  const rapport = await ingererFormations();
  return NextResponse.json({ ok: true, rapport });
}
