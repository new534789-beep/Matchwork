import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";

async function main() {
  console.log("MISTRAL_API_KEY present:", !!process.env.MISTRAL_API_KEY);
  console.log("Lancement de l'ingestion...\n");

  const rapport = await ingererToutesLesSources();

  console.log("\n=== RAPPORT INGESTION ===");
  console.log("Sources traitees:", rapport.sources);
  console.log("Items lus:", rapport.itemsLus);
  console.log("Creees:", rapport.creees);
  console.log("Enrichies (date trouvee):", rapport.enrichies);
  console.log("A valider:", rapport.aValider);
  console.log("Doublons:", rapport.doublons);
  console.log("Rejetees:", rapport.rejetees);
  console.log("Sources en panne:", rapport.sourcesEnPanne);
  console.log("\nDetails:");
  for (const d of rapport.details) {
    console.log(`  ${d.source} → ${d.etat} (${d.creees} creees)${d.erreur ? " ERR: " + d.erreur : ""}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
