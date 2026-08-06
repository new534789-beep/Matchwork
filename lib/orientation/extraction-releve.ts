/**
 * Lecture d'un relevé de notes à partir d'une photo.
 *
 * Le candidat photographie son relevé ; on en extrait les notes ET les
 * coefficients tels qu'imprimés. Aucun coefficient n'est complété ni deviné :
 * ce qui n'est pas lisible revient `null`.
 *
 * Garde-fous, dans l'ordre d'importance :
 *
 * 1. Le modèle ne fait que **lire**. Il ne calcule rien : la moyenne est
 *    calculée ensuite par `calcul.ts`, en TypeScript déterministe.
 * 2. On ne lui demande que les matières utiles à la série du candidat
 *    (`vocabulaire.ts`), et il doit répondre `null` pour toute valeur qu'il
 *    n'arrive pas à lire. Une photo floue doit produire un trou, pas une
 *    invention.
 * 3. Tout ce qui revient est revalidé ici (bornes, types, matières attendues)
 *    puis soumis au candidat pour confirmation avant le moindre calcul.
 */

import { getMistralClient, hasMistralKey, MODELS } from "@/lib/ia/mistral"

import { canoniserMatiere, memeMatiere } from "./matieres"
import type { Serie } from "./types"
import { matieresUtiles, suitRegleEpreuvesEcrites } from "./vocabulaire"

export type LigneExtraite = {
  matiere: string
  /** `null` si la valeur n'a pas pu être lue sur la photo. */
  note: number | null
  coefficient: number | null
  /** `true` si le modèle a identifié une épreuve écrite (règle DEAT). */
  epreuveEcrite?: boolean
  /** Ce que le modèle dit avoir lu, pour aider le candidat à vérifier. */
  litteral?: string
}

export type ReleveExtrait = {
  lignes: LigneExtraite[]
  /** Moyenne générale lue sur le relevé. Jamais recalculée à partir des notes. */
  moyenneGenerale: number | null
  /** Série lue sur le document, si elle y figure — sert à alerter en cas d'écart. */
  serieLue: string | null
  /** Difficultés de lecture signalées par le modèle. */
  avertissements: string[]
}

export class ExtractionIndisponible extends Error {}

const BORNE_NOTE = { min: 0, max: 20 }
const COEFFICIENT_MAX = 20

function construirePrompt(serie: Serie): string {
  const attendues = matieresUtiles(serie)
  const regleEcrites = suitRegleEpreuvesEcrites(serie)

  return [
    "Tu lis la photo d'un relevé de notes du baccalauréat béninois.",
    `La série déclarée par le candidat est : ${serie}.`,
    "",
    "Ta seule tâche est de RECOPIER ce qui est écrit sur le document.",
    "Tu ne calcules rien. Tu ne complètes rien. Tu ne déduis rien.",
    "",
    regleEcrites
      ? "Relève TOUTES les matières du document, et indique pour chacune s'il s'agit d'une épreuve écrite."
      : `Relève uniquement ces matières, si elles figurent sur le document :\n${attendues
          .map((m) => `  - ${m}`)
          .join("\n")}`,
    "",
    "Règles absolues :",
    "  - Une note ou un coefficient que tu ne lis pas clairement : réponds null.",
    "  - N'invente jamais une valeur plausible. Un trou vaut mieux qu'une erreur.",
    "  - Ne mets pas une matière qui n'apparaît pas sur le document.",
    "  - Recopie le coefficient imprimé, même s'il te paraît inhabituel.",
    "  - Les notes sont sur 20.",
    "  - Dans `litteral`, recopie le texte brut de la ligne tel que tu le vois.",
    "  - Signale dans `avertissements` toute zone floue, coupée ou masquée.",
    "",
    "Réponds uniquement par un objet JSON de cette forme :",
    "{",
    '  "lignes": [{"matiere": "...", "note": 12.5, "coefficient": 4,',
    '              "epreuveEcrite": true, "litteral": "..."}],',
    '  "moyenneGenerale": 11.87,',
    '  "serieLue": "D",',
    '  "avertissements": ["..."]',
    "}",
  ].join("\n")
}

type BrutModele = {
  lignes?: unknown
  moyenneGenerale?: unknown
  serieLue?: unknown
  avertissements?: unknown
}

function nombreOuNull(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : v
  if (typeof n !== "number" || !Number.isFinite(n)) return null
  if (n < min || n > max) return null
  return n
}

