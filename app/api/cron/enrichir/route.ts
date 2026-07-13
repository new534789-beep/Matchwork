import { NextResponse } from "next/server";
import { enrichirBrouillons } from "@/lib/ingestion/enrichissement";

export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limite = parseInt(url.searchParams.get("limite") || "2", 10);

  const enrichissement = await enrichirBrouillons(limite);

  return NextResponse.json({ ok: true, enrichissement });
}
