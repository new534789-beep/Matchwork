import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

const LABEL_DOC: Record<string, string> = {
  cv: "CV",
  lettre: "Lettre de motivation",
  lettre_reco: "Lettre de recommandation",
  demande_manuscrite: "Demande manuscrite",
  projet_etudes: "Projet d'etudes",
  declaration: "Declaration personnelle",
  autre: "Document",
};

function labelDoc(t: string): string {
  return LABEL_DOC[t] ?? t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ");
}

function sanitize(text: string): string {
  return text
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/«/g, "<<")
    .replace(/»/g, ">>");
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of sanitize(text).split("\n")) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      try {
        const w = font.widthOfTextAtSize(test, fontSize);
        if (w > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      } catch {
        if (current) lines.push(current);
        current = word.replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawTextSafe(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: ReturnType<typeof rgb> }
) {
  try {
    page.drawText(sanitize(text), opts);
  } catch {
    page.drawText(sanitize(text).replace(/[^\x20-\x7E\xA0-\xFF]/g, ""), opts);
  }
}

// Une ligne de section ("FORMATION", "EXPÉRIENCE", ...) : courte, sans ponctuation de phrase,
// tout en majuscules une fois les accents neutralisés. Sert à styliser ces lignes en violet/gras
// dans les modèles sidebar/bandeau, à partir du même texte brut généré par l'IA.
function estLigneSection(ligne: string): boolean {
  const t = ligne.trim();
  if (!t || t.length > 40) return false;
  const sansAccents = t.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return sansAccents === sansAccents.toUpperCase() && /[A-ZÀ-Ý]/.test(sansAccents) && !/[.,;:]$/.test(t);
}

type Fonts = { regular: PDFFont; bold: PDFFont; italic: PDFFont };
type Couleurs = { violet: ReturnType<typeof rgb>; violetFonce: ReturnType<typeof rgb>; gris: ReturnType<typeof rgb>; grisClair: ReturnType<typeof rgb>; noir: ReturnType<typeof rgb>; blanc: ReturnType<typeof rgb> };
type InfosProfil = { nom: string; adresse: string | null; telephone: string | null; email: string | null };

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;

/** Modèle par défaut : identique à l'historique — en-tête offre + titre du document + corps. */
function dessinerDocumentClassique(
  pdf: PDFDocument,
  doc: { type: string; contenu: string },
  opportunite: { intitule: string; organisme: string },
  nom: string,
  signature: string,
  fonts: Fonts,
  c: Couleurs
) {
  const label = labelDoc(doc.type);
  const ML = 60, MR = 60, MT = 70, MB = 60;
  const CW = PAGE_W - ML - MR;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MT;
  let pageNum = 1;

  page.drawRectangle({ x: 0, y: PAGE_H - 5, width: PAGE_W, height: 5, color: c.violet });

  drawTextSafe(page, opportunite.organisme, { x: ML, y, size: 9, font: fonts.regular, color: c.gris });
  y -= 16;

  const titreLines = wrapText(opportunite.intitule, fonts.bold, 11, CW);
  for (const line of titreLines) {
    drawTextSafe(page, line, { x: ML, y, size: 11, font: fonts.bold, color: c.noir });
    y -= 15;
  }
  y -= 4;

  page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - MR, y }, thickness: 0.8, color: c.violet });
  y -= 22;

  drawTextSafe(page, label, { x: ML, y, size: 13, font: fonts.bold, color: c.violet });
  y -= 26;

  const bodyLines = wrapText(doc.contenu, fonts.regular, 10.5, CW);
  const LH = 15.5;

  for (const line of bodyLines) {
    if (y < MB + 40) {
      drawTextSafe(page, `${nom} - ${label}`, { x: ML, y: 32, size: 7.5, font: fonts.italic, color: c.grisClair });
      const pageStr = `Page ${pageNum}`;
      drawTextSafe(page, pageStr, {
        x: PAGE_W - MR - fonts.regular.widthOfTextAtSize(pageStr, 7.5),
        y: 32, size: 7.5, font: fonts.regular, color: c.grisClair,
      });

      page = pdf.addPage([PAGE_W, PAGE_H]);
      pageNum++;
      y = PAGE_H - MT;
      page.drawRectangle({ x: 0, y: PAGE_H - 3, width: PAGE_W, height: 3, color: c.violet });
      drawTextSafe(page, `${label} (suite)`, { x: ML, y, size: 9, font: fonts.italic, color: c.gris });
      y -= 22;
    }

    if (line === "") {
      y -= LH * 0.6;
    } else {
      drawTextSafe(page, line, { x: ML, y, size: 10.5, font: fonts.regular, color: c.noir });
      y -= LH;
    }
  }

  if (["lettre", "demande_manuscrite", "lettre_reco", "declaration"].includes(doc.type) && signature) {
    y -= 20;
    if (y < MB + 60) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MT;
    }
    drawTextSafe(page, signature, { x: PAGE_W - MR - fonts.bold.widthOfTextAtSize(sanitize(signature), 11), y, size: 11, font: fonts.bold, color: c.noir });
  }

  drawTextSafe(page, `${nom} - ${label}`, { x: ML, y: 32, size: 7.5, font: fonts.italic, color: c.grisClair });
  const lastPageStr = `Page ${pageNum}`;
  drawTextSafe(page, lastPageStr, {
    x: PAGE_W - MR - fonts.regular.widthOfTextAtSize(lastPageStr, 7.5),
    y: 32, size: 7.5, font: fonts.regular, color: c.grisClair,
  });
  drawTextSafe(page, "Matchwork", {
    x: (PAGE_W - fonts.regular.widthOfTextAtSize("Matchwork", 7)) / 2,
    y: 20, size: 7, font: fonts.regular, color: c.grisClair,
  });
}

