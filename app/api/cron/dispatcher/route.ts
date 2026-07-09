import { NextResponse } from "next/server";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { retirerExpirees } from "@/lib/ingestion/expiration";
import { ingererBourses } from "@/lib/ingestion/scholarship-scraper";
import { ingererOffresATS } from "@/lib/ingestion/ats-scraper";
import { ingererStages } from "@/lib/ingestion/stage-scraper";
import { ingererFormations } from "@/lib/ingestion/formation-scraper";
import { ingererAdmissions } from "@/lib/ingestion/admission-scraper";
import { ingererAppelsProjets } from "@/lib/ingestion/appel-projet-scraper";
import { validerAutomatiquement } from "@/lib/ingestion/auto-validation";

export const maxDuration = 120;

/**
 * Dispatcher cron unifié — alterne les tâches d'ingestion par jour de la semaine.
 *
 *   Lundi    → FluxSource RSS/scrape + expiration
 *   Mardi    → Bourses portails
 *   Mercredi → Emplois ATS
 *   Jeudi    → Stages
 *   Vendredi → Formations
 *   Samedi   → Admissions
 *   Dimanche → Auto-validation + nettoyage
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const jour = new Date().getUTCDay(); // 0=dim, 1=lun, ..., 6=sam
  let tache = "";
  let rapport: unknown = null;

  switch (jour) {
    case 1: // Lundi
      tache = "fluxsource";
      rapport = await ingererToutesLesSources();
      await retirerExpirees();
      break;
    case 2: // Mardi
      tache = "bourses";
      rapport = await ingererBourses();
      break;
    case 3: // Mercredi
      tache = "emplois-ats";
      rapport = await ingererOffresATS();
      break;
    case 4: // Jeudi
      tache = "stages";
      rapport = await ingererStages();
      break;
    case 5: // Vendredi
      tache = "formations";
      rapport = await ingererFormations();
      break;
    case 6: // Samedi
      tache = "admissions+appels-projets";
      rapport = { admissions: await ingererAdmissions(), appelsProjets: await ingererAppelsProjets() };
      break;
    case 0: // Dimanche
      tache = "nettoyage";
      await retirerExpirees();
      break;
  }

  const validation = await validerAutomatiquement();

  return NextResponse.json({ ok: true, jour, tache, rapport, validation });
}
