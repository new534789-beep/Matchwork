import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaCreation = z.object({
  nom: z.string().min(2).max(200),
  type: z.enum(["universite", "ong", "entreprise", "gouvernement"]),
  pays: z.string().max(100).optional(),
  siteWeb: z.string().url().max(500).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const organisme = await prisma.organisme.findUnique({
    where: { userId: session.user.id },
  });

  if (!organisme) {
    return NextResponse.json({ erreur: "Pas d'organisme" }, { status: 404 });
  }

  return NextResponse.json(organisme);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const existing = await prisma.organisme.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    return NextResponse.json({ erreur: "Organisme déjà créé" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schemaCreation.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Données invalides" }, { status: 400 });
  }

  const organisme = await prisma.organisme.create({
    data: {
      userId: session.user.id,
      nom: parsed.data.nom,
      type: parsed.data.type,
      pays: parsed.data.pays,
      siteWeb: parsed.data.siteWeb,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "organisme" },
  });

  return NextResponse.json(organisme, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const organisme = await prisma.organisme.update({
    where: { userId: session.user.id },
    data: {
      nom: body.nom,
      type: body.type,
      pays: body.pays,
      siteWeb: body.siteWeb,
    },
  });

  return NextResponse.json(organisme);
}
