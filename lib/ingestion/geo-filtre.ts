/**
 * Filtre géographique pour l'ingestion ATS.
 *
 * Les entreprises suivies (Stripe, Airbnb, Databricks, Cloudflare, ...) publient
 * des offres dans le monde entier, sans rapport avec le marché cible de Matchwork
 * (Afrique de l'Ouest). On ne garde que les offres situées dans la zone couverte
 * par [[PAYS_SEO]], en Afrique au sens large (y compris EMEA, qui inclut l'Afrique),
 * ou explicitement ouvertes à distance sans restriction géographique — un
 * "Remote - US" reste hors zone : la restriction rend l'offre inaccessible depuis
 * l'Afrique de l'Ouest.
 */
import { detecterPays, PAYS_SEO } from "@/lib/pays";

const MOTS_AFRIQUE_LARGE = ["afrique", "africa", "emea"];

// Retire les mentions de télétravail sans restriction avant de vérifier s'il
// reste un qualificatif géographique (ville, pays, région) dans le libellé.
const MOTS_REMOTE_GLOBAL = /\b(remote|anywhere|worldwide|global|distributed|fully|home[- ]?based)\b/gi;
const BRUIT = /[-,()/&%\d]/g;

export function offreAtsPertinenteGeographiquement(location: string | null | undefined): boolean {
  const loc = (location || "").trim().toLowerCase();
  if (!loc || loc === "unknown") return true;

  const iso = detecterPays(loc);
  if (iso && PAYS_SEO.some((p) => p.code === iso)) return true;
  if (MOTS_AFRIQUE_LARGE.some((mot) => loc.includes(mot))) return true;

  const reste = loc.replace(MOTS_REMOTE_GLOBAL, "").replace(BRUIT, "").trim();
  return reste.length === 0;
}
