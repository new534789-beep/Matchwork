// Test du pipeline complet scholarship-scraper
import { ingererBourses } from "../lib/ingestion/scholarship-scraper";

async function main() {
  console.log("Lancement ingestion bourses (pipeline complet)...");
  const rapport = await ingererBourses();
  console.log(JSON.stringify(rapport, null, 2));
}

main().catch(e => {
  console.error("Échec:", e instanceof Error ? e.message : e);
  process.exit(1);
});
