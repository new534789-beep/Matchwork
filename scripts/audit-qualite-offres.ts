import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { prisma } from "@/lib/prisma";

async function main() {
  const offres = await prisma.opportunite.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      intitule: true,
      organisme: true,
      source: true,
      lien: true,
      description: true,
      piecesExigees: true,
      canalCandidature: true,
      cibleCandidature: true,
      langueDetectee: true,
    },
  });

  for (const o of offres) {
    console.log("─".repeat(80));
    console.log(`INTITULÉ: ${o.intitule}`);
    console.log(`ORGANISME: ${o.organisme}`);
    console.log(`SOURCE: ${o.source}`);
    console.log(`LIEN: ${o.lien}`);
    console.log(`LANGUE: ${o.langueDetectee}`);
    console.log(`CANAL: ${o.canalCandidature} → ${o.cibleCandidature?.slice(0, 80) ?? "null"}`);
    console.log(`DESCRIPTION: ${o.description?.slice(0, 150)}...`);
    try {
      const pieces = JSON.parse(o.piecesExigees);
      console.log(`PIECES (${pieces.length}):`);
      for (const p of pieces) {
        console.log(`  - ${p.nom} [${p.categorie}] (${p.type})`);
      }
    } catch {
      console.log(`PIECES: ${o.piecesExigees}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
