/**
 * Backfill manuel du canal de candidature + revalidation complète.
 * La logique vit dans lib/ingestion/auto-validation.ts (validerAutomatiquement
 * et nettoyerOffresIncoherentes backfillent déjà le canal avant de juger) —
 * ce script est juste un déclencheur pratique pour lancer une passe complète
 * en local, sans attendre le prochain passage du cron.
 *
 *   npx tsx scripts/backfill-canal-candidature.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "../lib/prisma";
import { validerAutomatiquement } from "../lib/ingestion/auto-validation";

async function main() {
  const rapport = await validerAutomatiquement({ limite: 1000 });
  console.log(`Publiées: ${rapport.publiees} · Rejetées: ${rapport.rejetees} · Ignorées: ${rapport.ignorees}`);
  for (const d of rapport.details) {
    console.log(`  [${d.decision}] "${d.intitule}" => ${d.raison}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
