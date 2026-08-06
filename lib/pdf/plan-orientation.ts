/**
 * Plan d'orientation en PDF.
 *
 * Le candidat repart avec ses résultats : il les montre à sa famille, les
 * imprime, les rouvre sans connexion, et les a sous les yeux au moment de
 * saisir ses trois choix sur apresmonbac.bj — souvent depuis un autre poste.
 *
 * Le document ne recommande rien et n'ajoute aucun chiffre : il reprend
 * exactement ce que `calcul.ts` a produit, dans le même ordre que l'écran.
 */

import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

import type { FiliereClassee } from "@/lib/orientation/classement";
import { resumer } from "@/lib/orientation/classement";
import { ANNEE_UNIVERSITAIRE, PLATEFORME_OFFICIELLE } from "@/lib/orientation/donnees";
import { mentionPour } from "@/lib/orientation/mention";

import { PAGE_H, PAGE_W, decouperLignes, tracerTexte, tronquer } from "./texte";

const VIOLET = rgb(0.486, 0.227, 0.929);
const VIOLET_PALE = rgb(0.93, 0.9, 0.99);
const NOIR = rgb(0.06, 0.04, 0.13);
const GRIS = rgb(0.42, 0.4, 0.47);
const GRIS_CLAIR = rgb(0.62, 0.6, 0.66);
const BLANC = rgb(1, 1, 1);

const ML = 46;
const MR = 46;
const MB = 52;
const CW = PAGE_W - ML - MR;

type Polices = { normale: PDFFont; grasse: PDFFont; italique: PDFFont };

export type PlanOrientation = {
  /** Nom du candidat, repris du profil. Absent si le profil ne le renseigne pas. */
  nom?: string | null;
  serie: string;
  moyenneGenerale?: number;
  /** Le relevé tel qu'il a été lu sur la photo. */
  notes: { matiere: string; note: number; coefficient: number }[];
  classees: FiliereClassee[];
  /** Commentaire affiché à l'écran, s'il a passé les contrôles. */
  explication?: string | null;
};

/** État de tracé : page courante et ordonnée. */
type Curseur = { page: PDFPage; y: number; numero: number };

function piedDePage(c: Curseur, p: Polices) {
  tracerTexte(c.page, "Matchwork - Plan d'orientation", {
    x: ML,
    y: 30,
    size: 7.5,
    font: p.italique,
    color: GRIS_CLAIR,
  });
  const num = `Page ${c.numero}`;
  tracerTexte(c.page, num, {
    x: PAGE_W - MR - p.normale.widthOfTextAtSize(num, 7.5),
    y: 30,
    size: 7.5,
    font: p.normale,
    color: GRIS_CLAIR,
  });
}

function nouvellePage(pdf: PDFDocument, c: Curseur, p: Polices): Curseur {
  piedDePage(c, p);
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: PAGE_H - 4, width: PAGE_W, height: 4, color: VIOLET });
  return { page, y: PAGE_H - 60, numero: c.numero + 1 };
}

/** Réserve `hauteur` points ; passe à la page suivante si nécessaire. */
function reserver(
  pdf: PDFDocument,
  c: Curseur,
  p: Polices,
  hauteur: number,
): Curseur {
  return c.y - hauteur < MB ? nouvellePage(pdf, c, p) : c;
}

function titreSection(pdf: PDFDocument, c: Curseur, p: Polices, texte: string): Curseur {
  const cur = reserver(pdf, c, p, 46);
  cur.y -= 10;
  tracerTexte(cur.page, texte.toUpperCase(), {
    x: ML,
    y: cur.y,
    size: 9,
    font: p.grasse,
    color: VIOLET,
  });
  cur.y -= 6;
  cur.page.drawLine({
    start: { x: ML, y: cur.y },
    end: { x: PAGE_W - MR, y: cur.y },
    thickness: 0.7,
    color: VIOLET,
  });
  cur.y -= 16;
  return cur;
}

function enTete(page: PDFPage, p: Polices, plan: PlanOrientation): number {
  page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: VIOLET });

  tracerTexte(page, "Matchwork", {
    x: ML,
    y: PAGE_H - 36,
    size: 11,
    font: p.grasse,
    color: BLANC,
  });
  // Le nom prime sur le titre générique : c'est le document de quelqu'un.
  const titre = plan.nom ? tronquer(plan.nom, p.grasse, 20, CW) : "Plan d'orientation";
  tracerTexte(page, titre, {
    x: ML,
    y: PAGE_H - 62,
    size: 20,
    font: p.grasse,
    color: BLANC,
  });
  const sousTitre = plan.nom
    ? `Plan d'orientation · Série ${plan.serie} · Guide MESRS ${ANNEE_UNIVERSITAIRE}`
    : `Série ${plan.serie} · Guide MESRS ${ANNEE_UNIVERSITAIRE}`;
  tracerTexte(page, sousTitre, {
    x: ML,
    y: PAGE_H - 80,
    size: 9,
    font: p.normale,
    color: BLANC,
  });
  return PAGE_H - 126;
}