/** Sépare le contenu du CV en (bloc d'en-tête = 1er paragraphe, reste = corps des sections). */
function separerEnteteCorpsCv(contenu: string): { entete: string[]; corps: string } {
  const paragraphes = sanitize(contenu).split(/\n\s*\n/);
  const entete = (paragraphes[0] ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const corps = paragraphes.slice(1).join("\n\n").trim() || sanitize(contenu);
  return { entete, corps };
}

/** Dessine le corps du CV (sections/lignes) dans une colonne de largeur CW, en gérant la pagination.
 *  Les lignes de section (FORMATION, EXPÉRIENCE...) sont mises en violet/gras. */
function dessinerCorpsCv(
  pdf: PDFDocument,
  corps: string,
  fonts: Fonts,
  c: Couleurs,
  opts: { x: number; yDepart: number; largeur: number; pageSuivante: () => PDFPage; margeBasse: number }
): PDFPage {
  let page = opts.pageSuivante();
  let y = opts.yDepart;
  const LH = 13.5;

  for (const paragraphe of corps.split("\n")) {
    if (paragraphe.trim() === "") { y -= LH * 0.5; continue; }

    const estSection = estLigneSection(paragraphe);
    const font = estSection ? fonts.bold : fonts.regular;
    const size = estSection ? 8.6 : 9;
    const couleur = estSection ? c.violetFonce : c.noir;
    const lines = wrapText(paragraphe, font, size, opts.largeur);

    for (const line of lines) {
      if (y < opts.margeBasse) {
        page = opts.pageSuivante();
        y = opts.yDepart;
      }
      drawTextSafe(page, line, { x: opts.x, y, size, font, color: couleur });
      y -= estSection ? LH + 3 : LH;
    }
    if (estSection) y -= 2;
  }
  return page;
}

/** Modèle 2 — bandeau latéral violet (identité + contact) + corps du CV en colonne principale. */
function dessinerCvSidebar(pdf: PDFDocument, doc: { contenu: string }, profil: InfosProfil, fonts: Fonts, c: Couleurs) {
  const SIDEBAR_W = PAGE_W * 0.28;
  const MT = 40, MB = 46;
  const { entete, corps } = separerEnteteCorpsCv(doc.contenu);

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: SIDEBAR_W, height: PAGE_H, color: c.violetFonce });

  // Bandeau : nom + contact
  let ySide = PAGE_H - MT - 30;
  const nomLignes = wrapText(entete[0] || profil.nom, fonts.bold, 14, SIDEBAR_W - 36);
  for (const l of nomLignes) {
    drawTextSafe(page, l, { x: 26, y: ySide, size: 14, font: fonts.bold, color: c.blanc });
    ySide -= 18;
  }
  ySide -= 14;

  drawTextSafe(page, "CONTACT", { x: 26, y: ySide, size: 7, font: fonts.bold, color: rgb(1, 1, 1) });
  ySide -= 16;
  const contacts = [profil.adresse, profil.telephone, profil.email].filter(Boolean) as string[];
  for (const ligne of contacts) {
    for (const l of wrapText(ligne, fonts.regular, 7.5, SIDEBAR_W - 36)) {
      drawTextSafe(page, l, { x: 26, y: ySide, size: 7.5, font: fonts.regular, color: rgb(0.92, 0.9, 0.98) });
      ySide -= 12;
    }
  }

  // Corps principal
  const bodyX = SIDEBAR_W + 34;
  const bodyW = PAGE_W - bodyX - 46;
  let page2 = page;
  let premierePage = true;
  page2 = dessinerCorpsCv(pdf, corps, fonts, c, {
    x: bodyX,
    yDepart: PAGE_H - MT - 20,
    largeur: bodyW,
    margeBasse: MB,
    pageSuivante: () => {
      if (premierePage) { premierePage = false; return page; }
      const p = pdf.addPage([PAGE_W, PAGE_H]);
      p.drawRectangle({ x: 0, y: PAGE_H - 4, width: PAGE_W, height: 4, color: c.violet });
      return p;
    },
  });
  return page2;
}

