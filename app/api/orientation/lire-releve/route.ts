import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { fichierValide } from "@/lib/file-validation";
import {
  ExtractionIndisponible,
  extraireReleveDepuisImage,
} from "@/lib/orientation/extraction-releve";
import { FILIERES_PUBLIQUES } from "@/lib/orientation/donnees";
import type { Serie } from "@/lib/orientation/types";

// Une photo de relevé prise au téléphone dépasse rarement 6 Mo.
const TAILLE_MAX = 8 * 1024 * 1024;
const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp"];

const SERIES_CONNUES = new Set<string>(
  FILIERES_PUBLIQUES.flatMap((f) => f.series),
);

const schema = z.object({
  serie: z.string().min(1).refine((s) => SERIES_CONNUES.has(s), {
    message: "Série inconnue du guide.",
  }),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ erreur: "Requête illisible." }, { status: 400 });
  }

  const parse = schema.safeParse({ serie: form.get("serie") });
  if (!parse.success) {
    return NextResponse.json(
      { erreur: parse.error.issues[0]?.message ?? "Série manquante." },
      { status: 400 },
    );
  }

  const fichier = form.get("photo");
  if (!(fichier instanceof File)) {
    return NextResponse.json({ erreur: "Photo manquante." }, { status: 400 });
  }
  if (fichier.size === 0) {
    return NextResponse.json({ erreur: "Le fichier est vide." }, { status: 400 });
  }
  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json(
      { erreur: "Photo trop lourde (8 Mo maximum)." },
      { status: 413 },
    );
  }
  if (!TYPES_ACCEPTES.includes(fichier.type)) {
    return NextResponse.json(
      { erreur: "Format non accepté. Utilise une photo JPEG, PNG ou WEBP." },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await fichier.arrayBuffer());
  // Le type déclaré par le navigateur ne prouve rien : on vérifie les
  // premiers octets du fichier.
  if (!fichierValide(buffer, fichier.type)) {
    return NextResponse.json(
      { erreur: "Le contenu du fichier ne correspond pas à une image." },
      { status: 415 },
    );
  }

  const dataUrl = `data:${fichier.type};base64,${buffer.toString("base64")}`;

  try {
    const releve = await extraireReleveDepuisImage(dataUrl, parse.data.serie as Serie);
    return NextResponse.json(releve);
  } catch (e) {
    if (e instanceof ExtractionIndisponible) {
      return NextResponse.json({ erreur: e.message }, { status: 503 });
    }
    console.error("[orientation] lecture du relevé échouée", e);
    return NextResponse.json(
      { erreur: "La lecture du relevé a échoué. Réessaie avec une photo plus nette." },
      { status: 500 },
    );
  }
}
