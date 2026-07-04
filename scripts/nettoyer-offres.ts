/**
 * Nettoie les fausses offres (données de démo).
 *   npx tsx scripts/nettoyer-offres.ts              → rapport seulement (rien supprimé)
 *   npx tsx scripts/nettoyer-offres.ts --supprimer  → supprime les offres de démo
 *
 * "Démo / faux" = sources AGREEE (seed) et RSS_DEMO (simulation d'ingestion).
 * On NE touche PAS aux offres réelles : MANUEL (ajout admin), RSS (ingérées), COLLEE (collées).
 */
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

const SOURCES_DEMO = ["AGREEE", "RSS_DEMO"];

async function main() {
  const supprimer = process.argv.includes("--supprimer");
  const tout = process.argv.includes("--tout");

  const groupes = await prisma.opportunite.groupBy({ by: ["source"], _count: { _all: true } });
  console.log("Répartition par source :");
  for (const g of groupes) console.log(`  ${g.source} : ${g._count._all}`);

  const filtre = tout ? {} : { source: { in: SOURCES_DEMO } };
  const aSupprimer = await prisma.opportunite.count({ where: filtre });
  console.log(`\nÀ supprimer (${tout ? "TOUTES" : SOURCES_DEMO.join(", ")}) : ${aSupprimer}`);

  if (!supprimer && !tout) {
    console.log("\n(Rapport seulement — --supprimer = démo, --tout = toutes.)");
    return;
  }

  const res = await prisma.opportunite.deleteMany({ where: filtre });
  console.log(`\nOK : ${res.count} offres supprimées.`);
  const restant = await prisma.opportunite.count();
  console.log(`Offres restantes en base : ${restant}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
