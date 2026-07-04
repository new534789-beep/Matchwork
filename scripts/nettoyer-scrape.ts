/**
 * Supprime les offres issues du SCRAPING qui n'ont pas de date limite.
 * (Règle métier : une offre scrapée n'est gardée que si sa date limite est
 * connue ET non dépassée.)
 *   npx tsx scripts/nettoyer-scrape.ts
 */
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function main() {
  const sansDate = await prisma.opportunite.deleteMany({ where: { source: "SCRAPE", dateLimite: null } });
  console.log(`OK : ${sansDate.count} offre(s) scrapée(s) sans date supprimée(s).`);

  // Par sécurité : retirer aussi une éventuelle scrapée à date déjà dépassée.
  const dejaPassees = await prisma.opportunite.deleteMany({ where: { source: "SCRAPE", dateLimite: { lt: new Date() } } });
  if (dejaPassees.count) console.log(`+ ${dejaPassees.count} scrapée(s) à date dépassée supprimée(s).`);

  const restant = await prisma.opportunite.count({ where: { source: "SCRAPE" } });
  console.log(`Offres scrapées restantes (avec date future) : ${restant}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
