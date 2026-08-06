/**
 * Couche d'explication : met en mots des résultats déjà calculés.
 *
 * Le modèle ne reçoit que des nombres finis, produits par `calcul.ts`. Il n'a
 * ni le relevé brut à interpréter, ni de quoi recalculer quoi que ce soit.
 *
 * Et parce qu'un prompt n'est pas une garantie, le texte renvoyé est ensuite
 * relu par `chiffresInventes()` : tout nombre du texte qui ne figure pas dans
 * les données transmises fait rejeter l'explication. On préfère n'afficher
 * aucun commentaire qu'un commentaire qui invente une moyenne.
 */

import { getMistralClient, hasMistralKey, MODELS } from "@/lib/ia/mistral"
import {
  buildPromptOrientation,
  SYSTEM_ORIENTATION,
  type DonneesExplication,
} from "@/lib/ia/prompts/orientation"

import type { FiliereClassee } from "./classement"
import type { Releve } from "./calcul"
import { mentionPour } from "./mention"

const NB_MEILLEURES = 5
const NB_PLUS_BASSES = 2

/** Rassemble les données déjà calculées que le modèle est autorisé à voir. */
export function construireDonnees(
  releve: Releve,
  classees: FiliereClassee[],
): DonneesExplication {
  const calculees = classees.filter((c) => c.resultat.statut === "calcule")
  const enChiffres = (c: FiliereClassee) => {
    const r = c.resultat as { moyenne: number; formule: string }
    return {
      filiere: c.filiere.filiere,
      etablissement: c.filiere.etablissement,
      moyenne: r.moyenne,
      quotaBourse: c.filiere.quotaBourse ?? 0,
      quotaAideFpp: c.filiere.quotaAideFpp ?? 0,
      formule: r.formule,
    }
  }

  return {
    serie: releve.serie,
    moyenneGenerale: releve.moyenneGenerale ?? null,
    mention:
      releve.moyenneGenerale !== undefined ? mentionPour(releve.moyenneGenerale) : null,
    notes: releve.lignes.map((l) => ({
      matiere: l.matiere,
      note: l.note,
      coefficient: l.coefficient,
    })),
    nombreFilieresOuvertes: classees.length,
    nombreCalculables: calculees.length,
    nombreSurConcours: classees.filter((c) => c.filiere.modeEntree === "concours").length,
    meilleures: calculees.slice(0, NB_MEILLEURES).map(enChiffres),
    plusBasses: calculees.slice(-NB_PLUS_BASSES).map((c) => {
      const x = enChiffres(c)
      return { filiere: x.filiere, moyenne: x.moyenne, formule: x.formule }
    }),
  }
}

/** Tous les nombres que le modèle a le droit d'écrire. */
function nombresAutorises(d: DonneesExplication): Set<string> {
  const ok = new Set<string>()
  const ajouter = (n: number) => {
    ok.add(String(n))
    ok.add(n.toFixed(1))
    ok.add(n.toFixed(2))
    ok.add(String(Math.round(n)))
  }

  if (d.moyenneGenerale !== null) ajouter(d.moyenneGenerale)
  for (const n of d.notes) {
    ajouter(n.note)
    ajouter(n.coefficient)
  }
  ajouter(d.nombreFilieresOuvertes)
  ajouter(d.nombreCalculables)
  ajouter(d.nombreSurConcours)
  for (const m of d.meilleures) {
    ajouter(m.moyenne)
    ajouter(m.quotaBourse)
    ajouter(m.quotaAideFpp)
  }
  for (const m of d.plusBasses) ajouter(m.moyenne)
  // La somme des coefficients apparaît au dénominateur de chaque formule.
  const sommeCoef = d.notes.reduce((s, n) => s + n.coefficient, 0)
  ajouter(sommeCoef)
  // Seuils de mention et bornes de notation : constantes du système béninois.
  for (const n of [0, 3, 10, 12, 14, 16, 20]) ajouter(n)
  return ok
}

/**
 * Nombres présents dans le texte mais absents des données transmises.
 * Un résultat non vide signifie que le modèle a inventé : on jette le texte.
 */
export function chiffresInventes(texte: string, d: DonneesExplication): string[] {
  const autorises = nombresAutorises(d)
  const trouves = texte.match(/\d+(?:[.,]\d+)?/g) ?? []
  const inventes = new Set<string>()
  for (const brut of trouves) {
    const normalise = brut.replace(",", ".")
    if (autorises.has(normalise)) continue
    // « 17.3 » quand la donnée vaut 17.31 : même valeur affichée autrement.
    const n = Number(normalise)
    if (Number.isFinite(n) && [...autorises].some((a) => Math.abs(Number(a) - n) < 0.005)) {
      continue
    }
    inventes.add(brut)
  }
  return [...inventes]
}

export class ExplicationIndisponible extends Error {}

/**
 * Produit le commentaire des résultats, ou lève si rien de fiable ne peut
 * être affiché. L'appelant doit traiter l'absence d'explication comme un cas
 * normal : le reste de la page se lit sans elle.
 */
export async function expliquer(d: DonneesExplication): Promise<string> {
  if (!hasMistralKey()) {
    throw new ExplicationIndisponible("Clé Mistral absente.")
  }
  if (!d.meilleures.length) {
    throw new ExplicationIndisponible("Aucune moyenne calculée à commenter.")
  }

  const client = getMistralClient()
  const reponse = await client.chat.complete({
    model: MODELS.large,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_ORIENTATION },
      { role: "user", content: buildPromptOrientation(d) },
    ],
  })

  const contenu = reponse.choices?.[0]?.message?.content
  const texte = (typeof contenu === "string" ? contenu : "").trim()
  if (!texte) {
    throw new ExplicationIndisponible("Le modèle n'a rien renvoyé.")
  }

  const inventes = chiffresInventes(texte, d)
  if (inventes.length) {
    throw new ExplicationIndisponible(
      `Chiffres non vérifiables dans l'explication : ${inventes.join(", ")}.`,
    )
  }
  return texte
}
