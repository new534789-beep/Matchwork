/**
 * Normalisation des noms de matières.
 *
 * Le guide MESRS écrit « SPCT », le relevé du candidat peut porter
 * « Physique-Chimie et Technologie » et notre formulaire « PCT ». Ces trois
 * libellés désignent la même épreuve : on les ramène à une clé unique avant
 * toute comparaison.
 */

/** Clé de comparaison : minuscules, sans accent, sans ponctuation superflue. */
export function cleMatiere(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9']+/g, " ")
    .trim()
}

/**
 * Libellés alternatifs rencontrés dans le guide et sur les relevés, ramenés au
 * nom canonique utilisé dans le jeu de données.
 */
const SYNONYMES: Record<string, string> = {
  // Français
  "francais": "Français",
  "franais": "Français",
  "fanais": "Français",
  "dissertation francaise": "Dissertation française",
  // Philosophie
  "philo": "Philosophie",
  "philosophie": "Philosophie",
  // Histoire-Géographie
  "hist geo": "Histoire-Géographie",
  "histgeo": "Histoire-Géographie",
  "histoire geographie": "Histoire-Géographie",
  "histoire et geographie": "Histoire-Géographie",
  "histoire": "Histoire",
  "geographie": "Géographie",
  // Langues
  "anglais": "Anglais",
  "anglais lv1": "Anglais",
  "anglais lv2": "Anglais",
  "allemand": "Allemand",
  "espagnol": "Espagnol",
  "espagol": "Espagnol",
  // Mathématiques
  "maths": "Mathématiques",
  "math": "Mathématiques",
  "mathematiques": "Mathématiques",
  "mathematique": "Mathématiques",
  "maths appliquees": "Mathématiques appliquées",
  "mathematiques appliquees": "Mathématiques appliquées",
  // Sciences
  "pct": "PCT",
  "spct": "PCT",
  "physique chimie technologie": "PCT",
  "physique chimie et technologie": "PCT",
  "sciences physiques chimiques et technologiques": "PCT",
  "svt": "SVT",
  "sciences de la vie et de la terre": "SVT",
  // Économie / gestion
  "economie": "Économie",
  "etude de cas": "Étude de cas",
  "techn compta et mercatique": "Techniques comptables et mercatique",
  // Divers
  "culture generale": "Culture générale",
  "sciences appliquees": "Sciences appliquées",
  "science appliquees": "Sciences appliquées",
  "etude electronique": "Étude électronique",
  "construction mecanique": "Construction mécanique",
  "mecanique": "Mécanique",
  "electrotech": "Électrotechnique",
  "electrotechnique": "Électrotechnique",
  "technologie des systemes informatiques": "Technologie des systèmes informatiques",
  "beton arme": "Béton armé",
  "puericulture": "Puériculture",
  "pratique eps": "Pratique EPS",
}

/** Nom canonique d'une matière, ou le libellé nettoyé s'il est inconnu. */
export function canoniserMatiere(nom: string): string {
  const k = cleMatiere(nom)
  return SYNONYMES[k] ?? nom.trim()
}

/** Deux libellés désignent-ils la même épreuve ? */
export function memeMatiere(a: string, b: string): boolean {
  if (cleMatiere(a) === cleMatiere(b)) return true
  return cleMatiere(canoniserMatiere(a)) === cleMatiere(canoniserMatiere(b))
}
