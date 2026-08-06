/**
 * Pages publiques d'orientation, pour le référencement.
 *
 * Le simulateur vit derrière la connexion : un robot n'y voit rien. Ces pages
 * exposent en accès libre ce que le guide MESRS contient déjà — filières,
 * quotas, matières de calcul — et renvoient vers le simulateur pour le reste.
 *
 * Tout est dérivé du jeu de données : aucune page ne peut décrire une filière
 * qui n'existe pas, et le contenu suit automatiquement la mise à jour annuelle.
 */

import { FILIERES_PUBLIQUES } from "./donnees"
import { canoniserMatiere } from "./matieres"
import { TOUTES_MATIERES_ECRITES, type FilierePublique, type Serie } from "./types"

export type SerieSeo = {
  /** Segment d'URL : « bac-d », « bac-g2 ». */
  slug: string
  serie: Serie
  /** « Bac D », pour les titres. */
  libelleCourt: string
  /** « Mathématiques et sciences de la nature ». */
  intitule: string
}

const INTITULES: Record<string, string> = {
  A1: "Lettres et langues",
  A2: "Lettres et sciences humaines",
  B: "Sciences sociales et économiques",
  C: "Mathématiques et sciences physiques",
  D: "Mathématiques et sciences de la nature",
  E: "Mathématiques et technique",
  EA: "Eau et assainissement",
  F1: "Construction mécanique",
  F2: "Électronique",
  F3: "Électrotechnique",
  F4: "Génie civil",
  G1: "Techniques administratives",
  G2: "Techniques quantitatives de gestion",
  G3: "Techniques commerciales",
}

/**
 * Séries méritant leur propre page : uniquement celles du bac général, et
 * seulement si le guide y ouvre des filières calculables. Une page qui
 * n'aurait rien à montrer nuirait au référencement plutôt qu'elle ne l'aiderait.
 */
export const SERIES_SEO: SerieSeo[] = Object.keys(INTITULES)
  .filter((s) =>
    FILIERES_PUBLIQUES.some(
      (f) => f.series.includes(s as Serie) && f.modeEntree === "classement" && !f.aVerifier,
    ),
  )
  .map((s) => ({
    slug: `bac-${s.toLowerCase()}`,
    serie: s as Serie,
    libelleCourt: `Bac ${s}`,
    intitule: INTITULES[s],
  }))

export function getSerieSeoBySlug(slug: string): SerieSeo | undefined {
  return SERIES_SEO.find((s) => s.slug === slug)
}

export type StatsSerie = {
  ouvertes: number
  calculables: number
  surConcours: number
  totalBourses: number
  totalAides: number
  /** Matières qui entrent dans au moins une formule de classement. */
  matieres: string[]
  universites: { nom: string; filieres: number }[]
}

export function statsPourSerie(serie: Serie): StatsSerie {
  const ouvertes = FILIERES_PUBLIQUES.filter((f) => f.series.includes(serie))
  const matieres = new Map<string, number>()
  for (const f of ouvertes) {
    if (f.modeEntree !== "classement" || f.aVerifier) continue
    const regles = f.creneauxParSerie[serie]
    if (!regles || regles === TOUTES_MATIERES_ECRITES) continue
    for (const creneau of regles) {
      for (const nom of creneau) {
        const m = canoniserMatiere(nom)
        matieres.set(m, (matieres.get(m) ?? 0) + 1)
      }
    }
  }
  const parUniversite = new Map<string, number>()
  for (const f of ouvertes) {
    parUniversite.set(f.universite, (parUniversite.get(f.universite) ?? 0) + 1)
  }

  return {
    ouvertes: ouvertes.length,
    calculables: ouvertes.filter((f) => f.modeEntree === "classement" && !f.aVerifier).length,
    surConcours: ouvertes.filter((f) => f.modeEntree === "concours").length,
    totalBourses: ouvertes.reduce((s, f) => s + (f.quotaBourse ?? 0), 0),
    totalAides: ouvertes.reduce((s, f) => s + (f.quotaAideFpp ?? 0), 0),
    matieres: [...matieres.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
      .map(([m]) => m),
    universites: [...parUniversite.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([nom, filieres]) => ({ nom, filieres })),
  }
}

/** Filières d'une série, groupées par université puis par établissement. */
export function filieresPourSerie(serie: Serie): FilierePublique[] {
  return FILIERES_PUBLIQUES.filter((f) => f.series.includes(serie)).sort(
    (a, b) =>
      a.universite.localeCompare(b.universite, "fr") ||
      a.etablissement.localeCompare(b.etablissement, "fr") ||
      a.filiere.localeCompare(b.filiere, "fr"),
  )
}

/** Chiffres d'ensemble, pour la page d'accueil de la rubrique. */
export function statsGlobales() {
  return {
    filieres: FILIERES_PUBLIQUES.length,
    etablissements: new Set(FILIERES_PUBLIQUES.map((f) => f.etablissement)).size,
    universites: new Set(FILIERES_PUBLIQUES.map((f) => f.universite)).size,
    totalBourses: FILIERES_PUBLIQUES.reduce((s, f) => s + (f.quotaBourse ?? 0), 0),
    totalAides: FILIERES_PUBLIQUES.reduce((s, f) => s + (f.quotaAideFpp ?? 0), 0),
    surConcours: FILIERES_PUBLIQUES.filter((f) => f.modeEntree === "concours").length,
  }
}
