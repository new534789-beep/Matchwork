import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const opportunite = await prisma.opportunite.findUnique({
    where: { id },
  });

  if (!opportunite) {
    return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  }

  const interaction = await prisma.interaction.findUnique({
    where: {
      userId_opportuniteId: { userId: session.user.id, opportuniteId: id },
    },
    select: { decision: true },
  });

  return NextResponse.json({
    opportunite: {
      ...opportunite,
      piecesExigees: (() => {
        try { return JSON.parse(opportunite.piecesExigees); } catch { return []; }
      })(),
      dateLimite: opportunite.dateLimite?.toISOString() ?? null,
    },
    decisionUtilisateur: interaction?.decision ?? null,
  });
}
