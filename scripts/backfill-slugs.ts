import { prisma } from "../lib/prisma";
import { genererSlugOpportunite } from "../lib/slug";

/**
 * Génère un slug SEO pour chaque Opportunite existante qui n'en a pas encore
 * (rows créées avant l'ajout du champ slug / de l'extension Prisma).
 * Idempotent : ne touche pas les lignes qui ont déjà un slug.
 */
async function main() {
  const sansSlug = await prisma.opportunite.findMany({
    where: { slug: null },
    select: { id: true, intitule: true, organisme: true },
  });

  console.log(`${sansSlug.length} offre(s) sans slug à backfiller.`);

  const TAILLE_LOT = 20;
  let ok = 0;
  for (let i = 0; i < sansSlug.length; i += TAILLE_LOT) {
    const lot = sansSlug.slice(i, i + TAILLE_LOT);
    await Promise.all(
      lot.map((o) =>
        prisma.opportunite.update({
          where: { id: o.id },
          data: { slug: genererSlugOpportunite(o.intitule, o.organisme) },
        })
      )
    );
    ok += lot.length;
    console.log(`${ok}/${sansSlug.length}`);
  }

  console.log(`${ok} slug(s) généré(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
