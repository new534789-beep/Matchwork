import { PrismaClient } from "@prisma/client";
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function main() {
  const parStatut = await prisma.opportunite.groupBy({ by: ["statut"], _count: { _all: true } });
  console.log("Par statut :");
  for (const g of parStatut) console.log(`  ${g.statut} : ${g._count._all}`);

  const enFile = await prisma.opportunite.count({ where: { statut: { in: ["a_valider", "revue_manuelle"] } } });
  const expireesEnFile = await prisma.opportunite.count({
    where: { statut: { in: ["a_valider", "revue_manuelle"] }, dateLimite: { lt: new Date() } },
  });
  console.log(`\nDans la file de validation : ${enFile}`);
  console.log(`Dont avec une date déjà passée : ${expireesEnFile}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
