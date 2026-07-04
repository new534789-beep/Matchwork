import { Mistral } from "@mistralai/mistralai";

let _client: Mistral | null = null;

export function getMistralClient(): Mistral {
  if (!_client) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY manquante dans .env.local");
    _client = new Mistral({ apiKey });
  }
  return _client;
}

export function hasMistralKey(): boolean {
  return !!process.env.MISTRAL_API_KEY;
}

export const MODELS = {
  large: "mistral-large-latest",   // Tâches complexes : onboarding, génération, analyse offre
  small: "mistral-small-latest",   // Tâches rapides : traduction, extraction légère
  vision: "pixtral-large-latest",  // Images / documents visuels
} as const;
