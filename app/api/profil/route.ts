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

const MAX_TEXTE = 5000;
const texte = (max = MAX_TEXTE) => z.string().max(max);

const schemaFormation = z.object({
  etablissement: texte(300),
  diplome: texte(300),
  annee: texte(20),
  note: texte(100).optional(),
  domaine: texte(300).optional(),
});

const schemaExperience = z.object({
  poste: texte(300),
  organisation: texte(300),
  dateDebut: texte(20),
  dateFin: texte(20).optional(),
  description: texte(2000).optional(),
});

const schemaLangue = z.object({
  langue: texte(100),
  niveau: texte(50),
});

const schemaMessage = z.object({
  role: z.enum(["assistant", "user"]),
  content: texte(10000),
});

const schemaMaj = z.object({
  nomComplet: texte(200).optional(),
  dateNaissance: texte(50).optional(),
  lieuNaissance: texte(200).optional(),
  nationalite: texte(100).optional(),
  telephone: texte(50).optional(),
  adresse: texte(500).optional(),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  signature: texte(200).optional(),
  linkedin: texte(300).optional(),
  bio: texte(3000).optional(),
  formations: z.array(schemaFormation).max(50).optional(),
  experiences: z.array(schemaExperience).max(50).optional(),
  competences: z.array(texte(200)).max(100).optional(),
  langues: z.array(schemaLangue).max(30).optional(),
  objectifs: texte(3000).optional(),
  tonSouhaite: texte(50).optional(),
  complete: z.boolean().optional(),
  sessionOnboarding: z.array(schemaMessage).max(500).optional(),
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