function bandeauProfil(
  pdf: PDFDocument,
  c: Curseur,
  p: Polices,
  plan: PlanOrientation,
): Curseur {
  const s = resumer(plan.classees);
  const cur = reserver(pdf, c, p, 74);

  cur.page.drawRectangle({
    x: ML,
    y: cur.y - 54,
    width: CW,
    height: 62,
    color: VIOLET_PALE,
  });

  let x = ML + 14;
  const cases: [string, string][] = [];
  if (plan.moyenneGenerale !== undefined) {
    cases.push(["Moyenne au bac", `${plan.moyenneGenerale.toFixed(2)}/20`]);
    cases.push(["Mention", mentionPour(plan.moyenneGenerale)]);
  }
  cases.push(["Filières ouvertes", String(s.total)]);
  cases.push(["Avec moyenne", String(s.calculees)]);
  if (s.meilleureMoyenne !== null) {
    cases.push(["Meilleure moyenne", s.meilleureMoyenne.toFixed(2)]);
  }

  const largeur = CW / cases.length;
  for (const [libelle, valeur] of cases) {
    tracerTexte(cur.page, libelle, {
      x,
      y: cur.y - 18,
      size: 7.5,
      font: p.normale,
      color: GRIS,
    });
    tracerTexte(cur.page, valeur, {
      x,
      y: cur.y - 38,
      size: 14,
      font: p.grasse,
      color: VIOLET,
    });
    x += largeur;
  }
  cur.y -= 74;
  return cur;
}

function sectionReleve(
  pdf: PDFDocument,
  c: Curseur,
  p: Polices,
  plan: PlanOrientation,
): Curseur {
  let cur = titreSection(pdf, c, p, "Ton relevé, tel qu'il a été lu");

  const colNote = ML + 300;
  const colCoef = ML + 380;
  tracerTexte(cur.page, "Matière", { x: ML, y: cur.y, size: 8, font: p.grasse, color: GRIS });
  tracerTexte(cur.page, "Note", { x: colNote, y: cur.y, size: 8, font: p.grasse, color: GRIS });
  tracerTexte(cur.page, "Coefficient", { x: colCoef, y: cur.y, size: 8, font: p.grasse, color: GRIS });
  cur.y -= 14;

  for (const n of plan.notes) {
    cur = reserver(pdf, cur, p, 16);
    tracerTexte(cur.page, n.matiere, { x: ML, y: cur.y, size: 9.5, font: p.normale, color: NOIR });
    tracerTexte(cur.page, `${n.note}/20`, { x: colNote, y: cur.y, size: 9.5, font: p.normale, color: NOIR });
    tracerTexte(cur.page, String(n.coefficient), { x: colCoef, y: cur.y, size: 9.5, font: p.normale, color: NOIR });
    cur.y -= 15;
  }

  cur = reserver(pdf, cur, p, 26);
  cur.y -= 4;
  for (const ligne of decouperLignes(
    "Ces valeurs proviennent de la photo de ton relevé. Si l'une d'elles est fausse, tout le classement l'est aussi : vérifie-les.",
    p.italique,
    8,
    CW,
  )) {
    tracerTexte(cur.page, ligne, { x: ML, y: cur.y, size: 8, font: p.italique, color: GRIS });
    cur.y -= 11;
  }
  return cur;
}

function carteFiliere(
  pdf: PDFDocument,
  c: Curseur,
  p: Polices,
  item: FiliereClassee,
): Curseur {
  const f = item.filiere;
  const calcule = item.resultat.statut === "calcule";
  // Les deux variantes ont quatre lignes de texte ; seule la dernière change
  // (formule de calcul, ou motif de non-calcul). Même hauteur, donc.
  const hauteur = 62;
  const cur = reserver(pdf, c, p, hauteur + 6);

  const haut = cur.y + 12;
  cur.page.drawRectangle({
    x: ML,
    y: haut - hauteur,
    width: CW,
    height: hauteur,
    borderColor: VIOLET_PALE,
    borderWidth: 1,
    color: BLANC,
  });

  const xTexte = ML + 12;
  const largeurTexte = CW - 110;

  // rang + intitulé
  const rang = item.rang !== null ? `${item.rang}. ` : "";
  tracerTexte(cur.page, tronquer(rang + f.filiere, p.grasse, 10, largeurTexte), {
    x: xTexte,
    y: haut - 18,
    size: 10,
    font: p.grasse,
    color: NOIR,
  });
  tracerTexte(cur.page, tronquer(f.etablissement, p.normale, 8, largeurTexte), {
    x: xTexte,
    y: haut - 30,
    size: 8,
    font: p.normale,
    color: GRIS,
  });
  tracerTexte(cur.page, tronquer(f.universite, p.normale, 7.5, largeurTexte), {
    x: xTexte,
    y: haut - 40,
    size: 7.5,
    font: p.normale,
    color: GRIS_CLAIR,
  });

  if (calcule) {
    const r = item.resultat as { moyenne: number; formule: string };
    const valeur = r.moyenne.toFixed(2);
    tracerTexte(cur.page, valeur, {
      x: PAGE_W - MR - 14 - p.grasse.widthOfTextAtSize(valeur, 17),
      y: haut - 24,
      size: 17,
      font: p.grasse,
      color: VIOLET,
    });
    const surVingt = "/20";
    tracerTexte(cur.page, surVingt, {
      x: PAGE_W - MR - 14 - p.normale.widthOfTextAtSize(surVingt, 7),
      y: haut - 34,
      size: 7,
      font: p.normale,
      color: GRIS_CLAIR,
    });
    tracerTexte(cur.page, tronquer(r.formule, p.normale, 7.5, CW - 130), {
      x: xTexte,
      y: haut - 53,
      size: 7.5,
      font: p.normale,
      color: GRIS,
    });
  } else {
    // même emplacement que la formule, pour ne pas chevaucher l'université
    const raison = (item.resultat as { raison: string }).raison;
    tracerTexte(cur.page, tronquer(raison, p.italique, 7.5, CW - 150), {
      x: xTexte,
      y: haut - 53,
      size: 7.5,
      font: p.italique,
      color: GRIS,
    });
  }

  // quotas, alignés à droite sur la dernière ligne de la carte
  const quotas = `Bourses ${f.quotaBourse ?? 0} · Aide ${f.quotaAideFpp ?? 0}`;
  tracerTexte(cur.page, quotas, {
    x: PAGE_W - MR - 14 - p.normale.widthOfTextAtSize(quotas, 7.5),
    y: haut - 53,
    size: 7.5,
    font: p.normale,
    color: GRIS,
  });

  cur.y = haut - hauteur - 8;
  return cur;
}

