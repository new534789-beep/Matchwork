import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { validerAutomatiquement } from "@/lib/ingestion/auto-validation";

async function main() {
  console.log("Lancement du bot de validation...\n");
  const rapport = await validerAutomatiquement({ limite: 1000 });

  console.log("=== RAPPORT VALIDATION ===");
  console.log("Traitees:", rapport.traitees);
  console.log("Publiees:", rapport.publiees);
  console.log("Rejetees:", rapport.rejetees);
  console.log("Ignorees:", rapport.ignorees);
  console.log("\nDetails:");
  for (const d of rapport.details) {
    console.log(`  ${d.decision === "publiee" ? "OK" : "XX"} ${d.intitule.slice(0, 65)} → ${d.raison}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
