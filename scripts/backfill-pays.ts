import { prisma } from "../lib/prisma";
import { detecterPays } from "../lib/pays";

/**
 * Détecte le pays des Opportunite existantes (créées avant l'ajout du champ
 * pays / de l'extension Prisma). Idempotent : ne touche pas les lignes déjà
 * traitées (pays non-undefined en base — NULL est un résultat valide de
 * détection, on ne le confond pas avec "jamais calculé" via un flag séparé).
 */
async function main() {
  const rows = await prisma.opportunite.findMany({
    where: { pays: null },
    select: { id: true, intitule: true, conditions: true, description: true },
  });

  console.log(`${rows.length} offre(s) à traiter (pays actuellement NULL).`);

  const TAILLE_LOT = 20;
  let detectes = 0;
  for (let i = 0; i < rows.length; i += TAILLE_LOT) {
    const lot = rows.slice(i, i + TAILLE_LOT);
    await Promise.all(
      lot.map((o) => {
        const pays = detecterPays(o.intitule, o.conditions, o.description);
        if (!pays) return Promise.resolve();
        detectes++;
        return prisma.opportunite.update({ where: { id: o.id }, data: { pays } });
      })
    );
    console.log(`${Math.min(i + TAILLE_LOT, rows.length)}/${rows.length}`);
  }

  console.log(`${detectes} pays détecté(s) sur ${rows.length} offre(s).`);
}

main().finally(() => prisma.$disconnect());
