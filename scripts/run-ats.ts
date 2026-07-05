import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { ingererOffresATS } from "@/lib/ingestion/ats-scraper";
import { nombreClesMistral } from "@/lib/ia/mistral";

async function main() {
  console.log("Cles Mistral disponibles:", nombreClesMistral());
  console.log("Lancement du scraper ATS massif...\n");

  const rapport = await ingererOffresATS((msg) => console.log(msg));

  console.log("\n=== RAPPORT ATS ===");
  console.log("Entreprises:", rapport.entreprises);
  console.log("Offres lues:", rapport.offresLues);
  console.log("Creees:", rapport.creees);
  console.log("Doublons:", rapport.doublons);
  console.log("Erreurs:", rapport.erreurs);
}

main().catch((e) => { console.error(e); process.exit(1); });
