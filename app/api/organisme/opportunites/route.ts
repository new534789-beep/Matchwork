import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaOpp = z.object({
  type: z.enum(["BOURSE", "EMPLOI", "STAGE", "FORMATION", "ADMISSION", "RECOMPENSE", "APPEL_PROJET"]),
  intitule: z.string().min(5).max(500),
  description: z.string().min(20).max(10000),
  conditions: z.string().max(5000).optional(),
  dateLimite: z.string().optional(),
  lien: z.string().url().max(1000).optional(),
  piecesExigees: z.array(z.object({
    nom: z.string().max(200),
    obligatoire: z.boolean(),
  })).max(20).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const organisme = await prisma.organisme.findUnique({ where: { userId: session.user.id } });
  if (!organisme) {
    return NextResponse.json({ erreur: "Organisme introuvable" }, { status: 403 });
  }

  const opportunites = await prisma.opportunite.findMany({
    where: { organisme: organisme.nom, source: "portail_b2b" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, type: true, intitule: true, statut: true, dateLimite: true,
      createdAt: true, _count: { select: { interactions: true, dossiers: true } },
    },
  });

  return NextResponse.json({ opportunites });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const organisme = await prisma.organisme.findUnique({ where: { userId: session.user.id } });
  if (!organisme) {
    return NextResponse.json({ erreur: "Organisme introuvable" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schemaOpp.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  const opp = await prisma.opportunite.create({
    data: {
      type: parsed.data.type,
      source: "portail_b2b",
      organisme: organisme.nom,
      intitule: parsed.data.intitule,
      description: parsed.data.description,
      conditions: parsed.data.conditions,
      dateLimite: parsed.data.dateLimite ? new Date(parsed.data.dateLimite) : null,
      lien: parsed.data.lien,
      piecesExigees: JSON.stringify(parsed.data.piecesExigees || []),
      statut: organisme.verifie ? "publiee" : "a_valider",
      actif: true,
    },
  });

  return NextResponse.json(opp, { status: 201 });
}
