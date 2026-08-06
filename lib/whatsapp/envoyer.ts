import { absoluteUrl } from "@/lib/site-url";

/**
 * Envoi de messages via la WhatsApp Cloud API (Meta).
 *   - `envoyerTexte` : message libre, réservé aux réponses dans la fenêtre
 *     de 24 h ouverte par un message entrant (webhook).
 *   - `envoyerAlerteOffre` : message "business-initiated" — Meta exige un
 *     template approuvé. Le template doit être créé dans Meta Business
 *     Manager avec 4 variables : {{1}} score, {{2}} intitulé, {{3}} organisme,
 *     {{4}} lien. Le nom est configurable via WHATSAPP_TEMPLATE_NOM
 *     (défaut "alerte_offre_correspondance").
 */

const GRAPH_VERSION = "v22.0";
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEMPLATE_NOM = process.env.WHATSAPP_TEMPLATE_NOM || "alerte_offre_correspondance";
const TEMPLATE_LANGUE = process.env.WHATSAPP_TEMPLATE_LANGUE || "fr";

export type ResultatEnvoi = { ok: boolean; erreur?: string; statut?: number };

/** Normalise un numéro vers E.164 (format exigé par l'API). Renvoie null si
 *  le numéro ne porte pas un indicatif explicite (+ ou 00) : dans ce cas on ne
 *  devine pas le pays, on laisse l'utilisateur corriger son téléphone. */
export function normaliserTelephone(telephone: string | null | undefined): string | null {
  if (!telephone) return null;
  const net = telephone.replace(/[\s\-().]/g, "");
  if (net.startsWith("+")) return net;
  if (net.startsWith("00")) return `+${net.slice(2)}`;
  return null;
}

async function appelerAPI(body: unknown): Promise<ResultatEnvoi> {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    return { ok: false, erreur: "WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID non configurés" };
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true, statut: res.status };
    const detail = await res.text().catch(() => "");
    console.error("[whatsapp] envoi refusé", res.status, detail.slice(0, 500));
    return { ok: false, erreur: `HTTP ${res.status}`, statut: res.status };
  } catch (e) {
    console.error("[whatsapp] échec réseau :", e);
    return { ok: false, erreur: "réseau" };
  }
}

export async function envoyerTexte(to: string, texte: string): Promise<ResultatEnvoi> {
  return appelerAPI({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: texte },
  });
}

export type AlerteOffre = { score: number; intitule: string; organisme: string; url: string };

export async function envoyerAlerteOffre(to: string, a: AlerteOffre): Promise<ResultatEnvoi> {
  return appelerAPI({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: TEMPLATE_NOM,
      language: { code: TEMPLATE_LANGUE },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: String(a.score) },
            { type: "text", text: a.intitule },
            { type: "text", text: a.organisme },
            { type: "text", text: a.url },
          ],
        },
      ],
    },
  });
}

/** Construit le lien public d'une offre (bouton "postuler" du message). */
export function lienOffreWhatsapp(opportuniteId: string): string {
  return absoluteUrl(`/opportunites/${opportuniteId}?via=whatsapp`);
}
