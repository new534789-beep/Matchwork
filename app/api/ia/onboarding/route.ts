import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_ONBOARDING } from "@/lib/ia/prompts/onboarding";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  try {
    const { message, historique } = await req.json() as {
      message: string;
      historique: Anthropic.MessageParam[];
    };

    // Récupérer le profil actuel pour contexte
    const profil = await prisma.profil.findUnique({
      where: { userId: session.user.id },
    });

    const systemAvecContexte = `${SYSTEM_PROMPT_ONBOARDING}

PROFIL ACTUEL (déjà collecté) :
${JSON.stringify(
  {
    bio: profil?.bio,
    formations: profil?.formations,
    experiences: profil?.experiences,
    competences: profil?.competences,
    langues: profil?.langues,
    objectifs: profil?.objectifs,
    tonSouhaite: profil?.tonSouhaite,
  },
  null,
  2
)}

Ne répète pas des questions sur des sections déjà renseignées. Continue là où la conversation s'est arrêtée.`;

    // Construire l'historique de messages
    const messages: Anthropic.MessageParam[] = [
      ...((historique as Anthropic.MessageParam[]) ?? []),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemAvecContexte,
      messages,
    });

    const texteReponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parser la réponse JSON de l'IA
    let parsed: {
      message: string;
      section_en_cours: string;
      donnees_extraites?: Record<string, unknown>;
      onboarding_termine: boolean;
    };

    try {
      const match = texteReponse.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { message: texteReponse, section_en_cours: "inconnu", onboarding_termine: false };
    } catch {
      parsed = { message: texteReponse, section_en_cours: "inconnu", onboarding_termine: false };
    }

    // Sauvegarder les données extraites dans le profil
    if (parsed.donnees_extraites && Object.keys(parsed.donnees_extraites).length > 0) {
      const maj: Record<string, unknown> = {};

      // Fusionner les tableaux (formations, expériences, etc.) avec les données existantes
      for (const [cle, valeur] of Object.entries(parsed.donnees_extraites)) {
        if (Array.isArray(valeur) && Array.isArray((profil as Record<string, unknown> | null)?.[cle])) {
          const existant = ((profil as Record<string, unknown>)[cle] as unknown[]) ?? [];
          maj[cle] = [...existant, ...valeur];
        } else {
          maj[cle] = valeur;
        }
      }

      if (parsed.onboarding_termine) {
        maj.complete = true;
      }

      await prisma.profil.upsert({
        where: { userId: session.user.id },
        update: maj,
        create: { userId: session.user.id, ...maj },
      });
    } else if (parsed.onboarding_termine) {
      await prisma.profil.update({
        where: { userId: session.user.id },
        data: { complete: true },
      });
    }

    return NextResponse.json({
      message: parsed.message,
      sectionEnCours: parsed.section_en_cours,
      onboardingTermine: parsed.onboarding_termine,
      // On renvoie l'historique mis à jour pour que le client puisse le conserver
      historiqueMAJ: [
        ...messages,
        { role: "assistant", content: texteReponse },
      ],
    });
  } catch (err) {
    console.error("Erreur onboarding IA:", err);
    return NextResponse.json({ erreur: "Erreur du service IA" }, { status: 500 });
  }
}
