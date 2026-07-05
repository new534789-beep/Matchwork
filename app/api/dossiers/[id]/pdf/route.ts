import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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
    .replace(/ /g, " ")
    .replace(/«/g, "<<")
    .replace(/»/g, ">>");
}

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, fontSize: number, maxWidth: number): string[] {
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
  page: ReturnType<PDFDocument["addPage"]>,
  text: string,
  opts: { x: number; y: number; size: number; font: Awaited<ReturnType<PDFDocument["embedFont"]>>; color: ReturnType<typeof rgb> }
) {
  try {
    page.drawText(sanitize(text), opts);
  } catch {
    page.drawText(sanitize(text).replace(/[^\x20-\x7E\xA0-\xFF]/g, ""), opts);
  }
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

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Dossier - ${dossier.opportunite.intitule}`);
  pdf.setAuthor(nom);
  pdf.setSubject(dossier.opportunite.organisme);
  pdf.setCreator("Matchwork");

  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_W = 595.28; // A4
  const PAGE_H = 841.89;
  const ML = 60;
  const MR = 60;
  const MT = 70;
  const MB = 60;
  const CW = PAGE_W - ML - MR;

  const VIOLET = rgb(0.486, 0.227, 0.929);
  const GRIS = rgb(0.4, 0.4, 0.4);
  const GRIS_CLAIR = rgb(0.65, 0.65, 0.65);
  const NOIR = rgb(0.1, 0.1, 0.1);

  for (let i = 0; i < dossier.docsGeneres.length; i++) {
    const doc = dossier.docsGeneres[i];
    const label = labelDoc(doc.type);

    let page = pdf.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MT;
    let pageNum = 1;

    // Barre violette en haut
    page.drawRectangle({ x: 0, y: PAGE_H - 5, width: PAGE_W, height: 5, color: VIOLET });

    // En-tete : organisme
    drawTextSafe(page, dossier.opportunite.organisme, { x: ML, y, size: 9, font: fontRegular, color: GRIS });
    y -= 16;

    // Intitule de l'offre
    const titreLines = wrapText(dossier.opportunite.intitule, fontBold, 11, CW);
    for (const line of titreLines) {
      drawTextSafe(page, line, { x: ML, y, size: 11, font: fontBold, color: NOIR });
      y -= 15;
    }
    y -= 4;

    // Ligne separatrice
    page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - MR, y }, thickness: 0.8, color: VIOLET });
    y -= 22;

    // Titre du document
    drawTextSafe(page, label, { x: ML, y, size: 13, font: fontBold, color: VIOLET });
    y -= 26;

    // Corps du document
    const bodyLines = wrapText(doc.contenu, fontRegular, 10.5, CW);
    const LH = 15.5;

    for (const line of bodyLines) {
      if (y < MB + 40) {
        // Pied de page
        drawTextSafe(page, `${nom} - ${label}`, { x: ML, y: 32, size: 7.5, font: fontItalic, color: GRIS_CLAIR });
        const pageStr = `Page ${pageNum}`;
        drawTextSafe(page, pageStr, {
          x: PAGE_W - MR - fontRegular.widthOfTextAtSize(pageStr, 7.5),
          y: 32, size: 7.5, font: fontRegular, color: GRIS_CLAIR,
        });

        page = pdf.addPage([PAGE_W, PAGE_H]);
        pageNum++;
        y = PAGE_H - MT;
        page.drawRectangle({ x: 0, y: PAGE_H - 3, width: PAGE_W, height: 3, color: VIOLET });
        drawTextSafe(page, `${label} (suite)`, { x: ML, y, size: 9, font: fontItalic, color: GRIS });
        y -= 22;
      }

      if (line === "") {
        y -= LH * 0.6;
      } else {
        drawTextSafe(page, line, { x: ML, y, size: 10.5, font: fontRegular, color: NOIR });
        y -= LH;
      }
    }

    // Signature en bas si c'est une lettre ou demande
    if (["lettre", "demande_manuscrite", "lettre_reco", "declaration"].includes(doc.type) && signature) {
      y -= 20;
      if (y < MB + 60) {
        page = pdf.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MT;
      }
      drawTextSafe(page, signature, { x: PAGE_W - MR - fontBold.widthOfTextAtSize(sanitize(signature), 11), y, size: 11, font: fontBold, color: NOIR });
    }

    // Pied de page final
    drawTextSafe(page, `${nom} - ${label}`, { x: ML, y: 32, size: 7.5, font: fontItalic, color: GRIS_CLAIR });
    const lastPageStr = `Page ${pageNum}`;
    drawTextSafe(page, lastPageStr, {
      x: PAGE_W - MR - fontRegular.widthOfTextAtSize(lastPageStr, 7.5),
      y: 32, size: 7.5, font: fontRegular, color: GRIS_CLAIR,
    });
    drawTextSafe(page, "Matchwork", {
      x: (PAGE_W - fontRegular.widthOfTextAtSize("Matchwork", 7)) / 2,
      y: 20, size: 7, font: fontRegular, color: GRIS_CLAIR,
    });
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
