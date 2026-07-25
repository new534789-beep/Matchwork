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
import { envoyerRapportCron, type RapportBot } from "@/lib/ingestion/rapport-email";
import { rafraichirOffres } from "@/lib/ingestion/refresh";

export const maxDuration = 60;

/**
 * Nettoyage/entretien du catalogue — expiration, enrichissement de quelques
 * brouillons, rafraîchissement d'offres publiées. Léger et rapide par design
 * (voir historique : la version précédente bundlait aussi l'ingestion RSS +
 * le bot du jour dans le même appel, ce qui dépassait régulièrement les 60s
 * du plan Hobby et faisait échouer le cron ~1 jour sur 2 — l'ingestion RSS et
 * les bots par source vivent maintenant chacun dans leur propre cron GitHub
 * Actions, avec leur propre budget de temps indépendant).
 *
 * `?force=bourses,stages,emplois-ats,formations,admissions,appels-projets,fluxsource`
 * reste disponible pour un déclenchement manuel ponctuel d'un bot précis.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force");

  let tache = "nettoyage";
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
  }

  // Tâches de fin indépendantes (expiration / brouillons / offres publiées) :
  // lancées en parallèle plutôt qu'en série pour rester dans le budget du cron.
  const [expireesResult, enrichissementResult, refreshResult] = await Promise.allSettled([
    retirerExpirees(),
    enrichirBrouillons(2),
    rafraichirOffres(5),
  ]);
  const expirees = expireesResult.status === "fulfilled" ? expireesResult.value : 0;
  const enrichissement = enrichissementResult.status === "fulfilled" ? enrichissementResult.value : null;
  const refresh = refreshResult.status === "fulfilled" ? refreshResult.value : null;

  const botsRapport: RapportBot[] = [];
  function extraireBotStats(nom: string, r: unknown) {
    if (r && typeof r === "object" && "creees" in r) {
      const o = r as { creees: number; doublons: number; erreurs: number; details?: { source: string; erreur?: string }[] };
      const pannes = o.details?.filter((d) => d.erreur).map((d) => d.source) ?? [];
      botsRapport.push({ nom, creees: o.creees, doublons: o.doublons, erreurs: o.erreurs, sourcesEnPanne: pannes });
    }
  }
  if (rapport && typeof rapport === "object") {
    for (const [k, v] of Object.entries(rapport as Record<string, unknown>)) {
      extraireBotStats(k, v);
    }
  }

  try {
    await envoyerRapportCron({ jour: new Date().getUTCDay(), tache, expirees, bots: botsRapport });
  } catch { /* email is best-effort */ }

  return NextResponse.json({ ok: true, tache, rapport, enrichissement, expirees, refresh });
}
