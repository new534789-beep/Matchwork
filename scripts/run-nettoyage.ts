import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { nettoyerOffresIncoherentes } from "../lib/ingestion/auto-validation";

async function main() {
  console.log("Lancement du nettoyage des offres publiées...\n");
  const result = await nettoyerOffresIncoherentes();
  console.log(`Offres retirées: ${result.retirees}`);
  for (const d of result.details) {
    console.log(`  [${d.decision}] "${d.intitule}" => ${d.raison}`);
  }
  if (result.retirees === 0) {
    console.log("\nAucune offre problématique trouvée. Le fil est propre.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
