import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// SQLite stocke les tableaux JSON comme des strings — helpers de sérialisation
function serializeJson(val: unknown): string {
  return typeof val === "string" ? val : JSON.stringify(val);
}

function parseProfil(profil: Record<string, unknown>) {
  return {
    ...profil,
    formations: JSON.parse((profil.formations as string) || "[]"),
    experiences: JSON.parse((profil.experiences as string) || "[]"),
    competences: JSON.parse((profil.competences as string) || "[]"),
    langues: JSON.parse((profil.langues as string) || "[]"),
    sessionOnboarding: JSON.parse((profil.sessionOnboarding as string) || "[]"),
  };
}

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

  return NextResponse.json(parseProfil(profil as unknown as Record<string, unknown>));
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

    // Sérialiser les tableaux en JSON string pour SQLite
    const data: Record<string, unknown> = { ...parsed.data };
    for (const key of ["formations", "experiences", "competences", "langues", "sessionOnboarding"]) {
      if (data[key] !== undefined) data[key] = serializeJson(data[key]);
    }

    const profil = await prisma.profil.upsert({
      where: { userId: session.user.id },
      update: data,
      create: { userId: session.user.id, ...data },
    });

    return NextResponse.json(parseProfil(profil as unknown as Record<string, unknown>));
  } catch (err) {
    console.error("Erreur mise à jour profil:", err);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
