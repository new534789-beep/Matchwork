/**
 * Ingestion DIRECTE (sans passer par le serveur HTTP).
 * Traite les sources par lots de 5 pour éviter les timeouts.
 *
 *   DATABASE_URL="file:./dev.db" npx tsx scripts/ingest-direct.ts
 */
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";

const prisma = new PrismaClient();
const LOT = 5;

async function main() {
  const total = await prisma.fluxSource.count({ where: { actif: true } });
  console.log(`Sources actives : ${total}`);

  // On importe dynamiquement pour que le DATABASE_URL soit déjà positionné
  const { ingererToutesLesSources } = await import("@/lib/ingestion/recuperateur");

  let offset = 0;
  let totalCreees = 0;
  let totalDoublons = 0;
  let totalPannes = 0;

  while (offset < total) {
    console.log(`\n── Lot ${offset + 1}→${Math.min(offset + LOT, total)} sur ${total} ──`);
    try {
      const rapport = await ingererToutesLesSources({ skip: offset, take: LOT });
      totalCreees += rapport.creees;
      totalDoublons += rapport.doublons;
      totalPannes += rapport.sourcesEnPanne;

      for (const d of rapport.details) {
        const icon = d.etat === "ok" ? "OK" : "PANNE";
        console.log(`  [${icon}] ${d.source} → ${d.creees} nouvelles${d.erreur ? ` (${d.erreur.slice(0, 80)})` : ""}`);
      }
      console.log(`  Sous-total : +${rapport.creees} créées, ${rapport.doublons} doublons, ${rapport.enrichies} enrichies IA`);
    } catch (e) {
      console.error(`  ERREUR lot ${offset}: ${e instanceof Error ? e.message : e}`);
    }
    offset += LOT;
  }

  // Expirer les offres dont la date est passée
  const expirees = await prisma.opportunite.updateMany({
    where: { statut: "publiee", dateLimite: { lt: new Date() } },
    data: { statut: "expiree", actif: false },
  });

  const stats = {
    publiees: await prisma.opportunite.count({ where: { statut: "publiee" } }),
    a_valider: await prisma.opportunite.count({ where: { statut: "a_valider" } }),
    revue_manuelle: await prisma.opportunite.count({ where: { statut: "revue_manuelle" } }),
    expirees: await prisma.opportunite.count({ where: { statut: "expiree" } }),
    rejetees: await prisma.opportunite.count({ where: { statut: "rejetee" } }),
  };

  console.log(`\n════════════════════════════════════════`);
  console.log(`RÉSUMÉ INGESTION`);
  console.log(`  Nouvelles créées    : ${totalCreees}`);
  console.log(`  Doublons ignorés    : ${totalDoublons}`);
  console.log(`  Sources en panne    : ${totalPannes}`);
  console.log(`  Offres expirées     : ${expirees.count}`);
  console.log(`\nÉTAT DE LA BASE :`);
  console.log(`  Publiées            : ${stats.publiees}`);
  console.log(`  À valider           : ${stats.a_valider}`);
  console.log(`  Revue manuelle      : ${stats.revue_manuelle}`);
  console.log(`  Expirées            : ${stats.expirees}`);
  console.log(`  Rejetées            : ${stats.rejetees}`);
  console.log(`════════════════════════════════════════`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
