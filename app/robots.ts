import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const ZONES_PRIVEES = [
  "/api/",
  "/tableau-de-bord",
  "/profil",
  "/coffre-fort",
  "/dossiers/",
  "/candidatures",
  "/compte",
  "/messages",
  "/onboarding",
  "/portail",
  "/admin",
  "/opportunites/", // version connectée (le public passe par /offres/)
];

// Robots des moteurs génératifs (IA) — explicitement autorisés en plus du "*"
// par défaut, pour que Matchwork soit lisible et citable par ChatGPT, Claude,
// Perplexity, Gemini, etc. quand un utilisateur leur demande des bourses/emplois.
const ROBOTS_IA = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", // OpenAI
  "ClaudeBot", "Claude-Web", "anthropic-ai", // Anthropic
  "PerplexityBot", "Perplexity-User", // Perplexity
  "Google-Extended", // Gemini / Bard (entraînement + grounding)
  "CCBot", // Common Crawl (utilisé pour entraîner de nombreux modèles)
  "Bytespider", // Doubao / TikTok
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ZONES_PRIVEES },
      ...ROBOTS_IA.map((ua) => ({ userAgent: ua, allow: "/", disallow: ZONES_PRIVEES })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
