import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
 * Calcule le lot RSS (skip/take) du jour à partir du nombre RÉEL de sources
 * actives, plutôt que des bornes fixes qui deviennent incomplètes à mesure que
 * le catalogue de sources grossit. Répartit les sources sur 6 lots (lun-sam) ;
 * `jourIndex` va de 0 (lundi) à 5 (samedi). Garantit que TOUTE source active
 * est visitée au moins une fois par semaine, quel que soit `totalActives`.
 */
async function calculerLotDuJour(jourIndex: number): Promise<{ skip: number; take: number }> {
  const totalActives = await prisma.fluxSource.count({ where: { actif: true } });
  const taille = Math.max(1, Math.ceil(totalActives / 6));
  return { skip: jourIndex * taille, take: taille };
}

/**
 * Dispatcher cron unifié — chaque jour ingère un lot de sources RSS (brouillon)
 * puis enrichit quelques brouillons via IA. Le tout doit tenir en 60s (Hobby).
 *
 *   Lundi    → FluxSource RSS lot 1/6
 *   Mardi    → FluxSource RSS lot 2/6 + bourses portails
 *   Mercredi → FluxSource RSS lot 3/6 + emplois ATS
 *   Jeudi    → FluxSource RSS lot 4/6 + stages
 *   Vendredi → FluxSource RSS lot 5/6 + formations
 *   Samedi   → FluxSource RSS lot 6/6 + admissions/appels
 *   Dimanche → Expiration + nettoyage
 *
 * Les lots sont recalculés à partir du nombre actuel de sources actives (voir
 * calculerLotDuJour) : si le catalogue de sources grossit, la taille de chaque
 * lot grossit avec lui — plus de source jamais visitée par simple oubli de
 * mise à jour des bornes.
 *
 * Enrichir + auto-validation tournent maintenant via des crons dédiés,
 * plusieurs fois par jour (voir vercel.json), en plus de ce dispatcher.
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
        rapport = await ingererToutesLesSources(await calculerLotDuJour(0));
        break;
      case 2: {
        tache = "flux-lot2+bourses";
        const [flux, bourses] = await Promise.all([
          ingererToutesLesSources(await calculerLotDuJour(1)),
          ingererBourses(),
        ]);
        rapport = { flux, bourses };
        break;
      }
      case 3: {
        tache = "flux-lot3+emplois";
        const [flux, ats] = await Promise.all([
          ingererToutesLesSources(await calculerLotDuJour(2)),
          ingererOffresATS(),
        ]);
        rapport = { flux, ats };
        break;
      }
      case 4: {
        tache = "flux-lot4+stages";
        const [flux, stages] = await Promise.all([
          ingererToutesLesSources(await calculerLotDuJour(3)),
          ingererStages(),
        ]);
        rapport = { flux, stages };
        break;
      }
      case 5: {
        tache = "flux-lot5+formations";
        const [flux, formations] = await Promise.all([
          ingererToutesLesSources(await calculerLotDuJour(4)),
          ingererFormations(),
        ]);
        rapport = { flux, formations };
        break;
      }
      case 6: {
        tache = "flux-lot6+admissions+appels";
        const [flux, admissions, appelsProjets] = await Promise.all([
          ingererToutesLesSources(await calculerLotDuJour(5)),
          ingererAdmissions(),
          ingererAppelsProjets(),
        ]);
        rapport = { flux, admissions, appelsProjets };
        break;
      }
      case 0:
        tache = "nettoyage";
        await retirerExpirees();
        break;
    }
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
    if ("creees" in (rapport as object)) extraireBotStats(tache, rapport);
  }

  try {
    await envoyerRapportCron({ jour, tache, expirees, bots: botsRapport });
  } catch { /* email is best-effort */ }

  return NextResponse.json({ ok: true, jour, tache, rapport, enrichissement, expirees, refresh });
}
