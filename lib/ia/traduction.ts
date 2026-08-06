import { appelJSON, iaDisponible } from "@/lib/ia/generer";

const SYS = `Tu es un traducteur professionnel. Traduis FIDÈLEMENT en français les champs fournis (INTITULE, DESCRIPTION, CONDITIONS).
Règles : si un champ est déjà en français, renvoie-le TEL QUEL. Ne résume pas, ne reformule pas, n'invente RIEN, ne rajoute rien.
Réponds en JSON strict : {"intitule":"...","description":"...","conditions":"..."} — "conditions" vaut "" s'il est absent.`;

export type ChampsOffre = { intitule: string; description: string; conditions?: string | null };

/**
 * Traduit en français l'intitulé, la description et les conditions d'une offre.
 * Renvoie null si l'IA est indisponible ou la réponse inexploitable (on garde alors l'original).
 * N'invente rien ; un champ déjà en français est conservé tel quel.
 */
export async function traduireOffreFr(champs: ChampsOffre): Promise<{ intitule: string; description: string; conditions: string | null } | null> {
  if (!iaDisponible()) return null;
  const src = [
    `INTITULE: ${champs.intitule ?? ""}`,
    `DESCRIPTION: ${champs.description ?? ""}`,
    champs.conditions ? `CONDITIONS: ${champs.conditions}` : "",
  ].filter(Boolean).join("\n\n").slice(0, 9000);
  if (!src.trim()) return null;

  const p = await appelJSON<{ intitule?: string; description?: string; conditions?: string }>({
    tache: "traduction-offre",
    system: SYS,
    user: src,
    niveau: "leger",
  });
  if (!p) return null;
  if (!p.intitule && !p.description) return null;
  return {
    intitule: (p.intitule || champs.intitule).slice(0, 240),
    description: (p.description || champs.description).slice(0, 4000),
    conditions: p.conditions ? p.conditions.slice(0, 2000) : (champs.conditions ?? null),
  };
}
