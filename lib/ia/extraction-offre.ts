import { appelJSON, iaDisponible as routeurDisponible } from "@/lib/ia/generer";
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

export function estEmailValide(v: string | null | undefined): v is string {
  return !!v && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

export function estUrlValide(v: string | null | undefined): v is string {
  if (!v) return false;
  try { const u = new URL(v.trim()); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}

/**
 * Une offre n'a sa place dans le catalogue que si on sait où orienter le
 * candidat : un e-mail valide, un lien de formulaire précis, ou — pour les
 * grands programmes qui fonctionnent par portail complet (Chevening,
 * Fulbright, Erasmus Mundus...) — un lien officiel exact ("lien_info").
 * Seul un canal vraiment indéterminé ("aucun") est rejeté : Matchwork ne
 * propose jamais "voir sur le site" sans savoir précisément où.
 */
export function canalCandidatureFiable(canal: string | null | undefined, cible: string | null | undefined): boolean {
  if (canal === "email") return estEmailValide(cible);
  if (canal === "formulaire" || canal === "lien_info") return estUrlValide(cible);
  return false;
}

export function iaDisponible(): boolean {
  return routeurDisponible();
}

/**
 * Moteur d'extraction partagé (utilisé par « coller une offre » ET l'ingestion RSS).
 * N'invente rien : renvoie null si l'IA est indisponible ou si la réponse n'est pas exploitable.
 */
export async function extraireOffre(contenu: string): Promise<OffreExtraite | null> {
  if (!iaDisponible()) return null;
  const texte = contenu.trim().slice(0, 15000);
  if (!texte) return null;

  const parsed = await appelJSON<OffreExtraite>({
    tache: "lecture-offre",
    system: SYSTEM_PROMPT_LIRE_OFFRE,
    user: `Voici le texte de l'offre à analyser :\n\n${texte}`,
    niveau: "complexe",
  });
  if (!parsed) return null;
  // L'IA renvoie parfois conditions comme un tableau — normaliser en string.
  if (Array.isArray(parsed.conditions)) {
    parsed.conditions = (parsed.conditions as string[]).join("\n");
  }
  return parsed;
}

/** Convertit une date extraite en Date valide ou null (jamais inventée). */
export function parseDateLimite(v?: string | null): Date | null {
  if (!v || v === "non précisé") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
