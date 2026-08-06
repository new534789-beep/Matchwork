import { appelJSON, iaDisponible } from "@/lib/ia/generer";
import { SYSTEM_PROMPT_DETECTION_BLOG } from "@/lib/ia/prompts/detection-blog";

export type ResultatDetectionBlog = {
  estBlog: boolean;
  confiance: number;
  raison: string;
};

/**
 * Demande à l'IA si un contenu est un article de blog ou une vraie offre.
 * Renvoie null si l'IA est indisponible ou si la réponse n'est pas exploitable.
 */
export async function detecterBlog(
  intitule: string,
  description: string,
): Promise<ResultatDetectionBlog | null> {
  if (!iaDisponible()) return null;
  const titre = intitule.trim().slice(0, 240);
  const desc = (description || "").trim().slice(0, 2000);
  if (!titre && !desc) return null;

  const json = await appelJSON({
    tache: "detection-blog",
    system: SYSTEM_PROMPT_DETECTION_BLOG,
    user: `Titre : ${titre}\n\nDescription :\n${desc}`,
    niveau: "leger",
  });
  if (!json) return null;

  const estBlog = json.est_blog === true;
  const confiance = typeof json.confiance === "number"
    ? Math.max(0, Math.min(1, json.confiance))
    : 0.5;
  const raison = typeof json.raison === "string" ? json.raison.slice(0, 200) : "Détection IA";

  return { estBlog, confiance, raison };
}
