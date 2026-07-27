/**
 * Détection et pages publiques par pays (localisation de l'opportunité —
 * pas la nationalité du candidat). Source unique de vérité pour :
 * JSON-LD (jobLocation), Opportunite.pays (auto-détecté à la création),
 * pages publiques /offres/pays/[slug].
 */

// Détection légère par mots-clés dans le texte de l'offre. Couvre
// l'ensemble du continent africain (pas seulement l'Afrique de l'Ouest) —
// une offre localisée n'importe où en Afrique doit être reconnue.
const PAYS_ISO: Record<string, string> = {
  // ── Afrique de l'Ouest ──
  benin: "BJ", bénin: "BJ", cotonou: "BJ", "porto-novo": "BJ",
  togo: "TG", lome: "TG", lomé: "TG",
  ghana: "GH", accra: "GH", kumasi: "GH",
  nigeria: "NG", lagos: "NG", abuja: "NG", "port harcourt": "NG",
  senegal: "SN", sénégal: "SN", dakar: "SN",
  "cote d'ivoire": "CI", "côte d'ivoire": "CI", "ivory coast": "CI", abidjan: "CI",
  mali: "ML", bamako: "ML",
  "burkina faso": "BF", ouagadougou: "BF",
  niger: "NE", niamey: "NE",
  guinee: "GN", guinée: "GN", conakry: "GN",
  "guinea-bissau": "GW", bissau: "GW",
  "sierra leone": "SL", freetown: "SL",
  liberia: "LR", monrovia: "LR",
  gambia: "GM", gambie: "GM", banjul: "GM",
  "cabo verde": "CV", "cape verde": "CV", praia: "CV",
  mauritanie: "MR", mauritania: "MR", nouakchott: "MR",

  // ── Afrique centrale ──
  cameroun: "CM", cameroon: "CM", yaounde: "CM", yaoundé: "CM", douala: "CM",
  gabon: "GA", libreville: "GA",
  "congo-brazzaville": "CG", brazzaville: "CG",
  "republique democratique du congo": "CD", "république démocratique du congo": "CD", "drc": "CD", kinshasa: "CD", lubumbashi: "CD",
  tchad: "TD", chad: "TD", ndjamena: "TD",
  "republique centrafricaine": "CF", "central african republic": "CF", bangui: "CF",
  "guinee equatoriale": "GQ", "equatorial guinea": "GQ",
  "sao tome": "ST",

  // ── Afrique de l'Est ──
  kenya: "KE", nairobi: "KE", mombasa: "KE",
  tanzanie: "TZ", tanzania: "TZ", "dar es salaam": "TZ", dodoma: "TZ",
  ouganda: "UG", uganda: "UG", kampala: "UG",
  rwanda: "RW", kigali: "RW",
  burundi: "BI", bujumbura: "BI",
  ethiopie: "ET", ethiopia: "ET", "addis abeba": "ET", "addis ababa": "ET",
  somalie: "SO", somalia: "SO", mogadiscio: "SO",
  djibouti: "DJ",
  erythree: "ER", eritrea: "ER", asmara: "ER",
  "soudan du sud": "SS", "south sudan": "SS", juba: "SS",
  soudan: "SD", sudan: "SD", khartoum: "SD",
  madagascar: "MG", antananarivo: "MG",
  maurice: "MU", mauritius: "MU", "port louis": "MU",
  "seychelles": "SC",
  malawi: "MW", lilongwe: "MW",
  zambie: "ZM", zambia: "ZM", lusaka: "ZM",
  zimbabwe: "ZW", harare: "ZW",
  mozambique: "MZ", maputo: "MZ",

  // ── Afrique australe ──
  "afrique du sud": "ZA", "south africa": "ZA", johannesburg: "ZA", "cape town": "ZA", pretoria: "ZA", durban: "ZA",
  namibie: "NA", namibia: "NA", windhoek: "NA",
  botswana: "BW", gaborone: "BW",
  lesotho: "LS", maseru: "LS",
  eswatini: "SZ", swaziland: "SZ",
  angola: "AO", luanda: "AO",

  // ── Afrique du Nord ──
  maroc: "MA", morocco: "MA", rabat: "MA", casablanca: "MA", marrakech: "MA",
  algerie: "DZ", algérie: "DZ", algeria: "DZ", alger: "DZ",
  tunisie: "TN", tunisia: "TN", tunis: "TN",
  libye: "LY", libya: "LY", tripoli: "LY",
  egypte: "EG", égypte: "EG", egypt: "EG", "le caire": "EG", cairo: "EG", alexandria: "EG",

  // ── Autres (JSON-LD destination d'une bourse, hors Afrique) ──
  france: "FR", paris: "FR",
  canada: "CA",
};

export function detecterPays(...textes: (string | null | undefined)[]): string | null {
  const t = textes.filter(Boolean).join(" ").toLowerCase();
  for (const [mot, iso] of Object.entries(PAYS_ISO)) {
    if (t.includes(mot)) return iso;
  }
  return null;
}

