import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { recupererContenuPage } from "@/lib/ingestion/contenu-page";
import { extraireOffre, iaDisponible } from "@/lib/ia/extraction-offre";

async function main() {
  // Test SmartRecruiters URL format
  const testUrls = [
    "https://jobs.smartrecruiters.com/BoschGroup/744000057227858",
    "https://jobs.smartrecruiters.com/Continental/744000056926123",
  ];

  // First, fetch a real SR listing to see URL format
  const res = await fetch("https://api.smartrecruiters.com/v1/companies/BoschGroup/postings?limit=3");
  const data = await res.json();
  console.log("SR API response keys:", Object.keys(data));
  console.log("Total found:", data.totalFound);

  if (data.content?.length > 0) {
    const job = data.content[0];
    console.log("\nFirst job:");
    console.log("  name:", job.name);
    console.log("  ref:", job.ref);
    console.log("  company:", job.company?.name);
    console.log("  location:", job.location?.city, job.location?.country);

    // Try to fetch the page
    console.log("\nFetching page:", job.ref);
    const contenu = await recupererContenuPage(job.ref);
    console.log("Content length:", contenu?.length ?? 0);
    console.log("Content preview:", contenu?.slice(0, 200));

    if (contenu && iaDisponible()) {
      console.log("\nRunning IA extraction...");
      const offre = await extraireOffre(`${job.name}\n\n${contenu}`);
      console.log("Offre:", offre ? "OK" : "FAILED");
      if (offre) {
        console.log("  pieces:", JSON.stringify(offre.piecesExigees));
        console.log("  canal:", offre.canalCandidature);
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