function sectionExplication(
  pdf: PDFDocument,
  c: Curseur,
  p: Polices,
  texte: string,
): Curseur {
  let cur = titreSection(pdf, c, p, "Ce que disent tes résultats");
  for (const paragraphe of texte.split(/\n{2,}/)) {
    if (!paragraphe.trim()) continue;
    for (const ligne of decouperLignes(paragraphe.trim(), p.normale, 9.5, CW)) {
      cur = reserver(pdf, cur, p, 14);
      tracerTexte(cur.page, ligne, { x: ML, y: cur.y, size: 9.5, font: p.normale, color: NOIR });
      cur.y -= 13;
    }
    cur.y -= 6;
  }
  return cur;
}

function avertissement(pdf: PDFDocument, c: Curseur, p: Polices): Curseur {
  const cur = reserver(pdf, c, p, 60);
  cur.y -= 10;
  cur.page.drawRectangle({
    x: ML,
    y: cur.y - 34,
    width: CW,
    height: 44,
    color: VIOLET_PALE,
  });
  const texte =
    `Simulation non officielle, calculée à partir du guide du MESRS ${ANNEE_UNIVERSITAIRE}. ` +
    `Elle ne remplace pas la plateforme officielle : tes choix doivent être saisis sur ` +
    `${PLATEFORME_OFFICIELLE.replace(/^https?:\/\//, "")}, seule source qui fait foi.`;
  let y = cur.y - 2;
  for (const ligne of decouperLignes(texte, p.normale, 8, CW - 24)) {
    tracerTexte(cur.page, ligne, { x: ML + 12, y, size: 8, font: p.normale, color: GRIS });
    y -= 11;
  }
  cur.y -= 54;
  return cur;
}

export async function genererPlanOrientationPdf(
  plan: PlanOrientation,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(
    plan.nom
      ? `Plan d'orientation - ${plan.nom} - Série ${plan.serie}`
      : `Plan d'orientation - Série ${plan.serie}`,
  );
  pdf.setCreator("Matchwork");

  const polices: Polices = {
    normale: await pdf.embedFont(StandardFonts.Helvetica),
    grasse: await pdf.embedFont(StandardFonts.HelveticaBold),
    italique: await pdf.embedFont(StandardFonts.HelveticaOblique),
  };

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  let cur: Curseur = { page, y: enTete(page, polices, plan), numero: 1 };

  cur = bandeauProfil(pdf, cur, polices, plan);
  if (plan.notes.length) cur = sectionReleve(pdf, cur, polices, plan);
  if (plan.explication) cur = sectionExplication(pdf, cur, polices, plan.explication);

  const calculees = plan.classees.filter((c) => c.resultat.statut === "calcule");
  const autres = plan.classees.filter((c) => c.resultat.statut !== "calcule");

  if (calculees.length) {
    cur = titreSection(
      pdf,
      cur,
      polices,
      `Tes ${calculees.length} filières avec moyenne, de la plus haute à la plus basse`,
    );
    for (const item of calculees) cur = carteFiliere(pdf, cur, polices, item);
  }

  if (autres.length) {
    cur = titreSection(
      pdf,
      cur,
      polices,
      `${autres.length} filières ouvertes sans moyenne de classement`,
    );
    for (const item of autres) cur = carteFiliere(pdf, cur, polices, item);
  }

  cur = avertissement(pdf, cur, polices);
  piedDePage(cur, polices);

  return pdf.save();
}
