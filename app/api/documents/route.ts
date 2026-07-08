import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFichier } from "@/lib/storage";
import { fichierValide } from "@/lib/file-validation";

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo
const TYPES_AUTORISES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const TYPES_DOC_VALIDES = [
  "DIPLOME", "RELEVE_NOTES", "ACTE_NAISSANCE", "PIECE_IDENTITE",
  "JUSTIFICATIF_LANGUE", "LETTRE_RECO", "AUTRE",
];

function parseDocument(doc: Record<string, unknown>) {
  return {
    ...doc,
    infosExtraites: doc.infosExtraites
      ? JSON.parse(doc.infosExtraites as string)
      : null,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      nomFichier: true,
      taille: true,
      infosExtraites: true,
      extraitParIa: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    documents.map((d) => parseDocument(d as unknown as Record<string, unknown>))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const fichier = formData.get("fichier") as File | null;
    const typeStr = formData.get("type") as string | null;

    if (!fichier) return NextResponse.json({ erreur: "Aucun fichier reçu" }, { status: 400 });
    if (!typeStr || !TYPES_DOC_VALIDES.includes(typeStr)) {
      return NextResponse.json({ erreur: "Type de document invalide" }, { status: 400 });
    }
    if (!TYPES_AUTORISES.includes(fichier.type)) {
      return NextResponse.json(
        { erreur: "Format non autorisé. Utilisez PDF, JPEG ou PNG." },
        { status: 400 }
      );
    }
    if (fichier.size > TAILLE_MAX) {
      return NextResponse.json({ erreur: "Fichier trop volumineux (max 10 Mo)." }, { status: 400 });
    }

    const buffer = Buffer.from(await fichier.arrayBuffer());

    if (!fichierValide(buffer, fichier.type)) {
      return NextResponse.json(
        { erreur: "Le contenu du fichier ne correspond pas au format déclaré." },
        { status: 400 }
      );
    }

    const doc = await prisma.document.create({
      data: {
        userId: session.user.id,
        type: typeStr,
        nomFichier: fichier.name,
        refStockage: "",
        taille: fichier.size,
      },
      select: {
        id: true, type: true, nomFichier: true,
        taille: true, infosExtraites: true, extraitParIa: true, createdAt: true,
      },
    });

    await uploadFichier(session.user.id, buffer, fichier.name, doc.id);

    void fetch(new URL("/api/ia/extraire-document", req.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({
        documentId: doc.id,
        type: typeStr,
        nomFichier: fichier.name,
        contenuBase64: buffer.toString("base64"),
        mimeType: fichier.type,
      }),
    }).catch((err) => console.error("Extraction IA (async):", err));

    return NextResponse.json(parseDocument(doc as unknown as Record<string, unknown>), { status: 201 });
  } catch (err) {
    console.error("Erreur upload document:", err);
    return NextResponse.json({ erreur: "Erreur serveur lors de l'upload" }, { status: 500 });
  }
}
