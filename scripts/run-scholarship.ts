import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { ingererBourses } from "@/lib/ingestion/scholarship-scraper";
import { nombreClesMistral } from "@/lib/ia/mistral";

async function main() {
  console.log("Cles Mistral disponibles:", nombreClesMistral());
  console.log("Lancement du scraper de bourses...\n");

  const rapport = await ingererBourses();

  console.log("\n=== RAPPORT BOURSES ===");
  console.log("Sources:", rapport.sources);
  console.log("Offres lues:", rapport.offresLues);
  console.log("Creees:", rapport.creees);
  console.log("Doublons:", rapport.doublons);
  console.log("Erreurs:", rapport.erreurs);
  console.log("\nDetails:");
  for (const d of rapport.details) {
    console.log(`  ${d.source} (${d.pays}) → ${d.offres} offres${d.erreur ? " ERR: " + d.erreur : ""}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
