import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_PROMPT_LIRE_OFFRE } from "@/lib/ia/prompts/lire-offre";

export type PieceExigee = { nom: string; obligatoire: boolean; categorie?: string; type?: string };

export type OffreExtraite = {
  organisme?: string;
  intitule?: string;
  description?: string;
  conditions?: string;
  piecesExigees?: PieceExigee[];
  exigenceLangue?: string;
  dateLimite?: string | null;
  lien?: string | null;
  langueDetectee?: string;
  type?: string;
  canalCandidature?: string;
  cibleCandidature?: string | null;
};

export const CANAUX = ["email", "formulaire", "lien_info", "aucun"] as const;

/** Valide/normalise le canal de candidature renvoyé par l'IA (défaut : "aucun"). */
export function normaliserCanal(v: unknown): string {
  return typeof v === "string" && (CANAUX as readonly string[]).includes(v) ? v : "aucun";
}

export function iaDisponible(): boolean {
  return hasMistralKey();
}

/**
 * Moteur d'extraction partagé (utilisé par « coller une offre » ET l'ingestion RSS).
 * N'invente rien : renvoie null si l'IA est indisponible ou si la réponse n'est pas exploitable.
 */
export async function extraireOffre(contenu: string): Promise<OffreExtraite | null> {
  if (!hasMistralKey()) return null;
  const texte = contenu.trim().slice(0, 15000);
  if (!texte) return null;

  try {
    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.large,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_LIRE_OFFRE },
        { role: "user", content: `Voici le texte de l'offre à analyser :\n\n${texte}` },
      ],
      responseFormat: { type: "json_object" },
    });
    const reponse = (result.choices?.[0]?.message?.content as string) ?? "";
    const match = reponse.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as OffreExtraite;
  } catch {
    return null;
  }
}

/** Convertit une date extraite en Date valide ou null (jamais inventée). */
export function parseDateLimite(v?: string | null): Date | null {
  if (!v || v === "non précisé") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
