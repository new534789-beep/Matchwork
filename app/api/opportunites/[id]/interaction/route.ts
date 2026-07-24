import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifierCompatibilite } from "@/lib/ia/verification-compatibilite";
import { getProfilActifSelect } from "@/lib/profil/actif";

type Params = { params: Promise<{ id: string }> };

// Un champ profil "vide" au sens JSON (ex. "[]", "", null) — pas assez de
// matière pour juger une compatibilité, on ne bloque jamais dans ce cas.
function estRempli(v: string | null | undefined): boolean {
  if (!v) return false;
  const t = v.trim();
  return t.length > 0 && t !== "[]" && t !== "{}";
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { id: opportuniteId } = await params;
  const body = await req.json() as { decision?: string };
  const { decision } = body;

  if (!decision || !["interesse", "ignore"].includes(decision)) {
    return NextResponse.json(
      { erreur: "decision doit être 'interesse' ou 'ignore'" },
      { status: 400 }
    );
  }

  const opportunite = await prisma.opportunite.findUnique({
    where: { id: opportuniteId },
    select: {
      id: true, type: true, intitule: true, organisme: true, description: true,
      contenuBrut: true, conditions: true,
    },
  });
  if (!opportunite) {
    return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  }

  // Contrôle de compatibilité — uniquement sur « intéressé », pas pour les
  // appels à projets (dossier basé sur un brief projet, pas sur le profil
  // personnel du candidat : la notion de "décalage de domaine" ne s'applique
  // pas de la même façon). Fail-open : profil incomplet, vide, ou IA
  // indisponible → on ne bloque jamais, on laisse passer normalement.
  if (decision === "interesse" && opportunite.type !== "APPEL_PROJET") {
    const profil = await getProfilActifSelect(session.user.id, {
      complete: true, formations: true, experiences: true, competences: true,
    });
    if (profil?.complete && (estRempli(profil.formations) || estRempli(profil.experiences))) {
      const resultat = await verifierCompatibilite(profil, opportunite);
      if (resultat && resultat.compatible === false) {
        return NextResponse.json({
          incompatible: true,
          raison: resultat.raison ?? "Cette offre ne semble pas correspondre à votre profil.",
        });
      }
    }
  }

  const interaction = await prisma.interaction.upsert({
    where: {
      userId_opportuniteId: {
        userId: session.user.id,
        opportuniteId,
      },
    },
    update: { decision },
    create: {
      userId: session.user.id,
      opportuniteId,
      decision,
    },
  });

  // Sur « intéressé » : créer un dossier « à préparer » (idempotent).
  // Sa génération automatique est branchée à l'étape 3 (déclenchée au swipe / « Ça m'intéresse »).
  if (decision === "interesse") {
    const dossierExistant = await prisma.dossier.findFirst({
      where: { userId: session.user.id, opportuniteId },
      select: { id: true },
    });
    if (!dossierExistant) {
      await prisma.dossier.create({
        data: { userId: session.user.id, opportuniteId, statut: "a_preparer" },
      });
    }
  }

  return NextResponse.json({ interaction });
}
