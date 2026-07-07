import { NextResponse } from "next/server";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { ingererBourses } from "@/lib/ingestion/scholarship-scraper";
import { ingererOffresATS } from "@/lib/ingestion/ats-scraper";
import { ingererStages } from "@/lib/ingestion/stage-scraper";
import { ingererFormations } from "@/lib/ingestion/formation-scraper";
import { ingererAdmissions } from "@/lib/ingestion/admission-scraper";

export const maxDuration = 60;

const RUN_KEY = "matchwork-run-all-2026";

function checkAuth(req: Request): boolean {
  const url = new URL(req.url);
  if (url.searchParams.get("key") === RUN_KEY) return true;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  if (!secret) return true;
  return false;
}

const BOTS: Record<string, () => Promise<unknown>> = {
  rss: () => ingererToutesLesSources(),
  bourses: () => ingererBourses(),
  ats: () => ingererOffresATS(),
  stages: () => ingererStages(),
  formations: () => ingererFormations(),
  admissions: () => ingererAdmissions(),
};

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const bot = url.searchParams.get("bot");

  if (bot && BOTS[bot]) {
    try {
      const rapport = await BOTS[bot]();
      return NextResponse.json({ ok: true, bot, rapport });
    } catch (e) {
      return NextResponse.json({ ok: false, bot, erreur: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Spécifiez ?bot=rss|bourses|ats|stages|formations|admissions",
    bots: Object.keys(BOTS),
  });
}
