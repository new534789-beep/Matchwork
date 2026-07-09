import { NextResponse } from "next/server";
import { ingererStages, STAGE_SOURCE_COUNT } from "@/lib/ingestion/stage-scraper";
import { validerAutomatiquement } from "@/lib/ingestion/auto-validation";

export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const limit = parseInt(url.searchParams.get("limit") || "1", 10);

  const rapport = await ingererStages(offset, limit);
  const validation = await validerAutomatiquement();
  const hasMore = offset + limit < STAGE_SOURCE_COUNT;

  return NextResponse.json({
    ok: true,
    rapport,
    validation,
    pagination: { offset, limit, total: STAGE_SOURCE_COUNT, hasMore },
  });
}
