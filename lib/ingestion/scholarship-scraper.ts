/**
 * Ingestion de bourses d'études depuis des portails gouvernementaux,
 * universitaires et panafricains.
 * Utilise le pipeline générique de base-portal-scraper.ts.
 */
import { scraperPortails, type BasePortalSource, type RapportPortail } from "./base-portal-scraper";

const SCHOLARSHIP_SOURCES: BasePortalSource[] = [
  // ── Afrique de l'Ouest / Panafricain ──
  { name: "Campus France Sénégal", country: "senegal", url: "https://www.senegal.campusfrance.org/bourses", identifier: "cf-senegal", language: "fr" },
  { name: "Campus France Côte d'Ivoire", country: "cote-d-ivoire", url: "https://www.cotedivoire.campusfrance.org/bourses", identifier: "cf-ci", language: "fr" },
  { name: "Campus France Guinée", country: "guinee", url: "https://www.guinee.campusfrance.org/bourses", identifier: "cf-guinee", language: "fr" },
  { name: "Campus France Mali", country: "mali", url: "https://www.mali.campusfrance.org/bourses", identifier: "cf-mali", language: "fr" },
  { name: "Campus France Burkina Faso", country: "burkina-faso", url: "https://www.burkinafaso.campusfrance.org/bourses", identifier: "cf-burkina", language: "fr" },
  { name: "Campus France Bénin", country: "benin", url: "https://www.benin.campusfrance.org/bourses", identifier: "cf-benin", language: "fr" },
  { name: "Campus France Togo", country: "togo", url: "https://www.togo.campusfrance.org/bourses", identifier: "cf-togo", language: "fr" },
  { name: "Campus France Niger", country: "niger", url: "https://www.niger.campusfrance.org/bourses", identifier: "cf-niger", language: "fr" },
  { name: "AUF Appels à candidatures", country: "international", url: "https://www.auf.org/nouvelles/appels-a-candidatures/", identifier: "auf", language: "fr" },
  { name: "BAD Bourses", country: "international", url: "https://www.afdb.org/fr/about-us/careers/internship-and-young-professionals-program", identifier: "bad", language: "fr" },
  { name: "Bourses CEDEAO / ECOWAS", country: "international", url: "https://www.ecowas.int/opportunities/", identifier: "cedeao", language: "en" },
  { name: "Mastercard Foundation Scholars", country: "international", url: "https://mastercardfdn.org/all/scholars/", identifier: "mastercard-fdn", language: "en" },
  { name: "ARES Bourses Belgique", country: "belgique", url: "https://www.ares-ac.be/fr/cooperation-au-developpement/bourses", identifier: "ares", language: "fr" },

  // ── France ──
  { name: "Campus France Bourses", country: "france", url: "https://www.campusfrance.org/fr/bourses-pour-etudiants-etrangers", identifier: "cf-france", language: "fr" },
  { name: "Fondation de France", country: "france", url: "https://www.fondationdefrance.org/fr/appels-a-projets", identifier: "fondation-france", language: "fr" },

  // ── Canada ──
  { name: "Mitacs Globalink", country: "canada", url: "https://www.mitacs.ca/our-programs/globalink-research-internship-students/", identifier: "mitacs", language: "en" },
  { name: "Bourses du gouvernement canadien", country: "canada", url: "https://www.educanada.ca/scholarships-bourses/index.aspx?lang=fra", identifier: "educanada", language: "fr" },

  // ── Allemagne ──
  { name: "DAAD Scholarships", country: "germany", url: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/", identifier: "daad", language: "en" },
  { name: "DAAD Scholarships EN", country: "germany", url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/", identifier: "daad-en", language: "en" },
  { name: "Friedrich Ebert Stiftung", country: "germany", url: "https://www.fes.de/studienfoerderung/", identifier: "fes", language: "de" },

  // ── Belgique ──
  { name: "WBI Bourses", country: "belgium", url: "https://www.wbi.be/bourses", identifier: "wbi", language: "fr" },

  // ── Luxembourg ──
  { name: "FNR Luxembourg", country: "luxembourg", url: "https://www.fnr.lu/funding-instruments/", identifier: "fnr", language: "en" },

  // ── Turquie ──
  { name: "Türkiye Bursları", country: "turkey", url: "https://www.turkiyeburslari.gov.tr/en/page/prospective-students/scholarship-programs", identifier: "turkiye-burslari", language: "en" },

  // ── Chine ──
  { name: "CSC Chinese Government Scholarship", country: "china", url: "https://www.campuschina.org/scholarships/index.html", identifier: "csc", language: "en" },

  // ── International / Fondations ──
  { name: "Chevening UK", country: "uk", url: "https://www.chevening.org/scholarships/", identifier: "chevening", language: "en" },
  { name: "Commonwealth Scholarships", country: "uk", url: "https://cscuk.fcdo.gov.uk/scholarships/", identifier: "commonwealth", language: "en" },
  { name: "Fulbright Foreign Student", country: "usa", url: "https://foreign.fulbrightonline.org/", identifier: "fulbright", language: "en" },
];

export type RapportBourses = RapportPortail;

export const SCHOLARSHIP_SOURCE_COUNT = SCHOLARSHIP_SOURCES.length;

export async function ingererBourses(offset = 0, limit?: number): Promise<RapportBourses> {
  const batchSize = limit ?? SCHOLARSHIP_SOURCES.length;
  const isPaginated = batchSize < SCHOLARSHIP_SOURCES.length;
  return scraperPortails(SCHOLARSHIP_SOURCES, {
    type: "BOURSE_ETUDE",
    sourcePrefix: "SCHOLARSHIP",
    maxLiens: isPaginated ? 3 : 30,
    maxEnrich: isPaginated ? 6 : 150,
    sourceOffset: offset,
    sourceLimit: batchSize,
  });
}
