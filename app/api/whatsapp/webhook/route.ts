import { NextResponse } from "next/server";

/**
 * Webhook WhatsApp Cloud API (Meta).
 *   GET  → poignée de vérification exigée par Meta à la configuration du webhook.
 *   POST → réception des messages entrants. V1 minimal : accuse réception et
 *          renvoie un message de confirmation, pour prouver que la connexion
 *          fonctionne de bout en bout avant de brancher la vraie logique
 *          (génération de dossier, alertes) dans une prochaine étape.
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

type MessageEntrant = { from: string; id: string; type: string; text?: { body: string } };
type WebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: { messages?: MessageEntrant[] };
    }>;
  }>;
};

async function envoyerMessage(to: string, texte: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) {
    console.warn("[whatsapp] WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID manquant — réponse non envoyée.");
    return;
  }
  await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: texte },
    }),
  }).catch((e) => console.error("[whatsapp] échec envoi message :", e));
}

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as WebhookPayload | null;

  // Répondre vite (Meta réessaie si pas de 200 rapide) — le traitement réel
  // ne doit jamais bloquer l'accusé de réception.
  const messages = payload?.entry?.[0]?.changes?.[0]?.value?.messages ?? [];
  for (const m of messages) {
    if (m.type === "text" && m.text?.body) {
      // V1 : simple accusé de réception, pour valider la connexion de bout en
      // bout. La vraie logique (lier le numéro à un compte, générer un
      // dossier, etc.) viendra remplacer ceci à l'étape suivante.
      void envoyerMessage(m.from, "Bonjour, ici Matchwork. La connexion WhatsApp fonctionne — la suite arrive bientôt.");
    }
  }

  return NextResponse.json({ ok: true });
}
