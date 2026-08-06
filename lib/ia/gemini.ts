import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquante dans .env.local");
  return new GoogleGenerativeAI(apiKey);
}

export function hasGeminiKey() {
  return !!process.env.GEMINI_API_KEY;
}

// Alias « latest » volontaires : les modèles pinés (gemini-2.0-*) ont perdu leur
// quota gratuit et renvoient 429 « exceeded your current quota », alors qu'ils
// figurent toujours dans la liste des modèles. Les alias suivent la génération
// courante et gardent l'accès au palier gratuit sans intervention.
export const MODELS = {
  // Tâches complexes : lecture complète d'une offre
  complexe: "gemini-flash-latest",
  // Tâches légères : traduction, extraction ciblée, classification
  leger: "gemini-flash-lite-latest",
} as const;
