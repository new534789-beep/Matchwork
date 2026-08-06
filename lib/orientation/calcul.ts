/**
 * Moteur de calcul de la moyenne de classement.
 *
 * Règle officielle (guide MESRS 2026-2027, p. 9) :
 *
 *     M = (m1×x + m2×y + m3×z) / (x + y + z)
 *
 * où `m` est la note obtenue dans la matière et `x, y, z` le coefficient de
 * cette matière **dans la série du candidat**.
 *
 * Deux principes tenus dans tout ce fichier :
 *
 * 1. **Les coefficients viennent exclusivement du relevé saisi par le
 *    candidat.** Aucune table de coefficients n'est codée ici, aucune valeur
 *    n'est devinée ni complétée.
 * 2. **Aucun appel à un modèle de langage.** Le calcul est arithmétique et
 *    déterministe : une moyenne fausse fausserait une orientation.
 */

import { FILIERES_PUBLIQUES } from "./donnees"
import { canoniserMatiere, memeMatiere } from "./matieres"
import {
  TOUTES_MATIERES_ECRITES,
  type Creneau,
  type FilierePublique,
  type Serie,
} from "./types"

/** Une ligne du relevé de notes, telle que le candidat la saisit. */
export type LigneReleve = {
  matiere: string
  /** Note sur 20. */
  note: number
  /** Coefficient tel qu'imprimé sur le relevé. */
  coefficient: number
  /** `true` si c'est une épreuve écrite (sert à la règle DEAT). */
  epreuveEcrite?: boolean
}

export type Releve = {
  serie: Serie
  lignes: LigneReleve[]
  /** Moyenne générale au BAC, si le candidat la renseigne. Jamais recalculée. */
  moyenneGenerale?: number
}

/** Une matière retenue dans la formule, avec ce qui a servi à la calculer. */
export type MatiereRetenue = {
  matiere: string
  note: number
  coefficient: number
  /** Les autres matières que le guide acceptait à cette position. */
  alternatives: string[]
}

export type ResultatCalcul =
  | {
      statut: "calcule"
      moyenne: number
      matieresRetenues: MatiereRetenue[]
      sommeCoefficients: number
      /** Formule lisible, pour affichage au candidat. */
      formule: string
    }
  | {
      statut: "non-calculable"
      raison: string
      /** Créneaux du guide qu'aucune ligne du relevé ne satisfait. */
      creneauxManquants?: Creneau[]
    }

export class ReleveInvalide extends Error {}

/** Vérifie le relevé avant tout calcul. Lève `ReleveInvalide` si incohérent. */
export function validerReleve(releve: Releve): void {
  if (!releve.lignes.length) {
    throw new ReleveInvalide("Le relevé ne contient aucune matière.")
  }
  for (const l of releve.lignes) {
    if (!l.matiere.trim()) {
      throw new ReleveInvalide("Une ligne du relevé n'a pas de matière.")
    }
    if (!Number.isFinite(l.note) || l.note < 0 || l.note > 20) {
      throw new ReleveInvalide(
        `Note invalide pour ${l.matiere} : ${l.note}. Attendu entre 0 et 20.`,
      )
    }
    if (!Number.isFinite(l.coefficient) || l.coefficient <= 0) {
      throw new ReleveInvalide(
        `Coefficient invalide pour ${l.matiere} : ${l.coefficient}. Attendu supérieur à 0.`,
      )
    }
  }
  const vues = new Set<string>()
  for (const l of releve.lignes) {
    const k = canoniserMatiere(l.matiere)
    if (vues.has(k)) {
      throw new ReleveInvalide(`La matière ${l.matiere} apparaît deux fois dans le relevé.`)
    }
    vues.add(k)
  }
}

function chercherLigne(releve: Releve, matiere: string): LigneReleve | undefined {
  return releve.lignes.find((l) => memeMatiere(l.matiere, matiere))
}

function moyennePonderee(retenues: MatiereRetenue[]): {
  moyenne: number
  somme: number
} {
  const somme = retenues.reduce((s, m) => s + m.coefficient, 0)
  const total = retenues.reduce((s, m) => s + m.note * m.coefficient, 0)
  return { moyenne: total / somme, somme }
}

function ecrireFormule(retenues: MatiereRetenue[], somme: number, moyenne: number): string {
  const haut = retenues.map((m) => `${m.matiere} ${m.note}×${m.coefficient}`).join(" + ")
  return `(${haut}) ÷ ${somme} = ${moyenne.toFixed(2)}`
}

/**
 * Calcule la moyenne de classement d'un candidat pour une filière donnée.
 *
 * Retourne `non-calculable` — jamais une valeur approchée — lorsque :
 * - la filière recrute sur concours (aucune moyenne de classement n'existe) ;
 * - la série du candidat n'est pas acceptée ;
 * - le guide est ambigu sur cette filière (`aVerifier`) ;
 * - une matière exigée par le guide est absente du relevé.
 */
