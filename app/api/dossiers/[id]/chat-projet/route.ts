import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { buildSystemChatProjet } from "@/lib/ia/prompts/chat-projet";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { message, historique } = (await req.json()) as {
    message: string;
    historique: { role: "user" | "assistant"; content: string }[];
  };

  if (!message?.trim()) {
    return NextResponse.json({ erreur: "Message vide" }, { status: 400 });
  }

  const dossier = await prisma.dossier.findFirst({
    where: { id, userId: session.user.id },
    include: { opportunite: true },
  });

  if (!dossier) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  if (!hasMistralKey()) {
    return NextResponse.json({ erreur: "IA non configurée" }, { status: 500 });
  }

  const systemPrompt = buildSystemChatProjet({
    intitule: dossier.opportunite.intitule,
    organisme: dossier.opportunite.organisme,
    description: dossier.opportunite.description,
    conditions: dossier.opportunite.conditions,
    dateLimite: dossier.opportunite.dateLimite,
  });

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...(Array.isArray(historique) ? historique : []),
    { role: "user", content: message },
  ];

  try {
    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages,
    });

    const reponse = ((result.choices?.[0]?.message?.content as string) ?? "").trim();

    let termine = false;
    let brief: Record<string, string> | null = null;

    const jsonMatch = reponse.match(/\{"termine"\s*:\s*true\s*,\s*"brief"\s*:\s*\{[^}]+\}\s*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.termine && parsed.brief) {
          termine = true;
          brief = parsed.brief;
          await prisma.dossier.update({
            where: { id },
            data: {
              briefProjet: JSON.stringify(brief),
              statut: "brief_pret",
            },
          });
        }
      } catch {
        // JSON malformé — on continue la conversation
      }
    }

    return NextResponse.json({
      reponse: termine ? "Merci ! J'ai bien compris votre projet. Vous pouvez maintenant générer votre dossier." : reponse,
      termine,
      brief,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erreur: msg }, { status: 500 });
  }
}
