import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { MessagesClient } from "@/components/messages/MessagesClient";

export default async function Messages() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  let messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  // Message de bienvenue à la première visite (les organismes écriront ensuite ici).
  if (messages.length === 0) {
    await prisma.message.create({
      data: {
        userId,
        auteur: "systeme",
        nomAuteur: "Matchwork",
        contenu:
          "Bienvenue dans votre messagerie ! C'est ici que les organismes (universités, fondations, employeurs) pourront vous contacter directement au sujet de vos candidatures. Vous recevrez aussi nos informations importantes à cet endroit.",
      },
    });
    messages = await prisma.message.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  const initial = messages.map((m) => ({
    id: m.id,
    auteur: m.auteur,
    nomAuteur: m.nomAuteur,
    contenu: m.contenu,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <>
      <EnteteApp titre="Messages" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        <MessagesClient initial={initial} />
      </main>
    </>
  );
}
