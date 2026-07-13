/**
 * Ingestion de formations / training programs depuis des portails occidentaux.
 * Utilise le pipeline générique de base-portal-scraper.ts.
 */
import { scraperPortails, type BasePortalSource, type RapportPortail } from "./base-portal-scraper";

const FORMATION_SOURCES: BasePortalSource[] = [
  // ── France ──
  { name: "Campus France Formations", country: "france", url: "https://www.campusfrance.org/fr/les-formations", identifier: "campusfr-formations", language: "fr" },
  { name: "FUN MOOC", country: "france", url: "https://www.fun-mooc.fr/fr/cours/", identifier: "fun-mooc", language: "fr" },
  { name: "Sciences Po Summer School", country: "france", url: "https://www.sciencespo.fr/summer/en.html", identifier: "sciencespo-summer", language: "en" },
  { name: "ESSEC Summer Programs", country: "france", url: "https://www.essec.edu/en/program/summer-programs/", identifier: "essec-summer", language: "en" },
  { name: "Alliance Française", country: "france", url: "https://www.fondation-alliancefr.org/", identifier: "alliance-fr", language: "fr" },

  // ── Afrique de l'Ouest ──
  { name: "2iE Burkina", country: "burkina-faso", url: "https://www.2ie-edu.org/formations/", identifier: "2ie-formations", language: "fr" },
  { name: "ISM Dakar", country: "senegal", url: "https://www.ism.edu.sn/formations/", identifier: "ism-formations", language: "fr" },

  // ── International / Francophonie ──
  { name: "AUF Formations", country: "international", url: "https://www.auf.org/les_services/formations/", identifier: "auf-formations", language: "fr" },

  // ── UK ──
  { name: "LSE Summer School", country: "uk", url: "https://www.lse.ac.uk/study-at-lse/summer-schools", identifier: "lse-summer", language: "en" },
  { name: "British Council Study Abroad", country: "uk", url: "https://www.britishcouncil.org/study-work-abroad", identifier: "british-council", language: "en" },

  // ── Allemagne ──
  { name: "Goethe Institut Courses", country: "germany", url: "https://www.goethe.de/en/spr/kup.html", identifier: "goethe", language: "en" },

  // ── Suisse ──
  { name: "EPFL Continuing Education", country: "switzerland", url: "https://www.epfl.ch/education/continuing-education/", identifier: "epfl-formation", language: "en" },

  // ── USA ──
  { name: "Humphrey Fellowship", country: "usa", url: "https://www.humphreyfellowship.org/", identifier: "humphrey", language: "en" },

  // ── International ──
  { name: "edX Professional Certificates", country: "international", url: "https://www.edx.org/certificates/professional-certificate", identifier: "edx-pro", language: "en" },
  { name: "Coursera Africa Scholarships", country: "international", url: "https://www.coursera.org/courses?query=africa+scholarship", identifier: "coursera-africa", language: "en" },
  { name: "JICA Training", country: "japan", url: "https://www.jica.go.jp/english/our_work/types_of_assistance/training/index.html", identifier: "jica", language: "en" },

  // ── Belgique ──
  { name: "VLIR-UOS Training", country: "belgium", url: "https://www.vliruos.be/en/scholarships/", identifier: "vliruos-training", language: "en" },
];

export async function ingererFormations(): Promise<RapportPortail> {
  return scraperPortails(FORMATION_SOURCES, {
    type: "FORMATION",
    sourcePrefix: "TRAINING",
  });
}
