import { NextResponse } from "next/server";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { retirerExpirees } from "@/lib/ingestion/expiration";
import { ingererBourses } from "@/lib/ingestion/scholarship-scraper";
import { ingererOffresATS } from "@/lib/ingestion/ats-scraper";
import { ingererStages } from "@/lib/ingestion/stage-scraper";
import { ingererFormations } from "@/lib/ingestion/formation-scraper";
import { ingererAdmissions } from "@/lib/ingestion/admission-scraper";
import { ingererAppelsProjets } from "@/lib/ingestion/appel-projet-scraper";
import { enrichirBrouillons } from "@/lib/ingestion/enrichissement";

export const maxDuration = 60;

/**
 * Dispatcher cron unifié — chaque jour ingère un lot de sources RSS (brouillon)
 * puis enrichit quelques brouillons via IA. Le tout doit tenir en 60s (Hobby).
 *
 *   Lundi    → FluxSource RSS lot 1 (0-15)
 *   Mardi    → FluxSource RSS lot 2 (15-30) + bourses portails
 *   Mercredi → FluxSource RSS lot 3 (30-50) + emplois ATS
 *   Jeudi    → FluxSource RSS lot 4 (50-70) + stages
 *   Vendredi → FluxSource RSS lot 5 (70-100) + formations
 *   Samedi   → FluxSource RSS lot 6 (100+) + admissions/appels
 *   Dimanche → Expiration + nettoyage
 *
 * Enrichir + auto-validation se lancent via /api/cron/enrichir et
 * /api/cron/auto-validation (endpoints séparés, appelés par cron externe).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force");

  const jour = new Date().getUTCDay(); // 0=dim, 1=lun, ..., 6=sam
  let tache = "";
  let rapport: unknown = null;

  if (force) {
    const bots = force.split(",");
    const rapports: Record<string, unknown> = {};
    for (const bot of bots) {
      switch (bot.trim()) {
        case "bourses": rapports.bourses = await ingererBourses(); break;
        case "stages": rapports.stages = await ingererStages(); break;
        case "emplois-ats": rapports.ats = await ingererOffresATS(); break;
        case "formations": rapports.formations = await ingererFormations(); break;
        case "admissions": rapports.admissions = await ingererAdmissions(); break;
        case "appels-projets": rapports.appelsProjets = await ingererAppelsProjets(); break;
        case "fluxsource": rapports.flux = await ingererToutesLesSources(); break;
      }
    }
    tache = force;
    rapport = rapports;
  } else {
    switch (jour) {
      case 1:
        tache = "flux-lot1";
        rapport = await ingererToutesLesSources({ skip: 0, take: 15 });
        break;
      case 2:
        tache = "flux-lot2+bourses";
        rapport = {
          flux: await ingererToutesLesSources({ skip: 15, take: 15 }),
          bourses: await ingererBourses(),
        };
        break;
      case 3:
        tache = "flux-lot3+emplois";
        rapport = {
          flux: await ingererToutesLesSources({ skip: 30, take: 20 }),
          ats: await ingererOffresATS(),
        };
        break;
      case 4:
        tache = "flux-lot4+stages";
        rapport = {
          flux: await ingererToutesLesSources({ skip: 50, take: 20 }),
          stages: await ingererStages(),
        };
        break;
      case 5:
        tache = "flux-lot5+formations";
        rapport = {
          flux: await ingererToutesLesSources({ skip: 70, take: 30 }),
          formations: await ingererFormations(),
        };
        break;
      case 6:
        tache = "flux-lot6+admissions+appels";
        rapport = {
          flux: await ingererToutesLesSources({ skip: 100, take: 100 }),
          admissions: await ingererAdmissions(),
          appelsProjets: await ingererAppelsProjets(),
        };
        break;
      case 0:
        tache = "nettoyage";
        await retirerExpirees();
        break;
    }
  }

  let enrichissement = null;
  try {
    enrichissement = await enrichirBrouillons(2);
  } catch { /* enrichir is best-effort here */ }

  return NextResponse.json({ ok: true, jour, tache, rapport, enrichissement });
}
