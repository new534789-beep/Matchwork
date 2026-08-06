/**
 * Quelles matières faut-il lire sur le relevé d'un candidat ?
 *
 * Exactement celles que le guide cite dans les formules de classement des
 * filières ouvertes à sa série — et rien d'autre. Une matière absente de cette
 * liste ne peut, par construction, influer sur aucune moyenne.
 *
 * La liste est donc **dérivée du guide**, jamais écrite à la main : c'est ce
 * qui permet de demander une photo du relevé sans avoir à connaître à l'avance
 * le programme de chaque série.
 */

import { FILIERES_PUBLIQUES } from "./donnees"
import { canoniserMatiere } from "./matieres"
import { TOUTES_MATIERES_ECRITES, type Serie } from "./types"

/**
 * Matières utiles pour une série, triées par nombre de filières concernées :
 * les plus déterminantes d'abord.
 */
export function matieresUtiles(serie: Serie): string[] {
  const compte = new Map<string, number>()
  for (const f of FILIERES_PUBLIQUES) {
    if (f.modeEntree !== "classement" || f.aVerifier) continue
    const regles = f.creneauxParSerie[serie]
    if (!regles || regles === TOUTES_MATIERES_ECRITES) continue
    for (const creneau of regles) {
      for (const nom of creneau) {
        const m = canoniserMatiere(nom)
        compte.set(m, (compte.get(m) ?? 0) + 1)
      }
    }
  }
  return [...compte.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
    .map(([m]) => m)
}

/** Nombre de filières calculables pour une série. */
export function nombreFilieresCalculables(serie: Serie): number {
  return FILIERES_PUBLIQUES.filter(
    (f) =>
      f.modeEntree === "classement" &&
      !f.aVerifier &&
      f.creneauxParSerie[serie] !== undefined,
  ).length
}

/**
 * `true` si la série suit la règle DEAT : le guide y retient les trois
 * épreuves écrites du relevé, quelle que soit la filière. Il faut alors lire
 * le relevé en entier plutôt qu'une liste de matières connue d'avance.
 */
export function suitRegleEpreuvesEcrites(serie: Serie): boolean {
  return FILIERES_PUBLIQUES.some(
    (f) => f.creneauxParSerie[serie] === TOUTES_MATIERES_ECRITES,
  )
}

/** Séries pour lesquelles au moins une filière est calculable. */
export function seriesExploitables(): Serie[] {
  const vues = new Set<Serie>()
  for (const f of FILIERES_PUBLIQUES) {
    if (f.modeEntree !== "classement" || f.aVerifier) continue
    for (const s of f.series) vues.add(s)
  }
  return [...vues].sort()
}