/**
 * Pays couverts par des pages publiques dédiées (/offres/pays/[slug]) —
 * l'ensemble du continent africain. FR/CA servent au JSON-LD (destination
 * d'une bourse) mais n'ont pas leur page dédiée, hors marché cible.
 */
export type PaysSeo = { code: string; slug: string; nom: string };

export const PAYS_SEO: PaysSeo[] = [
  // ── Afrique de l'Ouest ──
  { code: "BJ", slug: "benin", nom: "Bénin" },
  { code: "TG", slug: "togo", nom: "Togo" },
  { code: "CI", slug: "cote-d-ivoire", nom: "Côte d'Ivoire" },
  { code: "SN", slug: "senegal", nom: "Sénégal" },
  { code: "BF", slug: "burkina-faso", nom: "Burkina Faso" },
  { code: "ML", slug: "mali", nom: "Mali" },
  { code: "NE", slug: "niger", nom: "Niger" },
  { code: "GN", slug: "guinee", nom: "Guinée" },
  { code: "GW", slug: "guinee-bissau", nom: "Guinée-Bissau" },
  { code: "GH", slug: "ghana", nom: "Ghana" },
  { code: "NG", slug: "nigeria", nom: "Nigeria" },
  { code: "SL", slug: "sierra-leone", nom: "Sierra Leone" },
  { code: "LR", slug: "liberia", nom: "Liberia" },
  { code: "GM", slug: "gambie", nom: "Gambie" },
  { code: "CV", slug: "cap-vert", nom: "Cap-Vert" },
  { code: "MR", slug: "mauritanie", nom: "Mauritanie" },

  // ── Afrique centrale ──
  { code: "CM", slug: "cameroun", nom: "Cameroun" },
  { code: "GA", slug: "gabon", nom: "Gabon" },
  { code: "CG", slug: "congo-brazzaville", nom: "Congo-Brazzaville" },
  { code: "CD", slug: "rdc", nom: "République démocratique du Congo" },
  { code: "TD", slug: "tchad", nom: "Tchad" },
  { code: "CF", slug: "centrafrique", nom: "République centrafricaine" },
  { code: "GQ", slug: "guinee-equatoriale", nom: "Guinée équatoriale" },
  { code: "ST", slug: "sao-tome-et-principe", nom: "Sao Tomé-et-Principe" },

  // ── Afrique de l'Est ──
  { code: "KE", slug: "kenya", nom: "Kenya" },
  { code: "TZ", slug: "tanzanie", nom: "Tanzanie" },
  { code: "UG", slug: "ouganda", nom: "Ouganda" },
  { code: "RW", slug: "rwanda", nom: "Rwanda" },
  { code: "BI", slug: "burundi", nom: "Burundi" },
  { code: "ET", slug: "ethiopie", nom: "Éthiopie" },
  { code: "SO", slug: "somalie", nom: "Somalie" },
  { code: "DJ", slug: "djibouti", nom: "Djibouti" },
  { code: "ER", slug: "erythree", nom: "Érythrée" },
  { code: "SS", slug: "soudan-du-sud", nom: "Soudan du Sud" },
  { code: "SD", slug: "soudan", nom: "Soudan" },
  { code: "MG", slug: "madagascar", nom: "Madagascar" },
  { code: "MU", slug: "maurice", nom: "Maurice" },
  { code: "SC", slug: "seychelles", nom: "Seychelles" },
  { code: "MW", slug: "malawi", nom: "Malawi" },
  { code: "ZM", slug: "zambie", nom: "Zambie" },
  { code: "ZW", slug: "zimbabwe", nom: "Zimbabwe" },
  { code: "MZ", slug: "mozambique", nom: "Mozambique" },

  // ── Afrique australe ──
  { code: "ZA", slug: "afrique-du-sud", nom: "Afrique du Sud" },
  { code: "NA", slug: "namibie", nom: "Namibie" },
  { code: "BW", slug: "botswana", nom: "Botswana" },
  { code: "LS", slug: "lesotho", nom: "Lesotho" },
  { code: "SZ", slug: "eswatini", nom: "Eswatini" },
  { code: "AO", slug: "angola", nom: "Angola" },

  // ── Afrique du Nord ──
  { code: "MA", slug: "maroc", nom: "Maroc" },
  { code: "DZ", slug: "algerie", nom: "Algérie" },
  { code: "TN", slug: "tunisie", nom: "Tunisie" },
  { code: "LY", slug: "libye", nom: "Libye" },
  { code: "EG", slug: "egypte", nom: "Égypte" },
];

export function getPaysSeoBySlug(slug: string): PaysSeo | undefined {
  return PAYS_SEO.find((p) => p.slug === slug);
}

export function getPaysSeoByCode(code: string): PaysSeo | undefined {
  return PAYS_SEO.find((p) => p.code === code);
}
