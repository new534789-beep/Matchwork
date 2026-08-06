/**
 * Logos des universités.
 *
 * Le guide MESRS ne contient d'images que pour deux universités ; les autres
 * proviennent des sites officiels des établissements. Ce sont des marques
 * d'institutions publiques, affichées ici pour identifier l'université d'une
 * filière — un usage nominatif, jamais comme élément de marque Matchwork.
 *
 * Deux entrées du guide n'ont volontairement pas de logo :
 * - « Écoles Inter-États » n'est pas une université mais une étiquette
 *   regroupant six écoles de pays différents (Dakar, Lomé, Casablanca…) ;
 * - « Institut Universitaire d'Enseignement Professionnel » ne porte qu'une
 *   seule filière.
 * Elles reçoivent une pastille d'initiales, qui tient très bien la place.
 */

/** Fichier du logo, relatif à `public/`, ou `null` si aucun logo fiable. */
const LOGOS: Record<string, string> = {
  "Université d'Abomey-Calavi": "/logos/universites/abomey-calavi.webp",
  "Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques":
    "/logos/universites/unstim.webp",
  "Université de Parakou": "/logos/universites/parakou.webp",
  "Université Nationale d'Agriculture": "/logos/universites/agriculture.webp",
  "Université Africaine de Développement Coopératif": "/logos/universites/uadc.webp",
}

export function logoUniversite(universite: string): string | null {
  return LOGOS[universite] ?? null
}

/**
 * Initiales de repli, pour les universités sans logo.
 * « Université de Parakou » donne « PA », « Écoles Inter-États » donne « EI ».
 */
export function initialesUniversite(universite: string): string {
  const mots = universite
    .replace(/Universit[ée]s?/gi, " ")
    .replace(/\b(de|du|des|d'|la|le|les|et)\b/gi, " ")
    .split(/[\s'’-]+/)
    .filter(Boolean)
  if (!mots.length) return "?"
  if (mots.length === 1) return mots[0].slice(0, 2).toUpperCase()
  return (mots[0][0] + mots[1][0]).toUpperCase()
}
