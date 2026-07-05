/**
 * Ingestion d'admissions universitaires depuis des portails occidentaux.
 * Utilise le pipeline générique de base-portal-scraper.ts.
 */
import { scraperPortails, type BasePortalSource, type RapportPortail } from "./base-portal-scraper";

const ADMISSION_SOURCES: BasePortalSource[] = [
  // ── France ──
  { name: "Campus France Études", country: "france", url: "https://www.campusfrance.org/fr/etudier-en-france", identifier: "campusfr-etudes", language: "fr" },
  { name: "MonMaster", country: "france", url: "https://www.monmaster.gouv.fr/", identifier: "monmaster", language: "fr" },
  { name: "Eiffel Excellence Programme", country: "france", url: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence", identifier: "eiffel", language: "en" },
  { name: "Campus Bourses (CNOUS)", country: "france", url: "https://www.campusbourses.campusfrance.org/", identifier: "campus-bourses", language: "fr" },
  { name: "Study in France", country: "france", url: "https://www.studying-in-france.org/", identifier: "study-france", language: "en" },

  // ── Allemagne ──
  { name: "DAAD Study in Germany", country: "germany", url: "https://www.daad.de/en/study-and-research-in-germany/", identifier: "daad-study", language: "en" },
  { name: "Uni-Assist", country: "germany", url: "https://www.uni-assist.de/en/", identifier: "uni-assist", language: "en" },

  // ── UK ──
  { name: "UCAS Postgraduate", country: "uk", url: "https://www.ucas.com/postgraduate/postgraduate-study", identifier: "ucas-pg", language: "en" },

  // ── Canada ──
  { name: "EduCanada", country: "canada", url: "https://www.educanada.ca/programs-programmes.aspx", identifier: "educanada", language: "en" },

  // ── Pays-Bas ──
  { name: "Study in Holland (Nuffic)", country: "netherlands", url: "https://www.studyinholland.nl/find-a-study-programme", identifier: "study-holland", language: "en" },
  { name: "NFP Netherlands Fellowship", country: "netherlands", url: "https://www.nuffic.nl/en/subjects/netherlands-fellowship-programmes", identifier: "nfp", language: "en" },

  // ── Suisse ──
  { name: "Swissuniversities", country: "switzerland", url: "https://www.swissuniversities.ch/en/higher-education-area/studying-in-switzerland", identifier: "swissuni", language: "en" },

  // ── Belgique ──
  { name: "Study in Belgium", country: "belgium", url: "https://www.studyinbelgium.be/en/", identifier: "study-belgium", language: "en" },

  // ── International (agrégateurs) ──
  { name: "MastersPortal", country: "international", url: "https://www.mastersportal.com/", identifier: "mastersportal", language: "en" },
  { name: "PhDPortal", country: "international", url: "https://www.phdportal.com/", identifier: "phdportal", language: "en" },
];

export async function ingererAdmissions(): Promise<RapportPortail> {
  return scraperPortails(ADMISSION_SOURCES, {
    type: "ADMISSION",
    sourcePrefix: "ADMISSION",
  });
}
