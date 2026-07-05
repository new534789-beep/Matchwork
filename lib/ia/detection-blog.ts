import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_PROMPT_DETECTION_BLOG } from "@/lib/ia/prompts/detection-blog";

export type ResultatDetectionBlog = {
  estBlog: boolean;
  confiance: number;
  raison: string;
};

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
 * Demande à Mistral IA si un contenu est un article de blog ou une vraie offre.
 * Renvoie null si l'IA est indisponible ou si la réponse n'est pas exploitable.
 */
export async function detecterBlog(
  intitule: string,
  description: string,
): Promise<ResultatDetectionBlog | null> {
  if (!hasMistralKey()) return null;
  const titre = intitule.trim().slice(0, 240);
  const desc = (description || "").trim().slice(0, 2000);
  if (!titre && !desc) return null;

  try {
    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_DETECTION_BLOG },
        { role: "user", content: `Titre : ${titre}\n\nDescription :\n${desc}` },
      ],
      responseFormat: { type: "json_object" },
    });

    const brut = (result.choices?.[0]?.message?.content as string) ?? "";
    const json = parserJsonDefensif(brut);
    if (!json) return null;

    const estBlog = json.est_blog === true;
    const confiance = typeof json.confiance === "number"
      ? Math.max(0, Math.min(1, json.confiance))
      : 0.5;
    const raison = typeof json.raison === "string" ? json.raison.slice(0, 200) : "Détection IA";

    return { estBlog, confiance, raison };
  } catch {
    return null;
  }
}
