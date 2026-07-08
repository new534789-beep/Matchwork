import { NextResponse } from "next/server";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { ingererBourses } from "@/lib/ingestion/scholarship-scraper";
import { ingererOffresATS } from "@/lib/ingestion/ats-scraper";
import { ingererStages } from "@/lib/ingestion/stage-scraper";
import { ingererFormations } from "@/lib/ingestion/formation-scraper";
import { ingererAdmissions } from "@/lib/ingestion/admission-scraper";
import { ingererAppelsProjets } from "@/lib/ingestion/appel-projet-scraper";

export const maxDuration = 60;

function checkAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const BOTS: Record<string, () => Promise<unknown>> = {
  rss: () => ingererToutesLesSources(),
  bourses: () => ingererBourses(),
  ats: () => ingererOffresATS(),
  stages: () => ingererStages(),
  formations: () => ingererFormations(),
  admissions: () => ingererAdmissions(),
  "appels-projets": () => ingererAppelsProjets(),
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
