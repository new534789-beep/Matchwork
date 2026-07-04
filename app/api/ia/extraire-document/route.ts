import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_PROMPT_EXTRACTION } from "@/lib/ia/prompts/extraction";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  if (!hasMistralKey()) {
    console.warn("MISTRAL_API_KEY non définie — extraction IA ignorée");
    return NextResponse.json({ succes: false, raison: "clé_api_manquante" });
  }

  try {
    const { documentId, type, nomFichier, contenuBase64, mimeType } = await req.json() as {
      documentId: string;
      type: string;
      nomFichier: string;
      contenuBase64: string;
      mimeType: string;
    };

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.userId !== session.user.id) {
      return NextResponse.json({ erreur: "Document introuvable" }, { status: 404 });
    }

    const client = getMistralClient();
    const estImage = (mimeType as string).startsWith("image/");

    let infos: Record<string, unknown> = {};
    let texte = "";

    if (estImage) {
      // Vision (Pixtral) pour les images
      const result = await client.chat.complete({
        model: MODELS.vision,
        messages: [
          { role: "system", content: SYSTEM_PROMPT_EXTRACTION },
          {
            role: "user",
            content: [
              {
                type: "image_url" as const,
                imageUrl: `data:${mimeType};base64,${contenuBase64}`,
              },
              {
                type: "text" as const,
                text: `Type déclaré : ${type}\nNom du fichier : ${nomFichier}\n\nExtrait les informations pertinentes selon le system prompt. Réponds en JSON.`,
              },
            ],
          },
        ],
      });
      texte = (result.choices?.[0]?.message?.content as string) ?? "";
    } else {
      // PDF ou autre : extraction à partir des métadonnées du fichier
      const result = await client.chat.complete({
        model: MODELS.large,
        messages: [
          { role: "system", content: SYSTEM_PROMPT_EXTRACTION },
          {
            role: "user",
            content: `Type de document : ${type}\nNom du fichier : ${nomFichier}\nFormat : PDF\n\nExtrait les informations pertinentes que l'on peut déduire du type et du nom du document. Réponds en JSON.`,
          },
        ],
        responseFormat: { type: "json_object" },
      });
      texte = (result.choices?.[0]?.message?.content as string) ?? "";
    }

    try {
      const match = texte.match(/\{[\s\S]*\}/);
      if (match) infos = JSON.parse(match[0]);
    } catch {
      infos = { texte_brut: texte };
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { infosExtraites: JSON.stringify(infos), extraitParIa: true },
    });

    return NextResponse.json({ succes: true, infos });
  } catch (err) {
    console.error("Erreur extraction IA:", err);
    return NextResponse.json({ erreur: "Erreur lors de l'extraction" }, { status: 500 });
  }
}
