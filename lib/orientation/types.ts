/**
 * Typage du jeu de données Orientation.
 *
 * Source : « Guide d'information et de sensibilisation des nouveaux bacheliers
 * (Licence) 2026-2027 », MESRS Bénin. Plateforme officielle : apresmonbac.bj
 *
 * Les données sont statiques (elles changent une fois par an) et versionnées
 * dans le dépôt : aucun accès base de données n'est nécessaire pour les lire.
 */

/** Séries de l'enseignement général. */
export const SERIES_GENERALES = [
  "A1", "A2", "B", "C", "D", "E", "EA",
  "F1", "F2", "F3", "F4", "G1", "G2", "G3",
] as const

export type SerieGenerale = (typeof SERIES_GENERALES)[number]

/**
 * Série technique, sous la forme `DT/BTP`, `DEAT/PV`… La valeur `TOUTES`
 * en option (`DT/TOUTES`) signifie que le guide accepte toutes les spécialités.
 */
export type SerieTechnique = `DT/${string}` | `DEAT/${string}`

export type Serie = SerieGenerale | SerieTechnique

/**
 * Mode d'entrée dans la filière.
 * - `classement` : admission sur moyenne calculée (voir `creneauxParSerie`)
 * - `concours`   : admission sur examen — aucune moyenne de classement ne s'applique
 * - `inconnu`    : la colonne est vide dans le guide ; se renseigner auprès de
 *                  l'établissement
 */
export type ModeEntree = "classement" | "concours" | "inconnu"

/**
 * Un créneau = une position dans la formule de classement. Il liste les
 * matières acceptables à cette position ; le candidat utilise celle qu'il a
 * effectivement passée (ex. `["Espagnol", "Allemand"]`).
 *
 * Le guide attend trois créneaux pour une filière sur classement.
 */
export type Creneau = string[]

/**
 * Règle DEAT : le guide impose de retenir « les trois matières écrites »
 * du relevé, quelle que soit la filière.
 */
export const TOUTES_MATIERES_ECRITES = "TOUTES_MATIERES_ECRITES"

export type ReglesSerie = Creneau[] | typeof TOUTES_MATIERES_ECRITES

export type FilierePublique = {
  id: string

  /** `true` si une moyenne de classement peut être calculée pour au moins une série. */
  calculable: boolean
  /** Séries pour lesquelles la règle de calcul est complète et sans ambiguïté. */
  seriesCalculables: Serie[]
  /**
   * `true` si le guide est ambigu ou incomplet sur cette filière. À afficher
   * comme tel au candidat — ne jamais deviner la formule à sa place.
   */
  aVerifier: boolean

  universite: string
  codeUniversite: string
  etablissement: string
  filiere: string

  /** Quota de bourses. `null` si la case est vide dans le guide. */
  quotaBourse: number | null
  /** Quota d'aides universitaires / formations partiellement payantes. */
  quotaAideFpp: number | null

  modeEntree: ModeEntree
  /** Séries acceptées par la filière. */
  series: Serie[]
  /** Règle de calcul, résolue série par série. */
  creneauxParSerie: Record<string, ReglesSerie>

  debouches: string[]

  /** Traçabilité : page du guide et texte brut, pour vérification humaine. */
  source: {
    page: number
    bacBrut: string
    matieresBrut: string
  }
  /** Anomalies relevées à la construction du jeu de données. */
  alertes: string[]
}

export type JeuDonneesOrientation = {
  source: string
  plateformeOfficielle: string
  anneeUniversitaire: string
  filieres: FilierePublique[]
}
