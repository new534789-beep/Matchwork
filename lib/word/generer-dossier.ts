import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, VerticalAlign, HeadingLevel,
} from "docx";

const LABEL_DOC: Record<string, string> = {
  cv: "CV",
  lettre: "Lettre de motivation",
  lettre_reco: "Lettre de recommandation",
  demande_manuscrite: "Demande manuscrite",
  projet_etudes: "Projet d'etudes",
  declaration: "Declaration personnelle",
  autre: "Document",
};

export function labelDoc(t: string): string {
  return LABEL_DOC[t] ?? t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ");
}

// Même heuristique que lib/pdf/generer-dossier.ts : une ligne de section
// ("FORMATION", "EXPERIENCE"...) est courte, tout en majuscules, sans
// ponctuation de phrase finale.
function estLigneSection(ligne: string): boolean {
  const t = ligne.trim();
  if (!t || t.length > 40) return false;
  const sansAccents = t.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return sansAccents === sansAccents.toUpperCase() && /[A-ZÀ-Ý]/.test(sansAccents) && !/[.,;:]$/.test(t);
}

function separerEnteteCorpsCv(contenu: string): { entete: string[]; corps: string } {
  const paragraphes = contenu.split(/\n\s*\n/);
  const entete = (paragraphes[0] ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const corps = paragraphes.slice(1).join("\n\n").trim() || contenu;
  return { entete, corps };
}

const VIOLET = "5B21B6";
const VIOLET_FONCE = "5B21B6";
const GRIS = "666666";

type InfosProfil = { nom: string; signature: string; adresse: string | null; telephone: string | null; email: string | null };

/** Paragraphes du corps d'un CV : lignes de section en gras violet, reste en normal. */
function paragraphesCorpsCv(corps: string, blanc = false): Paragraph[] {
  const paras: Paragraph[] = [];
  for (const ligne of corps.split("\n")) {
    if (ligne.trim() === "") {
      paras.push(new Paragraph({ text: "", spacing: { after: 60 } }));
      continue;
    }
    const section = estLigneSection(ligne);
    paras.push(
      new Paragraph({
        spacing: { after: section ? 80 : 40, before: section ? 160 : 0 },
        children: [
          new TextRun({
            text: ligne.trim(),
            bold: section,
            color: section ? (blanc ? "FFFFFF" : VIOLET_FONCE) : (blanc ? "F0EBFB" : "111111"),
            size: section ? 19 : 20,
          }),
        ],
      })
    );
  }
  return paras;
}

/** CV — tableau 2 colonnes : bandeau latéral violet (identité/contact) + corps principal. */
function sectionCv(doc: { contenu: string }, profil: InfosProfil): Table {
  const { entete, corps } = separerEnteteCorpsCv(doc.contenu);
  const contacts = [profil.adresse, profil.telephone, profil.email].filter(Boolean) as string[];

  const sidebarEnfants: Paragraph[] = [
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: entete[0] || profil.nom, bold: true, color: "FFFFFF", size: 28 })],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: "CONTACT", bold: true, color: "FFFFFF", size: 15 })],
    }),
    ...contacts.map(
      (c) =>
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: c, color: "F0EBFB", size: 16 })],
        })
    ),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: "none", size: 0, color: "FFFFFF" },
      bottom: { style: "none", size: 0, color: "FFFFFF" },
      left: { style: "none", size: 0, color: "FFFFFF" },
      right: { style: "none", size: 0, color: "FFFFFF" },
      insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
      insideVertical: { style: "none", size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: VIOLET },
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 300, bottom: 300, left: 200, right: 200 },
            children: sidebarEnfants,
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 300, bottom: 300, left: 300, right: 200 },
            children: paragraphesCorpsCv(corps),
          }),
        ],
      }),
    ],
  });
}

/** Document rédactionnel classique (lettre, note...) : en-tête offre + corps + signature. */
function paragraphesDocumentClassique(
  doc: { type: string; contenu: string },
  opportunite: { intitule: string; organisme: string },
  signature: string
): Paragraph[] {
  const label = labelDoc(doc.type);
  const paras: Paragraph[] = [
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: opportunite.organisme, color: GRIS, size: 18 })] }),
    new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: opportunite.intitule, bold: true, size: 22 })] }),
    new Paragraph({
      spacing: { after: 240 },
      border: { bottom: { style: "single", size: 6, color: VIOLET, space: 4 } },
      children: [new TextRun({ text: label, bold: true, color: VIOLET, size: 26 })],
    }),
  ];

  for (const ligne of doc.contenu.split("\n")) {
    if (ligne.trim() === "") {
      paras.push(new Paragraph({ text: "", spacing: { after: 80 } }));
    } else {
      paras.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: ligne, size: 21 })] }));
    }
  }

  if (["lettre", "demande_manuscrite", "lettre_reco", "declaration"].includes(doc.type) && signature) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200 },
        children: [new TextRun({ text: signature, bold: true, size: 21 })],
      })
    );
  }

  return paras;
}

export type DossierPourWord = {
  opportunite: { intitule: string; organisme: string };
  docsGeneres: { type: string; contenu: string }[];
};

/**
 * Génère le dossier complet en .docx (Word) — même structure et même texte
 * que le PDF (lib/pdf/generer-dossier.ts), juste un format de sortie différent.
 */
export async function genererDossierWord(dossier: DossierPourWord, profil: InfosProfil): Promise<Buffer> {
  const nom = profil.nom || "Candidat";
  const signature = profil.signature || "";

  const enfants: (Paragraph | Table)[] = [];
  dossier.docsGeneres.forEach((doc, i) => {
    if (doc.type === "cv") {
      enfants.push(sectionCv(doc, { ...profil, nom }));
    } else {
      enfants.push(...paragraphesDocumentClassique(doc, dossier.opportunite, signature));
    }
    if (i < dossier.docsGeneres.length - 1) {
      enfants.push(new Paragraph({ children: [], pageBreakBefore: false, spacing: { after: 400 } }));
    }
  });

  const document = new Document({
    creator: "Matchwork",
    title: `Dossier - ${dossier.opportunite.intitule}`,
    subject: dossier.opportunite.organisme,
    sections: [{ children: enfants }],
  });

  return Packer.toBuffer(document);
}
