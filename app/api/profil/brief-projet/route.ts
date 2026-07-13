import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_BRIEF_PROJET_GENERAL } from "@/lib/ia/prompts/brief-projet-general";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { message, historique } = (await req.json()) as {
    message: string;
    historique: { role: "user" | "assistant"; content: string }[];
  };

  if (!message?.trim()) {
    return NextResponse.json({ erreur: "Message vide" }, { status: 400 });
  }

  if (!hasMistralKey()) {
    return NextResponse.json({ erreur: "IA non configurée" }, { status: 500 });
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_BRIEF_PROJET_GENERAL },
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
          await prisma.profil.update({
            where: { userId: session.user.id },
            data: { profilProjet: JSON.stringify(brief) },
          });
        }
      } catch {
        // JSON malformé — on continue la conversation
      }
    }

    return NextResponse.json({
      reponse: termine ? "Merci ! J'ai bien compris votre projet. Vous pouvez maintenant explorer les appels à projets." : reponse,
      termine,
      brief,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erreur: msg }, { status: 500 });
  }
}
