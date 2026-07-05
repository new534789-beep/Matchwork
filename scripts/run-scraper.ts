import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { scraperUneSource } from "@/lib/ingestion/scraper";
import { nombreClesMistral } from "@/lib/ia/mistral";
import { prisma } from "@/lib/prisma";
import type { RapportIngestion } from "@/lib/ingestion/recuperateur";

async function main() {
  console.log("Cles Mistral disponibles:", nombreClesMistral());

  const sources = await prisma.fluxSource.findMany({
    where: { actif: true, type: "scrape" },
  });
  console.log(`Lancement du scraper HTML (${sources.length} sources)...\n`);

  const rapport: RapportIngestion = {
    sources: sources.length,
    sourcesEnPanne: 0,
    itemsLus: 0,
    creees: 0,
    doublons: 0,
    enrichies: 0,
    aValider: 0,
    revueManuelle: 0,
    rejetees: 0,
    totalActives: sources.length,
    details: [],
  };
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const budget = { enrich: 2000 };

  for (const source of sources) {
    try {
      await scraperUneSource(source, { rapport, budget, aujourdhui });
      console.log(`  ✓ ${source.nom} → ${rapport.creees} total`);
    } catch (e: any) {
      rapport.sourcesEnPanne++;
      console.log(`  ✗ ${source.nom} → ${e.message?.slice(0, 80)}`);
    }
  }

  console.log("\n=== RAPPORT SCRAPER HTML ===");
  console.log("Sources:", rapport.sources);
  console.log("Items lus:", rapport.itemsLus);
  console.log("Creees:", rapport.creees);
  console.log("Doublons:", rapport.doublons);
  console.log("En panne:", rapport.sourcesEnPanne);
  console.log("Rejetees:", rapport.rejetees);
}

main().catch((e) => { console.error(e); process.exit(1); });
