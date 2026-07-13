import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extraireOffre, parseDateLimite, iaDisponible, normaliserCanal } from "@/lib/ia/extraction-offre";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  if (!iaDisponible()) {
    return NextResponse.json(
      { erreur: "L'IA n'est pas encore configurée (MISTRAL_API_KEY manquante). Ajoutez votre clé dans .env.local." },
      { status: 503 }
    );
  }

  const { contenu } = (await req.json()) as { contenu?: string };
  if (!contenu?.trim()) return NextResponse.json({ erreur: "Contenu vide" }, { status: 400 });
  if (contenu.trim().length > 15000) {
    return NextResponse.json({ erreur: "Le texte est trop long (maximum 15 000 caractères)." }, { status: 400 });
  }

  try {
    const offre = await extraireOffre(contenu);
    if (!offre) {
      return NextResponse.json(
        { erreur: "L'IA n'a pas pu analyser ce contenu. Vérifiez que le texte est bien une annonce de bourse." },
        { status: 422 }
      );
    }
    if (!offre.organisme || !offre.intitule) {
      return NextResponse.json(
        { erreur: "L'IA n'a pas trouvé d'organisme ou d'intitulé dans ce texte. Êtes-vous sûr que c'est une annonce de bourse ?" },
        { status: 422 }
      );
    }

    const dateLimite = parseDateLimite(offre.dateLimite);
    const avertissement =
      !dateLimite && !offre.exigenceLangue
        ? "Date limite et exigence de langue non précisées dans l'offre."
        : !dateLimite
        ? "Date limite non précisée dans l'offre."
        : !offre.exigenceLangue
        ? "Exigence de langue non précisée dans l'offre."
        : undefined;

    const opportunite = await prisma.opportunite.create({
      data: {
        organisme: offre.organisme,
        intitule: offre.intitule,
        description: offre.description ?? contenu.slice(0, 2000),
        contenuBrut: contenu,
        langueDetectee: offre.langueDetectee ?? "fr",
        conditions: offre.conditions ?? null,
        piecesExigees: JSON.stringify(offre.piecesExigees ?? []),
        exigenceLangue: offre.exigenceLangue ?? null,
        dateLimite,
        lien: offre.lien ?? null,
        source: "COLLEE",
        type: "BOURSE",
        canalCandidature: normaliserCanal(offre.canalCandidature),
        cibleCandidature: offre.cibleCandidature ?? null,
        actif: true,
      },
    });

    return NextResponse.json({
      opportuniteId: opportunite.id,
      ...(avertissement ? { avertissement } : {}),
    });
  } catch (err) {
    console.error("Erreur lire-offre:", err);
    return NextResponse.json({ erreur: "Erreur du service IA" }, { status: 500 });
  }
}
