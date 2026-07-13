import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { DossierClient } from "./DossierClient";

type Props = { params: Promise<{ id: string }> };

// Mots-clés pour matcher une pièce personnelle exigée à un type de document du coffre-fort.
const TYPES_MATCHING: Record<string, string[]> = {
  DIPLOME: ["diplôme", "diplome", "licence", "master", "doctorat", "bac", "certificat", "attestation"],
  RELEVE_NOTES: ["relevé", "releve", "notes", "bulletin", "transcrit", "transcript", "académique", "academique"],
  CV: ["cv", "curriculum", "vitae", "resume", "résumé"],
  LETTRE_RECOMMANDATION: ["recommandation", "référence", "reference", "tuteur", "directeur"],
  PASSEPORT: ["passeport", "passport", "identité", "identite", "carte nationale", "cni", "pièce d'identité"],
  PHOTO: ["photo", "photographie", "portrait"],
  ACTE_NAISSANCE: ["naissance", "acte de naissance", "extrait de naissance"],
  JUSTIFICATIF_LANGUE: ["langue", "delf", "dalf", "ielts", "toefl", "tcf"],
};

// Libellés lisibles des documents rédactionnels générés.
const LABEL_DOC: Record<string, string> = {
  cv: "CV", lettre: "Lettre de motivation", lettre_reco: "Lettre de recommandation",
  demande_manuscrite: "Demande manuscrite", projet_etudes: "Projet d'études",
  declaration: "Déclaration personnelle", autre: "Document",
};
export function labelDoc(t: string): string {
  return LABEL_DOC[t] ?? t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ");
}

function normalize(s: unknown): string {
  return typeof s === "string" ? s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : "";
}

function matchType(nomPiece: string): string | null {
  const n = normalize(nomPiece);
  for (const [type, keywords] of Object.entries(TYPES_MATCHING)) {
    if (keywords.some((kw) => n.includes(normalize(kw)))) return type;
  }
  return null;
}

export type ChecklistItem = {
  nom: string;
  obligatoire: boolean;
  categorie: "generable" | "personnel";
  statut: "genere" | "a_generer" | "presente" | "manquante";
};

type PieceReq = { nom: string; obligatoire?: boolean; categorie?: string; type?: string };

export default async function DossierPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { id } = await params;

  const [dossier, coffreDocs, profil] = await Promise.all([
    prisma.dossier.findUnique({
      where: { id },
      include: {
        opportunite: {
          select: {
            id: true, intitule: true, organisme: true, langueDetectee: true,
            piecesExigees: true, exigenceLangue: true, dateLimite: true, lien: true,
            canalCandidature: true, cibleCandidature: true,
          },
        },
        docsGeneres: true,
      },
    }),
    prisma.document.findMany({ where: { userId: session.user.id }, select: { type: true } }),
    prisma.profil.findUnique({ where: { userId: session.user.id }, select: { modeleCv: true } }),
  ]);

  if (!dossier || dossier.userId !== session.user.id) notFound();

  let pieces: PieceReq[] = [];
  try { pieces = JSON.parse(dossier.opportunite.piecesExigees); } catch { pieces = []; }
  if (!Array.isArray(pieces)) pieces = [];

  const coffretypes = new Set(coffreDocs.map((d) => d.type));
  const genTypes = new Set(dossier.docsGeneres.map((d) => d.type));

  // 1) Rédactionnels réellement générés
  const checklist: ChecklistItem[] = dossier.docsGeneres.map((d) => ({
    nom: labelDoc(d.type),
    obligatoire: true,
    categorie: "generable" as const,
    statut: "genere" as const,
  }));

  // 2) Rédactionnels demandés mais pas encore générés
  for (const p of pieces.filter((x) => x.categorie === "generable")) {
    if (!p.type || !genTypes.has(p.type)) {
      checklist.push({ nom: p.nom, obligatoire: p.obligatoire ?? true, categorie: "generable", statut: "a_generer" });
    }
  }

  // 3) Pièces personnelles à fournir → coffre-fort ou manquantes
  for (const p of pieces.filter((x) => x.categorie !== "generable")) {
    const type = matchType(p.nom);
    const trouve = type ? coffretypes.has(type) : false;
    checklist.push({ nom: p.nom, obligatoire: p.obligatoire ?? true, categorie: "personnel", statut: trouve ? "presente" : "manquante" });
  }

  return (
    <>
      <EnteteApp titre="Mon dossier" retour={`/opportunites/${dossier.opportuniteId}`} />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <DossierClient
          dossier={{
            id: dossier.id,
            statut: dossier.statut,
            createdAt: dossier.createdAt.toISOString(),
            opportunite: {
              id: dossier.opportunite.id,
              intitule: dossier.opportunite.intitule,
              organisme: dossier.opportunite.organisme,
              langueDetectee: dossier.opportunite.langueDetectee,
              dateLimite: dossier.opportunite.dateLimite?.toISOString() ?? null,
              lien: dossier.opportunite.lien,
              canalCandidature: dossier.opportunite.canalCandidature ?? "aucun",
              cibleCandidature: dossier.opportunite.cibleCandidature,
            },
            docsGeneres: dossier.docsGeneres.map((d) => ({
              id: d.id, type: d.type, label: labelDoc(d.type), contenu: d.contenu, langue: d.langue,
            })),
          }}
          checklist={checklist}
          modeleCvInitial={profil?.modeleCv === "sidebar" || profil?.modeleCv === "bandeau" ? profil.modeleCv : "classique"}
        />
      </main>
    </>
  );
}
