/**
 * Ingestion de stages/internships depuis des portails internationaux et africains.
 * Utilise le pipeline générique de base-portal-scraper.ts.
 */
import { scraperPortails, type BasePortalSource, type RapportPortail } from "./base-portal-scraper";

const STAGE_SOURCES: BasePortalSource[] = [
  // ── Afrique de l'Ouest / Panafricain ──
  { name: "BAD Stages & Young Professionals", country: "international", url: "https://www.afdb.org/fr/about-us/careers/internship-and-young-professionals-program", identifier: "bad-stages", language: "fr" },
  { name: "ONU Afrique Stages", country: "international", url: "https://careers.un.org/lbw/home.aspx?viewtype=IP", identifier: "un-intern", language: "en" },
  { name: "PNUD Stages", country: "international", url: "https://www.undp.org/careers/types-of-opportunities/internships", identifier: "pnud-intern", language: "en" },
  { name: "AUF Stages", country: "international", url: "https://www.auf.org/nouvelles/appels-a-candidatures/", identifier: "auf-stages", language: "fr" },
  { name: "CEDEAO / ECOWAS Opportunities", country: "international", url: "https://www.ecowas.int/opportunities/", identifier: "cedeao-stages", language: "en" },

  // ── Canada ──
  { name: "Mitacs Globalink Research Internship", country: "canada", url: "https://www.mitacs.ca/our-programs/globalink-research-internship-students/", identifier: "mitacs-intern", language: "en" },

  // ── France ──
  { name: "Institut Pasteur Careers", country: "france", url: "https://research.pasteur.fr/en/careers/", identifier: "pasteur", language: "en" },
  { name: "INRIA Stages", country: "france", url: "https://jobs.inria.fr/public/classic/en/offres?typesContrat=stage", identifier: "inria", language: "en" },
  { name: "OECD Internship Programme", country: "france", url: "https://www.oecd.org/careers/internship-programme/", identifier: "oecd", language: "en" },
  { name: "1jeune1solution Stages", country: "france", url: "https://www.1jeune1solution.gouv.fr/stages", identifier: "1j1s-stages", language: "fr" },

  // ── Allemagne ──
  { name: "DAAD RISE Germany", country: "germany", url: "https://www.daad.de/rise/en/rise-germany/", identifier: "daad-rise", language: "en" },
  { name: "Max Planck Internships", country: "germany", url: "https://www.mpg.de/careers/internships", identifier: "max-planck", language: "en" },

  // ── Suisse ──
  { name: "CERN Openlab", country: "switzerland", url: "https://openlab.cern/education", identifier: "cern", language: "en" },
  { name: "EPFL Internships", country: "switzerland", url: "https://www.epfl.ch/education/education-and-science-outreach/rolling-out-programs/internships/", identifier: "epfl-intern", language: "en" },
  { name: "WHO Internship", country: "switzerland", url: "https://www.who.int/careers/internships", identifier: "who-intern", language: "en" },

  // ── USA ──
  { name: "World Bank Internship", country: "usa", url: "https://www.worldbank.org/en/about/careers/programs-and-internships/internship", identifier: "wb-intern", language: "en" },

  // ── International ──
  { name: "IAESTE Internships", country: "international", url: "https://iaeste.org/internships", identifier: "iaeste", language: "en" },
];

export const STAGE_SOURCE_COUNT = STAGE_SOURCES.length;

export async function ingererStages(offset = 0, limit?: number): Promise<RapportPortail> {
  const batchSize = limit ?? STAGE_SOURCES.length;
  const isPaginated = batchSize < STAGE_SOURCES.length;
  return scraperPortails(STAGE_SOURCES, {
    type: "STAGE",
    sourcePrefix: "INTERNSHIP",
    maxLiens: isPaginated ? 3 : 30,
    maxEnrich: isPaginated ? 6 : 150,
    sourceOffset: offset,
    sourceLimit: batchSize,
  });
}
