/**
 * Mise en ordre des résultats.
 *
 * Principe : **on n'écarte jamais une filière et on n'en recommande aucune.**
 * L'ordre principal reste la moyenne de classement, décroissante — c'est le
 * critère officiel. Les préférences du candidat ne servent qu'à poser des
 * étiquettes (« correspond à tes centres d'intérêt », « dans ta zone ») qui
 * l'aident à lire la liste, pas à la trier à sa place.
 */

import { evaluerToutesFilieres, type FiliereEvaluee, type Releve } from "./calcul"
import { MOTS_CLES_INTERET, type Preferences, type Priorite } from "./questionnaire"
import type { FilierePublique } from "./types"

export type Etiquette =
  | "interet"
  | "zone"
  | "bourses-larges"
  | "debouches-nombreux"
  | "concours"
  | "regle-incertaine"

export type FiliereClassee = FiliereEvaluee & {
  /** Rang dans la liste des filières dont la moyenne a pu être calculée. */
  rang: number | null
  etiquettes: Etiquette[]
}

/** Une filière touche-t-elle l'un des centres d'intérêt cochés ? */
function correspondAuxInterets(f: FilierePublique, prefs: Preferences): boolean {
  if (!prefs.interets.length) return false
  const texte = `${f.filiere} ${f.etablissement} ${f.debouches.join(" ")}`.toLowerCase()
  return prefs.interets.some((i) =>
    MOTS_CLES_INTERET[i].some((mot) => texte.includes(mot)),
  )
}

/**
 * Seuil au-delà duquel on signale un quota de bourses comme large : la
 * médiane des quotas non nuls du guide. Calculé une fois, à partir des données.
 */
function seuilBoursesLarges(filieres: FilierePublique[]): number {
  const quotas = filieres
    .map((f) => f.quotaBourse ?? 0)
    .filter((q) => q > 0)
    .sort((a, b) => a - b)
  if (!quotas.length) return Infinity
  return quotas[Math.floor(quotas.length / 2)]
}

/**
 * Départage les filières à moyenne identique.
 *
 * Ce n'est pas un détail : comme le guide impose souvent le même trio de
 * matières à des dizaines de filières, un candidat obtient très peu de moyennes
 * distinctes — couramment une quinzaine pour cent trente filières, avec des
 * paquets de quarante ex aequo. L'ordre à l'intérieur d'un paquet est donc le
 * classement que le candidat lit réellement. Le laisser à l'ordre du guide
 * revient à trancher au hasard ; on le trie selon ce qu'il a déclaré vouloir.
 *
 * La moyenne reste le critère premier — la priorité n'intervient qu'à égalité.
 */
function comparerAEgalite(
  a: FiliereEvaluee,
  b: FiliereEvaluee,
  prefs: Preferences,
  interesse: (f: FilierePublique) => boolean,
): number {
  const fa = a.filiere
  const fb = b.filiere
  const bourses = (fb.quotaBourse ?? 0) - (fa.quotaBourse ?? 0)
  const places =
    (fb.quotaBourse ?? 0) + (fb.quotaAideFpp ?? 0) -
    ((fa.quotaBourse ?? 0) + (fa.quotaAideFpp ?? 0))
  const debouches = fb.debouches.length - fa.debouches.length
  const interet = Number(interesse(fb)) - Number(interesse(fa))
  const zone =
    Number(prefs.zone !== "*" && fb.universite === prefs.zone) -
    Number(prefs.zone !== "*" && fa.universite === prefs.zone)

  const criteres: Record<Priorite, number[]> = {
    bourse: [bourses, places, interet],
    passion: [interet, bourses, debouches],
    emploi: [debouches, bourses, interet],
    proximite: [zone, bourses, interet],
  }
  for (const c of criteres[prefs.priorite]) {
    if (c !== 0) return c
  }
  return fa.filiere.localeCompare(fb.filiere, "fr")
}

export function classer(releve: Releve, prefs: Preferences): FiliereClassee[] {
  const brut = evaluerToutesFilieres(releve)
  const seuil = seuilBoursesLarges(brut.map((e) => e.filiere))
  const medianeDebouches = 3
  const interesse = (f: FilierePublique) => correspondAuxInterets(f, prefs)

  // `evaluerToutesFilieres` a déjà trié par moyenne décroissante ; on ne
  // réordonne qu'à l'intérieur des égalités.
  const evaluees = [...brut].sort((a, b) => {
    const ca = a.resultat.statut === "calcule"
    const cb = b.resultat.statut === "calcule"
    if (ca !== cb) return ca ? -1 : 1
    if (!ca) return a.filiere.filiere.localeCompare(b.filiere.filiere, "fr")
    const ma = (a.resultat as { moyenne: number }).moyenne
    const mb = (b.resultat as { moyenne: number }).moyenne
    if (mb !== ma) return mb - ma
    return comparerAEgalite(a, b, prefs, interesse)
  })

  let rang = 0
  return evaluees.map((e) => {
    const f = e.filiere
    const etiquettes: Etiquette[] = []

    if (interesse(f)) etiquettes.push("interet")
    if (prefs.zone !== "*" && f.universite === prefs.zone) etiquettes.push("zone")
    if ((f.quotaBourse ?? 0) >= seuil) etiquettes.push("bourses-larges")
    if (f.debouches.length > medianeDebouches) etiquettes.push("debouches-nombreux")
    if (f.modeEntree === "concours") etiquettes.push("concours")
    if (f.aVerifier) etiquettes.push("regle-incertaine")

    return {
      ...e,
      rang: e.resultat.statut === "calcule" ? ++rang : null,
      etiquettes,
    }
  })
}

export type SyntheseClassement = {
  total: number
  calculees: number
  meilleureMoyenne: number | null
  moyenneLaPlusBasse: number | null
  totalBourses: number
  totalAides: number
}

export function resumer(classees: FiliereClassee[]): SyntheseClassement {
  const calculees = classees.filter((c) => c.resultat.statut === "calcule")
  const moyennes = calculees.map(
    (c) => (c.resultat as { moyenne: number }).moyenne,
  )
  return {
    total: classees.length,
    calculees: calculees.length,
    meilleureMoyenne: moyennes.length ? Math.max(...moyennes) : null,
    moyenneLaPlusBasse: moyennes.length ? Math.min(...moyennes) : null,
    totalBourses: calculees.reduce((s, c) => s + (c.filiere.quotaBourse ?? 0), 0),
    totalAides: calculees.reduce((s, c) => s + (c.filiere.quotaAideFpp ?? 0), 0),
  }
}
