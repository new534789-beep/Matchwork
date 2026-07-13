import { NextResponse } from "next/server";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { retirerExpirees } from "@/lib/ingestion/expiration";

export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  if (action === "expirer") {
    const expirees = await retirerExpirees();
    return NextResponse.json({ ok: true, expirees });
  }

  const skip = parseInt(url.searchParams.get("skip") || "0", 10);
  const take = parseInt(url.searchParams.get("take") || "5", 10);
  const rapport = await ingererToutesLesSources({ skip, take });
  return NextResponse.json({ ok: true, rapport });
}
