import brut from "./donnees/filieres-publiques.json"
import type {
  FilierePublique,
  JeuDonneesOrientation,
  Serie,
} from "./types"

// Le JSON est généré par scripts/orientation (extraction du guide MESRS) et sa
// forme est validée à la construction. TypeScript infère les littéraux du
// fichier de façon trop étroite (clés optionnelles, `modeEntree: string`), d'où
// la conversion explicite.
const jeu = brut as unknown as JeuDonneesOrientation

export const SOURCE_GUIDE = jeu.source
export const PLATEFORME_OFFICIELLE = jeu.plateformeOfficielle
export const ANNEE_UNIVERSITAIRE = jeu.anneeUniversitaire

export const FILIERES_PUBLIQUES: FilierePublique[] = jeu.filieres

/** Toutes les filières ouvertes à une série donnée, ordre du guide. */
export function filieresPourSerie(serie: Serie): FilierePublique[] {
  return FILIERES_PUBLIQUES.filter((f) => f.series.includes(serie))
}

/** Séries techniques réellement citées par le guide, dédupliquées. */
export function seriesTechniquesDisponibles(): Serie[] {
  const vues = new Set<Serie>()
  for (const f of FILIERES_PUBLIQUES) {
    for (const s of f.series) {
      if (s.startsWith("DT/") || s.startsWith("DEAT/")) vues.add(s)
    }
  }
  return [...vues].sort()
}

export function filiereParId(id: string): FilierePublique | undefined {
  return FILIERES_PUBLIQUES.find((f) => f.id === id)
}
