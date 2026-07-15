/**
 * Audit en LECTURE SEULE des doublons créés par le bug de dédup jobbenin.com
 * (URL chiffrée Laravel non-stable, voir lib/ingestion/dedup.ts).
 *
 * Regroupe les Opportunite par (organisme normalisé + intitulé normalisé + dateLimite),
 * signature qui reste identique d'un doublon à l'autre même si sourceUrl/dedupKey/hash
 * diffèrent. Affiche les groupes ayant plus d'une ligne — NE MODIFIE RIEN.
 *
 *   npx tsx scripts/audit-doublons-jobbenin.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

async function main() {
  const rows = await prisma.opportunite.findMany({
    select: {
      id: true,
      organisme: true,
      intitule: true,
      dateLimite: true,
      sourceUrl: true,
      createdAt: true,
      actif: true,
      statut: true,
      fluxSourceId: true,
      fluxSource: { select: { nom: true, url: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const groupes = new Map<string, typeof rows>();
  for (const r of rows) {
    const cle = `${normalise(r.organisme)}|${normalise(r.intitule)}|${r.dateLimite ? r.dateLimite.toISOString().slice(0, 10) : "null"}`;
    const g = groupes.get(cle);
    if (g) g.push(r);
    else groupes.set(cle, [r]);
  }

  const doublons = [...groupes.entries()].filter(([, g]) => g.length > 1);
  doublons.sort((a, b) => b[1].length - a[1].length);

  let totalLignesEnTrop = 0;
  console.log(`${doublons.length} groupe(s) de doublons trouvés (sur ${rows.length} offres au total).\n`);

  for (const [cle, g] of doublons) {
    totalLignesEnTrop += g.length - 1;
    console.log(`── ${g.length}× ── ${cle}`);
    for (const r of g) {
      console.log(
        `   id=${r.id}  créé=${r.createdAt.toISOString().slice(0, 10)}  actif=${r.actif}  statut=${r.statut}  ` +
        `source=${r.fluxSource?.nom ?? "?"}  url=${r.sourceUrl?.slice(0, 60)}…`
      );
    }
    console.log();
  }

  console.log(`Total lignes "en trop" (au-delà de la 1ère de chaque groupe) : ${totalLignesEnTrop}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
