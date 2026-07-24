/**
 * Lecture seule sur la base DEV — vérifie si les entrées inventées des
 * scripts seed-mega*.ts (SOBEBRA, GDIZ, etc.) existent. Jetable.
 *
 *   npx tsx scripts/check-dev-data.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "@/lib/prisma";

async function main() {
  const suspects = await prisma.opportunite.findMany({
    where: {
      OR: [
        { organisme: { contains: "SOBEBRA", mode: "insensitive" } },
        { organisme: { contains: "GDIZ", mode: "insensitive" } },
        { organisme: { contains: "IB Group", mode: "insensitive" } },
      ],
    },
    select: { id: true, type: true, intitule: true, organisme: true, statut: true, actif: true, slug: true, source: true, createdAt: true },
    take: 30,
  });
  console.log(`DEV DB — ${suspects.length} résultat(s) suspects trouvés :`);
  for (const o of suspects) {
    console.log(`  [${o.statut}/${o.actif ? "actif" : "inactif"}] ${o.intitule} — ${o.organisme} (source: ${o.source}, slug: ${o.slug})`);
  }

  const totalDateLimite2027 = await prisma.opportunite.count({
    where: { dateLimite: { gte: new Date("2027-06-29"), lt: new Date("2027-07-01") } },
  });
  console.log(`\nDEV DB — total offres avec dateLimite ~2027-06-30 : ${totalDateLimite2027}`);

  const totalPubliees = await prisma.opportunite.count({ where: { statut: "publiee", actif: true } });
  console.log(`DEV DB — total offres publiées+actives : ${totalPubliees}`);
}

main().finally(() => prisma.$disconnect());
