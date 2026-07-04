import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_PROMPT_EXTRACTION_DATE_LIMITE } from "@/lib/ia/prompts/extraction-date-limite";
import { parseDateLimite } from "@/lib/ia/extraction-offre";

export type DateLimiteExtraite = {
  dateLimite: Date | null;
  confiance: number | null; // 0 à 1
  source: string | null;
};

/** Borne une valeur de confiance dans [0, 1] ; renvoie null si inexploitable. */
function normaliserConfiance(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  if (isNaN(n)) return null;
  return Math.max(0, Math.min(1, n));
}

/**
 * Parse défensif d'une réponse IA : retire d'éventuelles balises ``` (```json …),
 * isole le premier objet JSON, puis JSON.parse. Renvoie null si rien d'exploitable.
 */
function parserJsonDefensif(brut: string): Record<string, unknown> | null {
  const sansFences = brut.replace(/```(?:json)?/gi, "").trim();
  const match = sansFences.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extraction CIBLÉE de la date limite via la couche fournisseur IA (Mistral).
 * On lui passe titre + description + date du jour. N'invente rien : renvoie null
 * si l'IA est indisponible ou si la réponse n'est pas exploitable.
 *
 * @param titre      Titre de l'offre
 * @param texte      Description (flux) ou texte de la page liée
 * @param aujourdhui Date du jour au format YYYY-MM-DD (pour résoudre les dates relatives)
 */
export async function extraireDateLimite(
  titre: string,
  texte: string,
  aujourdhui: string,
): Promise<DateLimiteExtraite | null> {
  if (!hasMistralKey()) return null;
  const description = texte.trim().slice(0, 8000);
  if (!titre.trim() && !description) return null;

  try {
    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small, // tâche légère : extraction ciblée d'une seule date
      messages: [
        { role: "system", content: SYSTEM_PROMPT_EXTRACTION_DATE_LIMITE },
        {
          role: "user",
          content: `Date du jour : ${aujourdhui}\n\nTitre : ${titre}\n\nDescription :\n${description}`,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    const brut = (result.choices?.[0]?.message?.content as string) ?? "";
    const json = parserJsonDefensif(brut);
    if (!json) return null;

    const dateLimite = parseDateLimite((json.deadline_at as string) ?? null);
    const confiance = normaliserConfiance(json.deadline_confidence);
    const sourceBrute = json.deadline_source;
    const source =
      typeof sourceBrute === "string" && sourceBrute.trim() && sourceBrute !== "non précisé"
        ? sourceBrute.slice(0, 200)
        : null;

    return { dateLimite, confiance, source };
  } catch {
    return null;
  }
}
