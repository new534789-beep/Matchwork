import { appelJSON, iaDisponible } from "@/lib/ia/generer";
import { SYSTEM_DOMAINES, buildDomainesMessage } from "@/lib/ia/prompts/domaines";
import { DOMAINES_VALEURS } from "@/lib/domaines";

/**
 * Classe une opportunité dans un ou plusieurs domaines (droit, maths-info,
 * santé...) via l'IA. Fail-open : renvoie null si l'IA est indisponible ou en
 * cas d'erreur — ne doit JAMAIS bloquer la publication d'une offre.
 */
export async function classifierDomaines(input: {
  intitule: string;
  description: string;
  conditions?: string | null;
}): Promise<string[] | null> {
  if (!iaDisponible()) return null;
  if (!input.intitule?.trim()) return null;

  const parsed = await appelJSON<{ domaines?: unknown }>({
    tache: "classification-domaines",
    system: SYSTEM_DOMAINES,
    user: buildDomainesMessage(input),
    niveau: "leger",
  });
  if (!parsed) return null;
  if (!Array.isArray(parsed.domaines)) return [];
  return parsed.domaines.filter((d): d is string => typeof d === "string" && DOMAINES_VALEURS.includes(d));
}
