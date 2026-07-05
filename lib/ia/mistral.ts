import { Mistral } from "@mistralai/mistralai";

// Rotation de clés : MISTRAL_API_KEY peut contenir plusieurs clés séparées par des virgules.
// Lecture lazy pour que dotenv ait le temps de charger.
let _keys: string[] | null = null;
let _keyIndex = 0;
const _clients = new Map<string, Mistral>();

function getKeys(): string[] {
  if (!_keys) {
    _keys = (process.env.MISTRAL_API_KEY ?? "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return _keys;
}

export function getMistralClient(): Mistral {
  const keys = getKeys();
  if (keys.length === 0) throw new Error("MISTRAL_API_KEY manquante dans .env.local");
  const key = keys[_keyIndex % keys.length];
  _keyIndex++;
  let client = _clients.get(key);
  if (!client) {
    client = new Mistral({ apiKey: key });
    _clients.set(key, client);
  }
  return client;
}

export function hasMistralKey(): boolean {
  return getKeys().length > 0;
}

export function nombreClesMistral(): number {
  return getKeys().length;
}

export const MODELS = {
  large: "mistral-large-latest",   // Tâches complexes : onboarding, génération, analyse offre
  small: "mistral-small-latest",   // Tâches rapides : traduction, extraction légère
  vision: "pixtral-large-latest",  // Images / documents visuels
} as const;
