/**
 * Filet de sécurité : les documents générés sont du texte brut affiché tel
 * quel (PDF, aperçu écran, e-mail) — aucun moteur n'interprète le markdown.
 * Le prompt interdit déjà cette syntaxe, mais un modèle peut l'ignorer :
 * on la retire ici pour ne jamais laisser fuir des "**", "#" ou "---" bruts
 * qui trahiraient un texte généré par IA mal nettoyé.
 */
export function nettoyerMarkdown(texte: string): string {
  return texte
    .replace(/^#{1,6}\s*/gm, "") // titres "#", "##"...
    .replace(/\*\*(.+?)\*\*/g, "$1") // **gras**
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1") // *italique*
    .replace(/^[-_*]{2,}\s*(.*?)\s*[-_*]{2,}$/gm, "$1") // "--- Titre ---" → "Titre"
    .replace(/^[-_*]{3,}\s*$/gm, "") // séparateurs purs "---", "___", "***"
    .replace(/^[-*•]\s+/gm, "") // puces en début de ligne
    .replace(/`/g, "") // backticks
    .replace(/^[A-Za-zÀ-ÿ0-9 /'()-]{2,40}:[ \t]*$/gm, "") // libellé de champ sans valeur ("Nationalité : ")
    .replace(/\n{3,}/g, "\n\n") // lignes vides accumulées par le nettoyage
    .trim();
}
