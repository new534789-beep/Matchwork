/**
 * Lance tous les bots d'ingestion en local contre Neon.
 * Usage:  npx tsx scripts/run-all-bots-local.ts
 */

// ── Forcer Neon AVANT tout import Prisma ──
const NEON = "postgresql://neondb_owner:npg_RDgAmsG3nZi9@ep-empty-grass-as9bylpg.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=2";
process.env.DATABASE_URL = NEON;
process.env.DIRECT_URL = NEON;

import { readFileSync } from "fs";
if (!process.env.MISTRAL_API_KEY) {
  try {
    const envLocal = readFileSync(".env.local", "utf-8");
    for (const line of envLocal.split("\n")) {
      const m = line.match(/^(MISTRAL_API_KEY|GEMINI_API_KEY)\s*=\s*"?([^"]+)"?/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  } catch { /* pas de .env.local */ }
}

import { ingererToutesLesSources } from "../lib/ingestion/recuperateur";
import { ingererBourses } from "../lib/ingestion/scholarship-scraper";
import { ingererOffresATS } from "../lib/ingestion/ats-scraper";
import { ingererStages } from "../lib/ingestion/stage-scraper";
import { ingererFormations } from "../lib/ingestion/formation-scraper";
import { ingererAdmissions } from "../lib/ingestion/admission-scraper";
import { ingererAppelsProjets } from "../lib/ingestion/appel-projet-scraper";
import { retirerExpirees } from "../lib/ingestion/expiration";
import { rafraichirOffres } from "../lib/ingestion/refresh";

type Bot = { nom: string; fn: () => Promise<unknown> };

const BOTS: Bot[] = [
  { nom: "Expiration", fn: async () => ({ expirees: await retirerExpirees() }) },
  { nom: "RSS/FluxSource", fn: ingererToutesLesSources },
  { nom: "Bourses portails", fn: ingererBourses },
  { nom: "Emplois ATS", fn: ingererOffresATS },
  { nom: "Stages", fn: ingererStages },
  { nom: "Formations", fn: ingererFormations },
  { nom: "Admissions", fn: ingererAdmissions },
  { nom: "Appels à projets", fn: ingererAppelsProjets },
  { nom: "Refresh offres publiées", fn: () => rafraichirOffres(10) },
];

async function main() {
  console.log(`\nLancement de ${BOTS.length} bots d'ingestion...\n`);

  for (const bot of BOTS) {
    const debut = Date.now();
    console.log(`── ${bot.nom} ──`);
    try {
      const rapport = await bot.fn();
      const duree = ((Date.now() - debut) / 1000).toFixed(1);
      console.log(`   OK en ${duree}s`);
      const txt = JSON.stringify(rapport, null, 2);
      console.log(txt.length > 600 ? txt.slice(0, 600) + "..." : txt);
    } catch (e) {
      const duree = ((Date.now() - debut) / 1000).toFixed(1);
      console.error(`   ERREUR en ${duree}s:`, e instanceof Error ? e.message : e);
    }
    console.log();
  }

  console.log("Termine.");
  process.exit(0);
}

main();
