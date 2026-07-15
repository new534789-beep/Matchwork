/**
 * Détection et pages publiques par pays (localisation de l'opportunité —
 * pas la nationalité du candidat). Source unique de vérité pour :
 * JSON-LD (jobLocation), Opportunite.pays (auto-détecté à la création),
 * pages publiques /offres/pays/[slug].
 */

// Détection légère par mots-clés dans le texte de l'offre.
const PAYS_ISO: Record<string, string> = {
  benin: "BJ", bénin: "BJ", cotonou: "BJ", "porto-novo": "BJ",
  togo: "TG", lome: "TG", lomé: "TG",
  ghana: "GH", accra: "GH",
  nigeria: "NG", lagos: "NG", abuja: "NG",
  senegal: "SN", sénégal: "SN", dakar: "SN",
  "cote d'ivoire": "CI", "côte d'ivoire": "CI", abidjan: "CI",
  mali: "ML", bamako: "ML",
  "burkina faso": "BF", ouagadougou: "BF",
  niger: "NE", niamey: "NE",
  guinee: "GN", guinée: "GN", conakry: "GN",
  france: "FR", paris: "FR",
  canada: "CA", maroc: "MA", tunisie: "TN",
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
 * cœur de marché de Matchwork (Afrique de l'Ouest francophone + anglophone
 * proche). Volontairement plus restreint que PAYS_ISO : FR/CA/MA/TN servent
 * au JSON-LD (destination d'une bourse) mais n'ont pas leur page dédiée.
 */
export type PaysSeo = { code: string; slug: string; nom: string };

export const PAYS_SEO: PaysSeo[] = [
  { code: "BJ", slug: "benin", nom: "Bénin" },
  { code: "TG", slug: "togo", nom: "Togo" },
  { code: "CI", slug: "cote-d-ivoire", nom: "Côte d'Ivoire" },
  { code: "SN", slug: "senegal", nom: "Sénégal" },
  { code: "BF", slug: "burkina-faso", nom: "Burkina Faso" },
  { code: "ML", slug: "mali", nom: "Mali" },
  { code: "NE", slug: "niger", nom: "Niger" },
  { code: "GN", slug: "guinee", nom: "Guinée" },
  { code: "GH", slug: "ghana", nom: "Ghana" },
  { code: "NG", slug: "nigeria", nom: "Nigeria" },
];

export function getPaysSeoBySlug(slug: string): PaysSeo | undefined {
  return PAYS_SEO.find((p) => p.slug === slug);
}

export function getPaysSeoByCode(code: string): PaysSeo | undefined {
  return PAYS_SEO.find((p) => p.code === code);
}
