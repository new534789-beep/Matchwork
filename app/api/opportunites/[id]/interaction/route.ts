import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

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
    select: { id: true },
  });
  if (!opportunite) {
    return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
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
