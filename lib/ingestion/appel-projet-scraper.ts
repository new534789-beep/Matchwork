/**
 * Ingestion d'appels à projets depuis des portails de bailleurs de fonds.
 * Utilise le pipeline générique de base-portal-scraper.ts.
 */
import { scraperPortails, type BasePortalSource, type RapportPortail } from "./base-portal-scraper";

const APPEL_SOURCES: BasePortalSource[] = [
  // ── Organisations africaines / francophones ──
  { name: "AUF Appels à projets", country: "international", url: "https://www.auf.org/les_services/appels-a-projets/", identifier: "auf-appels", language: "fr" },
  { name: "UEMOA Appels", country: "west-africa", url: "https://www.uemoa.int/fr/appels-propositions", identifier: "uemoa-appels", language: "fr" },
  { name: "CEDEAO/ECOWAS", country: "west-africa", url: "https://ecowas.int/calls-for-proposals/", identifier: "ecowas-appels", language: "en" },

  // ── France / Coopération ──
  { name: "AFD Appels à projets", country: "france", url: "https://www.afd.fr/fr/page-thematique-axe/appels-projets", identifier: "afd-appels", language: "fr" },
  { name: "Fondation de France", country: "france", url: "https://www.fondationdefrance.org/fr/appels-a-projets", identifier: "fdf-appels", language: "fr" },

  // ── Allemagne ──
  { name: "GIZ Appels", country: "germany", url: "https://www.giz.de/en/workingwithgiz/calls_for_proposals.html", identifier: "giz-appels", language: "en" },

  // ── Banques & Fonds de développement ──
  { name: "BAD/AfDB Procurement", country: "international", url: "https://www.afdb.org/en/projects-and-operations/procurement", identifier: "afdb-appels", language: "en" },
  { name: "CRDI/IDRC Funding", country: "canada", url: "https://www.idrc.ca/en/funding", identifier: "idrc-appels", language: "en" },

  // ── Organisations internationales ──
  { name: "UNESCO Appels", country: "international", url: "https://www.unesco.org/en/partnerships/calls", identifier: "unesco-appels", language: "en" },
  { name: "Wellcome Trust Grants", country: "uk", url: "https://wellcome.org/grant-funding/schemes", identifier: "wellcome-appels", language: "en" },
  { name: "Gates Foundation", country: "usa", url: "https://www.gatesfoundation.org/about/how-we-work/grant-opportunities", identifier: "gates-appels", language: "en" },

  // ── Union Européenne ──
  { name: "UE EuropeAid", country: "international", url: "https://webgate.ec.europa.eu/online-services/", identifier: "europeaid-appels", language: "en" },
];

export async function ingererAppelsProjets(): Promise<RapportPortail> {
  return scraperPortails(APPEL_SOURCES, {
    type: "APPEL_PROJET",
    sourcePrefix: "APPEL",
  });
}
