/**
 * Respect minimal de robots.txt. On récupère le fichier une fois par hôte
 * (mis en cache pour le passage), on collecte les règles Disallow applicables
 * (User-agent: * ou notre bot), et on vérifie si une URL est autorisée.
 * Absence / erreur de robots.txt → autorisé (comportement usuel des crawlers).
 */

const UA = "matchworkbot";
const cache = new Map<string, string[]>(); // origin → chemins Disallow applicables

function parserRobots(txt: string): string[] {
  const disallow: string[] = [];
  let applicable = false;
  for (const brute of txt.split(/\r?\n/)) {
    const ligne = brute.replace(/#.*$/, "").trim();
    if (!ligne) continue;
    const m = ligne.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const champ = m[1].toLowerCase();
    const val = m[2].trim();
    if (champ === "user-agent") {
      const ua = val.toLowerCase();
      applicable = ua === "*" || ua.includes(UA);
    } else if (champ === "disallow" && applicable && val) {
      disallow.push(val);
    }
  }
  return disallow;
}

async function chargerDisallow(origin: string): Promise<string[]> {
  const cached = cache.get(origin);
  if (cached) return cached;
  let regles: string[] = [];
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${origin}/robots.txt`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MatchworkBot/1.0 (+https://matchwork.app)" },
    });
    clearTimeout(t);
    if (res.ok) regles = parserRobots(await res.text());
  } catch {
    regles = [];
  }
  cache.set(origin, regles);
  return regles;
}

/** true si l'URL est autorisée au crawl selon robots.txt (ou si robots absent). */
export async function urlAutorisee(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const disallow = await chargerDisallow(u.origin);
    if (disallow.length === 0) return true;
    const chemin = u.pathname + u.search;
    return !disallow.some((d) => d !== "" && chemin.startsWith(d));
  } catch {
    return false;
  }
}
