import { prisma } from "../lib/prisma";
import { detecterModalite } from "../lib/modalite";

/**
 * Détecte la modalité des Opportunite existantes qui n'en ont pas encore.
 * Idempotent au même titre que backfill-pays.ts : null = pas détecté, peut
 * être retraité sans risque si la liste de signaux s'améliore plus tard.
 */
async function main() {
  const rows = await prisma.opportunite.findMany({
    where: { modalite: null },
    select: { id: true, intitule: true, conditions: true, description: true },
  });

  console.log(`${rows.length} offre(s) à traiter (modalite actuellement NULL).`);

  const TAILLE_LOT = 20;
  let detectees = 0;
  for (let i = 0; i < rows.length; i += TAILLE_LOT) {
    const lot = rows.slice(i, i + TAILLE_LOT);
    await Promise.all(
      lot.map((o) => {
        const modalite = detecterModalite(o.intitule, o.conditions, o.description);
        if (!modalite) return Promise.resolve();
        detectees++;
        return prisma.opportunite.update({ where: { id: o.id }, data: { modalite } });
      })
    );
    console.log(`${Math.min(i + TAILLE_LOT, rows.length)}/${rows.length}`);
  }

  console.log(`${detectees} modalité(s) détectée(s) sur ${rows.length} offre(s).`);
}

main().finally(() => prisma.$disconnect());
