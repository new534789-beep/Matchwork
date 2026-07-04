/**
 * Revert les bourses mal reclassées par fix-classification.ts.
 * Toute offre STAGE/EMPLOI dont le titre contient "bourse", "scholarship",
 * "fellowship", "grant", "d'excellence" etc. est remise en BOURSE.
 *
 *   npx tsx scripts/revert-faux-positifs.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const MOTS_BOURSE = [
  "bourse", "scholarship", "fellowship", "grant", "funding",
  "d'excellence", "d'exemption", "d'accueil", "d'études",
];

async function main() {
  const malClassees = await p.opportunite.findMany({
    where: { type: { in: ["STAGE", "EMPLOI"] } },
    select: { id: true, intitule: true, type: true },
  });

  let revertees = 0;
  const details: string[] = [];

  for (const o of malClassees) {
    const titre = o.intitule.toLowerCase();
    if (MOTS_BOURSE.some(m => titre.includes(m))) {
      await p.opportunite.update({
        where: { id: o.id },
        data: { type: "BOURSE" },
      });
      revertees++;
      details.push(`BOURSE ← [${o.type}] "${o.intitule.slice(0, 70)}"`);
    }
  }

  console.log(`Offres vérifiées: ${malClassees.length}`);
  console.log(`Revertées en BOURSE: ${revertees}`);
  details.forEach(d => console.log(`  ${d}`));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
