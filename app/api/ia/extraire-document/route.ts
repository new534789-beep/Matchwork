import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_EXTRACTION } from "@/lib/ia/prompts/extraction";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  try {
    const { documentId, type, nomFichier, contenuBase64, mimeType } = await req.json();

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.userId !== session.user.id) {
      return NextResponse.json({ erreur: "Document introuvable" }, { status: 404 });
    }

    // Construire le message selon le type de fichier
    const messageContent: Anthropic.MessageParam["content"] = [];

    const estImage = (mimeType as string).startsWith("image/");
    const estPdf = mimeType === "application/pdf";

    if (estImage) {
      messageContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: contenuBase64,
        },
      });
    } else if (estPdf) {
      messageContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: contenuBase64,
        },
      } as unknown as Anthropic.TextBlockParam);
    }

    messageContent.push({
      type: "text",
      text: `Type déclaré par l'utilisateur : ${type}\nNom du fichier : ${nomFichier}\n\nExtrait les informations pertinentes de ce document.`,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT_EXTRACTION,
      messages: [{ role: "user", content: messageContent }],
    });

    const texte = response.content[0].type === "text" ? response.content[0].text : "";

    let infos: Record<string, unknown> = {};
    try {
      // Extraire le JSON de la réponse (Claude peut ajouter du texte autour)
      const match = texte.match(/\{[\s\S]*\}/);
      if (match) infos = JSON.parse(match[0]);
    } catch {
      infos = { texte_brut: texte };
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { infosExtraites: infos, extraitParIa: true },
    });

    return NextResponse.json({ succes: true, infos });
  } catch (err) {
    console.error("Erreur extraction IA:", err);
    return NextResponse.json({ erreur: "Erreur lors de l'extraction" }, { status: 500 });
  }
}
