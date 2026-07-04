import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquante dans .env.local");
  return new GoogleGenerativeAI(apiKey);
}

export function hasGeminiKey() {
  return !!process.env.GEMINI_API_KEY;
}

// Modèles utilisés dans l'app
export const MODELS = {
  // Tâches complexes : onboarding, analyse d'offre
  pro: "gemini-2.0-flash",
  // Tâches rapides : traduction, extraction de document
  flash: "gemini-2.0-flash-lite",
} as const;
