/**
 * Lecture seule sur la prod — vérifie si les entrées inventées des scripts
 * seed-mega*.ts (SOBEBRA, GDIZ, etc.) sont visibles publiquement. Jetable.
 *
 *   npx tsx scripts/check-prod-data.ts
 */
import { config } from "dotenv";
config({ path: ".env.prod-fresh", override: true });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const suspects = await prisma.opportunite.findMany({
    where: {
      OR: [
        { organisme: { contains: "SOBEBRA", mode: "insensitive" } },
        { organisme: { contains: "GDIZ", mode: "insensitive" } },
        { organisme: { contains: "IB Group", mode: "insensitive" } },
        { intitule: { contains: "2027", mode: "insensitive" } },
      ],
    },
    select: { id: true, type: true, intitule: true, organisme: true, statut: true, actif: true, slug: true, source: true, createdAt: true },
    take: 30,
  });
  console.log(`${suspects.length} résultat(s) suspects trouvés :`);
  for (const o of suspects) {
    console.log(`  [${o.statut}/${o.actif ? "actif" : "inactif"}] ${o.intitule} — ${o.organisme} (source: ${o.source}, slug: ${o.slug})`);
  }

  const totalDateLimite2027 = await prisma.opportunite.count({
    where: { dateLimite: { gte: new Date("2027-06-29"), lt: new Date("2027-07-01") } },
  });
  console.log(`\nTotal offres avec dateLimite exactement 2027-06-30 (+/-1j) : ${totalDateLimite2027}`);

  const totalPubliees = await prisma.opportunite.count({ where: { statut: "publiee", actif: true } });
  console.log(`Total offres publiées+actives (toutes) : ${totalPubliees}`);
}

main().finally(() => prisma.$disconnect());
