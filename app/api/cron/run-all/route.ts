import { NextResponse } from "next/server";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { ingererBourses } from "@/lib/ingestion/scholarship-scraper";
import { ingererOffresATS } from "@/lib/ingestion/ats-scraper";
import { ingererStages } from "@/lib/ingestion/stage-scraper";
import { ingererFormations } from "@/lib/ingestion/formation-scraper";
import { ingererAdmissions } from "@/lib/ingestion/admission-scraper";

export const maxDuration = 300;

const RUN_KEY = "matchwork-run-all-2026";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (key !== RUN_KEY) {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const h = req.headers.get("authorization");
      if (h !== `Bearer ${secret}`) {
        return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
      }
    }
  }

  const resultats: Record<string, unknown> = {};

  try { resultats.rss = await ingererToutesLesSources(); } catch (e) { resultats.rss = { erreur: String(e) }; }
  try { resultats.bourses = await ingererBourses(); } catch (e) { resultats.bourses = { erreur: String(e) }; }
  try { resultats.ats = await ingererOffresATS(); } catch (e) { resultats.ats = { erreur: String(e) }; }
  try { resultats.stages = await ingererStages(); } catch (e) { resultats.stages = { erreur: String(e) }; }
  try { resultats.formations = await ingererFormations(); } catch (e) { resultats.formations = { erreur: String(e) }; }
  try { resultats.admissions = await ingererAdmissions(); } catch (e) { resultats.admissions = { erreur: String(e) }; }

  return NextResponse.json({ ok: true, resultats });
}
