import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  if (!hasMistralKey()) {
    return NextResponse.json(
      { erreur: "Traduction non disponible : clé MISTRAL_API_KEY manquante dans .env.local" },
      { status: 503 }
    );
  }

  const { opportuniteId } = await req.json() as { opportuniteId?: string };
  if (!opportuniteId) return NextResponse.json({ erreur: "opportuniteId manquant" }, { status: 400 });

  const opportunite = await prisma.opportunite.findUnique({
    where: { id: opportuniteId },
    select: { description: true, conditions: true, langueDetectee: true, intitule: true },
  });

  if (!opportunite) return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  if (opportunite.langueDetectee === "fr") return NextResponse.json({ traduit: opportunite.description });

  try {
    const texteSource = [
      `TITRE: ${opportunite.intitule}`,
      `DESCRIPTION: ${opportunite.description}`,
      opportunite.conditions ? `CONDITIONS: ${opportunite.conditions}` : "",
    ].filter(Boolean).join("\n\n");

    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages: [
        {
          role: "system",
          content: `Tu es un traducteur professionnel. Traduis fidèlement le texte fourni en français.
Ne résume pas, ne reformule pas, ne rajoute rien. Traduis uniquement ce qui est écrit.
Réponds en JSON avec ce format exact : {"titre":"...","description":"..."}
Le champ "titre" contient la traduction du TITRE, le champ "description" contient la traduction de la DESCRIPTION (et des CONDITIONS si présentes).`,
        },
        { role: "user", content: texteSource },
      ],
      responseFormat: { type: "json_object" },
    });

    const raw = (result.choices?.[0]?.message?.content as string) ?? "{}";
    try {
      const parsed = JSON.parse(raw) as { titre?: string; description?: string };
      return NextResponse.json({
        traduit: parsed.description || raw,
        titre: parsed.titre || null,
      });
    } catch {
      return NextResponse.json({ traduit: raw });
    }
  } catch (err) {
    console.error("Erreur traduction:", err);
    return NextResponse.json({ erreur: "Erreur du service de traduction" }, { status: 500 });
  }
}