/**
 * Revalide la sortie du modèle. Toute valeur douteuse devient `null` : la
 * couche d'affichage la présentera comme à compléter par le candidat.
 */
export function normaliserExtraction(
  brut: BrutModele,
  serie: Serie,
): ReleveExtrait {
  const avertissements: string[] = Array.isArray(brut.avertissements)
    ? brut.avertissements.filter((a): a is string => typeof a === "string")
    : []

  const attendues = matieresUtiles(serie)
  const toutAccepter = suitRegleEpreuvesEcrites(serie)

  const lignes: LigneExtraite[] = []
  const vues = new Set<string>()

  for (const l of Array.isArray(brut.lignes) ? brut.lignes : []) {
    if (!l || typeof l !== "object") continue
    const o = l as Record<string, unknown>
    if (typeof o.matiere !== "string" || !o.matiere.trim()) continue

    // On n'accepte que les matières utiles à la série, sauf sous règle DEAT
    // où le guide impose de considérer tout le relevé.
    const correspond = attendues.find((a) => memeMatiere(a, o.matiere as string))
    if (!toutAccepter && !correspond) continue

    const matiere = correspond ?? canoniserMatiere(o.matiere)
    if (vues.has(matiere)) continue
    vues.add(matiere)

    lignes.push({
      matiere,
      note: nombreOuNull(o.note, BORNE_NOTE.min, BORNE_NOTE.max),
      coefficient: nombreOuNull(o.coefficient, 0.5, COEFFICIENT_MAX),
      epreuveEcrite: o.epreuveEcrite === true,
      litteral: typeof o.litteral === "string" ? o.litteral : undefined,
    })
  }

  const serieLue = typeof brut.serieLue === "string" ? brut.serieLue.trim() : null
  if (serieLue && !serieLue.toUpperCase().includes(serie.toUpperCase())) {
    avertissements.push(
      `La série lue sur le document (${serieLue}) ne correspond pas à la série déclarée (${serie}).`,
    )
  }

  const manquantes = attendues.filter(
    (a) => !lignes.some((l) => memeMatiere(l.matiere, a)),
  )
  if (!toutAccepter && manquantes.length) {
    avertissements.push(
      `Matières non trouvées sur la photo : ${manquantes.join(", ")}.`,
    )
  }
  for (const l of lignes) {
    if (l.note === null || l.coefficient === null) {
      avertissements.push(`${l.matiere} : valeur illisible, à compléter.`)
    }
  }

  return {
    lignes,
    moyenneGenerale: nombreOuNull(brut.moyenneGenerale, BORNE_NOTE.min, BORNE_NOTE.max),
    serieLue,
    avertissements,
  }
}

function extraireJson(texte: string): BrutModele {
  const nettoye = texte
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim()
  const debut = nettoye.indexOf("{")
  const fin = nettoye.lastIndexOf("}")
  if (debut === -1 || fin === -1) {
    throw new ExtractionIndisponible("Le modèle n'a pas renvoyé de JSON exploitable.")
  }
  try {
    return JSON.parse(nettoye.slice(debut, fin + 1)) as BrutModele
  } catch {
    throw new ExtractionIndisponible("Le JSON renvoyé par le modèle est invalide.")
  }
}

/**
 * Lit un relevé photographié.
 *
 * @param imageDataUrl image en `data:` URL (JPEG, PNG ou WEBP)
 * @param serie série déclarée par le candidat à l'étape précédente
 */
export async function extraireReleveDepuisImage(
  imageDataUrl: string,
  serie: Serie,
): Promise<ReleveExtrait> {
  if (!hasMistralKey()) {
    throw new ExtractionIndisponible("Lecture de relevé indisponible : clé Mistral absente.")
  }

  const client = getMistralClient()
  const reponse = await client.chat.complete({
    model: MODELS.vision,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: construirePrompt(serie) },
          { type: "image_url", imageUrl: imageDataUrl },
        ],
      },
    ],
  })

  const contenu = reponse.choices?.[0]?.message?.content
  const texte =
    typeof contenu === "string"
      ? contenu
      : Array.isArray(contenu)
        ? contenu
            .map((c) => (c.type === "text" ? c.text : ""))
            .join("")
        : ""

  if (!texte.trim()) {
    throw new ExtractionIndisponible("Le modèle n'a rien renvoyé.")
  }

  return normaliserExtraction(extraireJson(texte), serie)
}
