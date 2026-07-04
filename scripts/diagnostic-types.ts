import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  // Comptage par type
  const types = await p.opportunite.groupBy({
    by: ["type"],
    _count: true,
  });
  console.log("=== Répartition par type ===");
  for (const t of types) console.log(`  ${t.type}: ${t._count}`);

  // Chercher des bourses qui sont en STAGE ou EMPLOI
  const malClassees = await p.opportunite.findMany({
    where: {
      type: { in: ["STAGE", "EMPLOI"] },
      intitule: { contains: "bourse" },
    },
    select: { id: true, intitule: true, type: true },
    take: 10,
  });
  console.log(`\n=== STAGE/EMPLOI avec "bourse" dans le titre: ${malClassees.length} ===`);
  for (const o of malClassees) console.log(`  [${o.type}] ${o.intitule.slice(0, 80)}`);

  // Chercher "Vanier" "excellence"
  const vanier = await p.opportunite.findMany({
    where: { intitule: { contains: "Vanier" } },
    select: { id: true, intitule: true, type: true },
    take: 5,
  });
  console.log(`\n=== Offres "Vanier": ${vanier.length} ===`);
  for (const o of vanier) console.log(`  [${o.type}] ${o.intitule.slice(0, 80)}`);

  const excellence = await p.opportunite.findMany({
    where: { intitule: { contains: "excellence" } },
    select: { id: true, intitule: true, type: true },
    take: 5,
  });
  console.log(`\n=== Offres "excellence": ${excellence.length} ===`);
  for (const o of excellence) console.log(`  [${o.type}] ${o.intitule.slice(0, 80)}`);

  // Échantillon des bourses actuelles
  const bourses = await p.opportunite.findMany({
    where: { type: "BOURSE" },
    select: { intitule: true, description: true },
    take: 5,
    orderBy: { premiereVue: "desc" },
  });
  console.log("\n=== 5 dernières bourses ===");
  for (const b of bourses) console.log(`  ${b.intitule.slice(0, 50)} => "${(b.description || "").slice(0, 100)}"`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
