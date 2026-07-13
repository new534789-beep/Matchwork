/**
 * Récupère le contenu texte d'une page web (best-effort) pour l'enrichissement IA.
 * Renvoie null si la page est inaccessible / non-HTML : l'item garde alors les
 * données du flux (et « non précisé » pour le reste).
 */
export async function recupererContenuPage(url: string, maxChars = 12000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MatchworkBot/1.0 (+https://matchwork.app)" },
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) return null;
    const html = await res.text();
    const texte = htmlVersTexte(html).slice(0, maxChars);
    return texte.length > 80 ? texte : null;
  } catch {
    return null;
  }
}

function htmlVersTexte(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