export function calculerPourFiliere(
  releve: Releve,
  filiere: FilierePublique,
): ResultatCalcul {
  if (filiere.modeEntree === "concours") {
    return {
      statut: "non-calculable",
      raison:
        "Cette filière recrute sur concours : l'admission dépend des épreuves, pas d'une moyenne de classement.",
    }
  }
  if (filiere.modeEntree === "inconnu") {
    return {
      statut: "non-calculable",
      raison:
        "Le guide ne précise pas le mode d'entrée de cette filière. Se renseigner auprès de l'établissement.",
    }
  }
  if (!filiere.series.includes(releve.serie)) {
    return {
      statut: "non-calculable",
      raison: `Filière non ouverte à la série ${releve.serie}.`,
    }
  }

  const regles = filiere.creneauxParSerie[releve.serie]
  if (!regles) {
    return {
      statut: "non-calculable",
      raison: `Le guide ne donne pas de règle de calcul pour la série ${releve.serie}.`,
    }
  }

  // Règle DEAT : le guide impose les trois épreuves écrites du relevé.
  if (regles === TOUTES_MATIERES_ECRITES) {
    const ecrites = releve.lignes.filter((l) => l.epreuveEcrite)
    if (ecrites.length !== 3) {
      return {
        statut: "non-calculable",
        raison: `Le guide retient les trois épreuves écrites ; le relevé en compte ${ecrites.length}.`,
      }
    }
    const retenues: MatiereRetenue[] = ecrites.map((l) => ({
      matiere: canoniserMatiere(l.matiere),
      note: l.note,
      coefficient: l.coefficient,
      alternatives: [],
    }))
    const { moyenne, somme } = moyennePonderee(retenues)
    return {
      statut: "calcule",
      moyenne,
      matieresRetenues: retenues,
      sommeCoefficients: somme,
      formule: ecrireFormule(retenues, somme, moyenne),
    }
  }

  if (filiere.aVerifier) {
    return {
      statut: "non-calculable",
      raison:
        "La règle de calcul est ambiguë dans le guide pour cette filière. À vérifier sur apresmonbac.bj.",
    }
  }

  const retenues: MatiereRetenue[] = []
  const manquants: Creneau[] = []
  for (const creneau of regles) {
    // Le guide peut accepter plusieurs matières à une même position ; on prend
    // la première que le candidat a effectivement passée, dans l'ordre du guide.
    const trouve = creneau
      .map((nom) => ({ nom, ligne: chercherLigne(releve, nom) }))
      .find((c) => c.ligne)
    if (!trouve || !trouve.ligne) {
      manquants.push(creneau)
      continue
    }
    retenues.push({
      matiere: canoniserMatiere(trouve.nom),
      note: trouve.ligne.note,
      coefficient: trouve.ligne.coefficient,
      alternatives: creneau.filter((n) => n !== trouve.nom).map(canoniserMatiere),
    })
  }

  if (manquants.length) {
    const noms = manquants.map((c) => c.join(" ou ")).join(", ")
    return {
      statut: "non-calculable",
      raison: `Matière absente du relevé : ${noms}.`,
      creneauxManquants: manquants,
    }
  }

  const { moyenne, somme } = moyennePonderee(retenues)
  return {
    statut: "calcule",
    moyenne,
    matieresRetenues: retenues,
    sommeCoefficients: somme,
    formule: ecrireFormule(retenues, somme, moyenne),
  }
}

export type FiliereEvaluee = {
  filiere: FilierePublique
  resultat: ResultatCalcul
}

/**
 * Évalue **toutes** les filières ouvertes à la série du candidat.
 *
 * Les filières calculées sortent en tête, moyenne décroissante ; les
 * non-calculables suivent, avec leur raison. On n'en écarte aucune et on n'en
 * recommande aucune : le candidat choisit.
 */
export function evaluerToutesFilieres(releve: Releve): FiliereEvaluee[] {
  validerReleve(releve)
  const evaluees = FILIERES_PUBLIQUES.filter((f) => f.series.includes(releve.serie)).map(
    (filiere) => ({ filiere, resultat: calculerPourFiliere(releve, filiere) }),
  )
  return evaluees.sort((a, b) => {
    const ca = a.resultat.statut === "calcule"
    const cb = b.resultat.statut === "calcule"
    if (ca && cb) {
      return (
        (b.resultat as { moyenne: number }).moyenne -
        (a.resultat as { moyenne: number }).moyenne
      )
    }
    if (ca !== cb) return ca ? -1 : 1
    return a.filiere.filiere.localeCompare(b.filiere.filiere, "fr")
  })
}