/** Modèle 4 — bandeau plein en haut (identité + contact en clair), corps sobre en dessous. */
function dessinerCvBandeau(pdf: PDFDocument, doc: { contenu: string }, profil: InfosProfil, fonts: Fonts, c: Couleurs) {
  const BAND_H = 118;
  const ML = 56, MR = 56, MB = 46;
  const { entete, corps } = separerEnteteCorpsCv(doc.contenu);

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: PAGE_H - BAND_H, width: PAGE_W, height: BAND_H, color: c.violetFonce });

  let yBand = PAGE_H - 46;
  drawTextSafe(page, entete[0] || profil.nom, { x: ML, y: yBand, size: 17, font: fonts.bold, color: c.blanc });
  yBand -= 22;
  const contacts = [profil.adresse, profil.telephone, profil.email].filter(Boolean).join("   ·   ");
  if (contacts) drawTextSafe(page, contacts, { x: ML, y: yBand, size: 8, font: fonts.regular, color: rgb(0.92, 0.9, 0.98) });

  const bodyW = PAGE_W - ML - MR;
  let premierePage = true;
  dessinerCorpsCv(pdf, corps, fonts, c, {
    x: ML,
    yDepart: PAGE_H - BAND_H - 30,
    largeur: bodyW,
    margeBasse: MB,
    pageSuivante: () => {
      if (premierePage) { premierePage = false; return page; }
      const p = pdf.addPage([PAGE_W, PAGE_H]);
      p.drawRectangle({ x: 0, y: PAGE_H - 4, width: PAGE_W, height: 4, color: c.violet });
      return p;
    },
  });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifie" }, { status: 401 });
  }

  const { id } = await params;

  const [dossier, profil] = await Promise.all([
    prisma.dossier.findUnique({
      where: { id },
      include: {
        opportunite: { select: { intitule: true, organisme: true, dateLimite: true } },
        docsGeneres: true,
      },
    }),
    prisma.profil.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!dossier || dossier.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  if (dossier.docsGeneres.length === 0) {
    return NextResponse.json({ erreur: "Aucun document genere" }, { status: 400 });
  }

  const nom = profil?.nomComplet ?? profil?.signature ?? "Candidat";
  const signature = profil?.signature ?? profil?.nomComplet ?? "";
  const modeleCv = profil?.modeleCv === "sidebar" || profil?.modeleCv === "bandeau" ? profil.modeleCv : "classique";
  const infosProfil: InfosProfil = {
    nom,
    adresse: profil?.adresse ?? null,
    telephone: profil?.telephone ?? null,
    email: profil?.email ?? null,
  };

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Dossier - ${dossier.opportunite.intitule}`);
  pdf.setAuthor(nom);
  pdf.setSubject(dossier.opportunite.organisme);
  pdf.setCreator("Matchwork");

  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
  };

  const c: Couleurs = {
    violet: rgb(0.486, 0.227, 0.929),
    violetFonce: rgb(0.357, 0.129, 0.714),
    gris: rgb(0.4, 0.4, 0.4),
    grisClair: rgb(0.65, 0.65, 0.65),
    noir: rgb(0.1, 0.1, 0.1),
    blanc: rgb(1, 1, 1),
  };

  for (const doc of dossier.docsGeneres) {
    if (doc.type === "cv" && modeleCv === "sidebar") {
      dessinerCvSidebar(pdf, doc, infosProfil, fonts, c);
    } else if (doc.type === "cv" && modeleCv === "bandeau") {
      dessinerCvBandeau(pdf, doc, infosProfil, fonts, c);
    } else {
      dessinerDocumentClassique(pdf, doc, dossier.opportunite, nom, signature, fonts, c);
    }
  }

  const pdfBytes = await pdf.save();
  const filename = `Matchwork-${dossier.opportunite.organisme.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBytes.length.toString(),
    },
  });
}
