import { NextResponse } from "next/server";
import { ingererAdmissions } from "@/lib/ingestion/admission-scraper";

export const maxDuration = 120;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const h = req.headers.get("authorization");
    if (h !== `Bearer ${secret}`) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }
  }

  const rapport = await ingererAdmissions();
  return NextResponse.json({ ok: true, rapport });
}
