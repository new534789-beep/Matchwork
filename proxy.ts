import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Proxy (ex-middleware, renommé en Next 16). Deux rôles :
 *
 * 1. Canonicalisation d'hôte — en production, tout le trafic arrivant sur un
 *    ancien alias (ex. matchwork-seven.vercel.app) est redirigé (308) vers le
 *    domaine canonique matchworks.app. Indispensable pour l'authentification
 *    Google : sans ça, un flux OAuth démarré sur l'ancien domaine revient sur
 *    le nouveau (redirect_uri construit depuis AUTH_URL = matchworks.app), et
 *    le cookie de vérification OAuth (state / PKCE), posé sur l'ancien domaine,
 *    n'est pas renvoyé au nouveau → NextAuth rejette avec « InvalidCheck » et la
 *    connexion échoue par une erreur serveur. Consolide aussi le SEO sur un seul
 *    domaine.
 *
 * 2. Anti-scraping léger du catalogue public (/offres/*) : seuil généreux
 *    (60 req/min/IP) pour ne pas gêner la navigation ni les crawlers légitimes,
 *    mais assez bas pour ralentir un aspirateur massif du catalogue.
 */

// Hôte canonique (ex. "matchworks.app"), extrait de NEXT_PUBLIC_SITE_URL.
const CANONICAL_HOST = (() => {
  try {
    return new URL(getSiteUrl()).host;
  } catch {
    return null;
  }
})();

export const config = {
  // Tout sauf les assets Next : couvre les pages, /api/auth/* (canonicalisation
  // d'hôte) et /offres/* (anti-scraping). Les fichiers _next et favicon sont
  // exclus pour ne pas alourdir chaque requête d'asset.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(req: NextRequest) {
  // ─── 1. Canonicalisation d'hôte ─────────────────────────────────────────────
  const currentHost = req.headers.get("host");
  if (
    process.env.VERCEL_ENV === "production" &&
    CANONICAL_HOST &&
    currentHost &&
    currentHost !== CANONICAL_HOST
  ) {
    const url = req.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    // 308 = redirection permanente qui préserve la méthode HTTP (GET/POST).
    return NextResponse.redirect(url, 308);
  }

  // ─── 2. Anti-scraping du catalogue public ───────────────────────────────────
  if (req.nextUrl.pathname.startsWith("/offres")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { ok } = await rateLimit(`offres-public:${ip}`, 60, 60_000);
    if (!ok) {
      console.warn(`[anti-scraping] IP throttlée sur ${req.nextUrl.pathname} : ${ip}`);
      return new NextResponse("Trop de requêtes. Réessayez dans une minute.", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }
  }

  return NextResponse.next();
}
