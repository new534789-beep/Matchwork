import { prisma } from "../lib/prisma";
import { COMPANIES, FETCHERS } from "../lib/ingestion/ats-scraper";
import { offreAtsPertinenteGeographiquement } from "../lib/ingestion/geo-filtre";

/**
 * Nettoyage rétroactif des offres ATS déjà publiées avant l'ajout du filtre
 * géographique (lib/ingestion/geo-filtre.ts). Le champ `conditions` a été
 * écrasé par l'IA (exigences du poste) pour la plupart des lignes : la
 * localisation brute captée à l'ingestion n'est donc plus en base. On la
 * retrouve en refaisant l'appel aux APIs ATS et en recoupant par `lien`
 * (URL de l'offre, stable).
 *
 * Idempotent, réversible : désactive (actif=false) sans jamais supprimer.
 * Par défaut : dry-run (aucune écriture). `--apply` pour appliquer.
 *
 *   npx tsx scripts/desactiver-offres-hors-zone.ts          (dry-run)
 *   npx tsx scripts/desactiver-offres-hors-zone.ts --apply   (écrit en base)
 */
async function main() {
  const apply = process.argv.includes("--apply");

  console.log(`Récupération des offres fraîches depuis ${COMPANIES.length} entreprises...`);
  const localisationParUrl = new Map<string, string>();
  const CONCURRENCE = 8;
  let idx = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCE }, async () => {
      while (idx < COMPANIES.length) {
        const company = COMPANIES[idx++];
        try {
          const jobs = await FETCHERS[company.platform](company.identifier, company.name);
          for (const j of jobs) {
            if (j.url) localisationParUrl.set(j.url, j.location);
          }
        } catch (e) {
          console.log(`  ${company.name} (${company.platform}) → erreur fetch: ${e instanceof Error ? e.message : e}`);
        }
      }
    })
  );
  console.log(`${localisationParUrl.size} offres actuellement en ligne chez ces entreprises.`);

  const rows = await prisma.opportunite.findMany({
    where: { source: { startsWith: "ATS:" }, actif: true },
    select: { id: true, organisme: true, intitule: true, lien: true },
  });
  console.log(`${rows.length} offre(s) ATS actives en base.`);

  const aDesactiver: typeof rows = [];
  let introuvables = 0;

  for (const row of rows) {
    const location = row.lien ? localisationParUrl.get(row.lien) : undefined;
    if (location === undefined) {
      // Offre disparue du board source (dépubliée) — hors périmètre de ce
      // script, géré par l'expiration normale ; on ne la touche pas ici.
      introuvables++;
      continue;
    }
    if (!offreAtsPertinenteGeographiquement(location)) {
      aDesactiver.push(row);
    }
  }

  console.log(`\n${aDesactiver.length} offre(s) hors zone à désactiver (introuvables sur le board source, ignorées : ${introuvables}) :`);
  for (const r of aDesactiver.slice(0, 50)) {
    console.log(`  - [${r.organisme}] ${r.intitule} (${localisationParUrl.get(r.lien!)})`);
  }
  if (aDesactiver.length > 50) console.log(`  ... et ${aDesactiver.length - 50} de plus`);

  if (!apply) {
    console.log(`\nDry-run — aucune écriture effectuée. Relancer avec --apply pour désactiver ces ${aDesactiver.length} offres.`);
    return;
  }

  let desactivees = 0;
  for (const r of aDesactiver) {
    await prisma.opportunite.update({ where: { id: r.id }, data: { actif: false } });
    desactivees++;
  }
  console.log(`\n${desactivees} offre(s) désactivée(s) (actif=false, réversible).`);
}

main().finally(() => prisma.$disconnect());
