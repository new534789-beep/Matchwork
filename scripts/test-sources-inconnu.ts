/**
 * Teste toutes les sources actives (RSS + scrape) sur la base DEV — met à jour
 * etat ok/panne comme le ferait le cron réel, et remonte combien des sources
 * "inconnu" ont basculé en ok. Jetable.
 *
 *   npx tsx -r dotenv/config scripts/test-sources-inconnu.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "@/lib/prisma";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";

async function main() {
  const avant = await prisma.fluxSource.findMany({
    where: { actif: true, etat: "inconnu" },
    select: { id: true, nom: true },
  });
  console.log(`${avant.length} source(s) "inconnu" avant le passage.`);

  console.log("Lancement de ingererToutesLesSources() sur TOUTES les sources actives...");
  const rapport = await ingererToutesLesSources();
  console.log(`\n=== Rapport global ===`);
  console.log(`Sources traitées: ${rapport.sources} (total actives: ${rapport.totalActives})`);
  console.log(`En panne: ${rapport.sourcesEnPanne}`);
  console.log(`Items lus: ${rapport.itemsLus}, créées: ${rapport.creees}, doublons: ${rapport.doublons}`);

  const idsAvant = new Set(avant.map((s) => s.id));
  const apres = await prisma.fluxSource.findMany({
    where: { id: { in: [...idsAvant] } },
    select: { id: true, nom: true, etat: true, message: true },
  });
  const passesOk = apres.filter((s) => s.etat === "ok");
  const restePanne = apres.filter((s) => s.etat === "panne");
  const resteInconnu = apres.filter((s) => s.etat === "inconnu");

  console.log(`\n=== Sources "inconnu" avant → après ===`);
  console.log(`Passées OK: ${passesOk.length}`);
  passesOk.forEach((s) => console.log(`  ✅ ${s.nom}`));
  console.log(`Passées en panne: ${restePanne.length}`);
  restePanne.forEach((s) => console.log(`  ❌ ${s.nom} — ${s.message?.slice(0, 100) ?? ""}`));
  console.log(`Toujours inconnu (non traitées ce passage): ${resteInconnu.length}`);
}

main().finally(() => prisma.$disconnect());
