/**
 * Mention du baccalauréat, déduite de la moyenne générale imprimée sur le
 * relevé.
 *
 * Elle sert au candidat à se situer : la plateforme officielle affiche, pour
 * chaque filière, le nombre de candidats par mention l'ayant choisie. Savoir sa
 * mention aide donc à lire la concurrence.
 *
 * La moyenne générale n'est jamais recalculée à partir des notes — elle est
 * recopiée du relevé.
 */

export type Mention = "Très bien" | "Bien" | "Assez bien" | "Passable" | "Insuffisant"

const SEUILS: { min: number; mention: Mention }[] = [
  { min: 16, mention: "Très bien" },
  { min: 14, mention: "Bien" },
  { min: 12, mention: "Assez bien" },
  { min: 10, mention: "Passable" },
]

export function mentionPour(moyenneGenerale: number): Mention {
  for (const s of SEUILS) {
    if (moyenneGenerale >= s.min) return s.mention
  }
  return "Insuffisant"
}

/** Points qui manquent pour atteindre la mention suivante, ou `null` si Très bien. */
export function pointsVersMentionSuivante(
  moyenneGenerale: number,
): { mention: Mention; ecart: number } | null {
  const superieurs = SEUILS.filter((s) => s.min > moyenneGenerale)
  if (!superieurs.length) return null
  const cible = superieurs[superieurs.length - 1]
  return {
    mention: cible.mention,
    ecart: Math.round((cible.min - moyenneGenerale) * 100) / 100,
  }
}
