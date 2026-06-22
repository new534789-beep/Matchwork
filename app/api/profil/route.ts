import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const profil = await prisma.profil.findUnique({
    where: { userId: session.user.id },
  });

  if (!profil) {
    return NextResponse.json({ erreur: "Profil introuvable" }, { status: 404 });
  }

  return NextResponse.json(profil);
}

const schemaMaj = z.object({
  bio: z.string().optional(),
  formations: z.array(z.any()).optional(),
  experiences: z.array(z.any()).optional(),
  competences: z.array(z.any()).optional(),
  langues: z.array(z.any()).optional(),
  objectifs: z.string().optional(),
  tonSouhaite: z.string().optional(),
  complete: z.boolean().optional(),
  sessionOnboarding: z.array(z.any()).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schemaMaj.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ erreur: "Données invalides" }, { status: 400 });
    }

    const profil = await prisma.profil.upsert({
      where: { userId: session.user.id },
      update: parsed.data,
      create: { userId: session.user.id, ...parsed.data },
    });

    return NextResponse.json(profil);
  } catch (err) {
    console.error("Erreur mise à jour profil:", err);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
