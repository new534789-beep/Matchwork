/**
 * Outils de texte partagés par les générateurs de PDF.
 *
 * Les polices standard de pdf-lib sont encodées en WinAnsi : les accents
 * français passent, mais pas les apostrophes typographiques ni les tirets
 * longs. D'où `assainir`, appliqué avant tout tracé.
 */

import type { PDFFont, PDFPage, rgb } from "pdf-lib";

/** A4 en points. */
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;

/** Remplace les caractères absents de WinAnsi par un équivalent sûr. */
export function assainir(texte: string): string {
  return texte
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/«/g, "<<")
    .replace(/»/g, ">>");
}

/** Découpe un texte en lignes tenant dans `largeurMax`. */
export function decouperLignes(
  texte: string,
  police: PDFFont,
  taille: number,
  largeurMax: number,
): string[] {
  const lignes: string[] = [];
  for (const paragraphe of assainir(texte).split("\n")) {
    if (paragraphe.trim() === "") {
      lignes.push("");
      continue;
    }
    let courante = "";
    for (const mot of paragraphe.split(/\s+/)) {
      const essai = courante ? `${courante} ${mot}` : mot;
      try {
        if (police.widthOfTextAtSize(essai, taille) > largeurMax && courante) {
          lignes.push(courante);
          courante = mot;
        } else {
          courante = essai;
        }
      } catch {
        if (courante) lignes.push(courante);
        courante = mot.replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
      }
    }
    if (courante) lignes.push(courante);
  }
  return lignes;
}

/** Tronque un texte à `largeurMax`, avec des points de suspension. */
export function tronquer(
  texte: string,
  police: PDFFont,
  taille: number,
  largeurMax: number,
): string {
  const t = assainir(texte);
  if (police.widthOfTextAtSize(t, taille) <= largeurMax) return t;
  let court = t;
  while (court.length > 1 && police.widthOfTextAtSize(court + "...", taille) > largeurMax) {
    court = court.slice(0, -1);
  }
  return court.trimEnd() + "...";
}

/** Trace du texte sans jamais lever, même sur un caractère non encodable. */
export function tracerTexte(
  page: PDFPage,
  texte: string,
  opts: {
    x: number;
    y: number;
    size: number;
    font: PDFFont;
    color: ReturnType<typeof rgb>;
  },
): void {
  try {
    page.drawText(assainir(texte), opts);
  } catch {
    page.drawText(assainir(texte).replace(/[^\x20-\x7E\xA0-\xFF]/g, ""), opts);
  }
}
