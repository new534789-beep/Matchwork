import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const emplois = await p.opportunite.count({ where: { type: "EMPLOI", statut: "publiee" } });
  const bourses = await p.opportunite.count({ where: { type: "BOURSE", statut: "publiee" } });
  console.log("Emplois publiees:", emplois, "| Bourses publiees:", bourses);

  const faux = await p.opportunite.findMany({
    where: { type: "BOURSE", statut: "publiee", OR: [
      { intitule: { contains: "engineer" } },
      { intitule: { contains: "developer" } },
      { intitule: { contains: "manager" } },
      { intitule: { contains: "analyst" } },
      { intitule: { contains: "intern" } },
      { intitule: { contains: "hiring" } },
      { intitule: { contains: "job" } },
      { intitule: { contains: "recrutement" } },
    ]},
    select: { id: true, intitule: true, source: true },
    take: 15,
  });
  console.log("\nEmplois caches dans BOURSE:", faux.length);
  for (const o of faux.slice(0, 8)) console.log(`  [${o.source}] ${o.intitule.slice(0, 80)}`);

  const descs = await p.opportunite.findMany({
    where: { statut: "publiee", type: "BOURSE" },
    select: { intitule: true, description: true },
    take: 5,
    orderBy: { premiereVue: "desc" },
  });
  console.log("\nDernieres descriptions bourses:");
  for (const d of descs) console.log(`  ${d.intitule.slice(0, 40)} => "${d.description.slice(0, 150)}"`);

  const descsEmploi = await p.opportunite.findMany({
    where: { statut: "publiee", type: "EMPLOI" },
    select: { intitule: true, description: true },
    take: 5,
    orderBy: { premiereVue: "desc" },
  });
  console.log("\nDernieres descriptions emplois:");
  for (const d of descsEmploi) console.log(`  ${d.intitule.slice(0, 40)} => "${d.description.slice(0, 150)}"`);

  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
