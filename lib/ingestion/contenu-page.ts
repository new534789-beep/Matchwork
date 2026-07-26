/**
 * Récupère le contenu texte d'une page web (best-effort) pour l'enrichissement IA.
 * Renvoie null si la page est inaccessible / non-HTML : l'item garde alors les
 * données du flux (et « non précisé » pour le reste).
 */
// Certaines pages renvoient un HTML anormalement volumineux (des Mo, parfois
// bien plus) — lire la réponse entière avant de la tronquer (comme le faisait
// l'ancienne version) peut suffire à épuiser la mémoire de la fonction sur
// une seule source, faisant planter tout le lot en cours (constaté en
// production sur ecowas.int). On plafonne donc la lecture au niveau du flux
// réseau lui-même, bien avant de tronquer au nombre de caractères voulu.
const MAX_OCTETS_LUS = 400_000;

export async function recupererContenuPage(url: string, maxChars = 12000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MatchworkBot/1.0 (+https://matchwork.app)" },
      redirect: "follow",
    });
    if (!res.ok || !res.body) { clearTimeout(t); return null; }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) { clearTimeout(t); return null; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let html = "";
    let octetsLus = 0;
    while (octetsLus < MAX_OCTETS_LUS) {
      const { done, value } = await reader.read();
      if (done) break;
      octetsLus += value.byteLength;
      html += decoder.decode(value, { stream: true });
    }
    await reader.cancel().catch(() => {});
    clearTimeout(t);

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
