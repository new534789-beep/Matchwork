/**
 * Ingestion de stages/internships depuis des portails occidentaux.
 * Utilise le pipeline générique de base-portal-scraper.ts.
 */
import { scraperPortails, type BasePortalSource, type RapportPortail } from "./base-portal-scraper";

const STAGE_SOURCES: BasePortalSource[] = [
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
  { name: "ETH Zurich Summer Research", country: "switzerland", url: "https://inf.ethz.ch/studies/summer-research-fellowship.html", identifier: "eth-summer", language: "en" },
  { name: "WHO Internship", country: "switzerland", url: "https://www.who.int/careers/internships", identifier: "who-intern", language: "en" },

  // ── USA ──
  { name: "Smithsonian Internships", country: "usa", url: "https://www.si.edu/ofi", identifier: "smithsonian", language: "en" },
  { name: "World Bank Internship", country: "usa", url: "https://www.worldbank.org/en/about/careers/programs-and-internships/internship", identifier: "wb-intern", language: "en" },

  // ── International ──
  { name: "IAESTE Internships", country: "international", url: "https://iaeste.org/internships", identifier: "iaeste", language: "en" },
  { name: "UN Internships", country: "international", url: "https://careers.un.org/lbw/home.aspx?viewtype=IP", identifier: "un-intern", language: "en" },
];

export async function ingererStages(): Promise<RapportPortail> {
  return scraperPortails(STAGE_SOURCES, {
    type: "STAGE",
    sourcePrefix: "INTERNSHIP",
  });
}
