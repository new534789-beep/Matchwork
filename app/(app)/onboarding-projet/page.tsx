import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { ChatProjetGeneral } from "./ChatProjetGeneral";

export default async function OnboardingProjetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const profil = await prisma.profil.findUnique({
    where: { userId: session.user.id },
    select: { profilProjet: true },
  });

  if (profil?.profilProjet) redirect("/opportunites/appels-projets");

  return (
    <>
      <EnteteApp titre="Décrivez votre projet" retour="/opportunites/appels-projets" />
      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full" style={{ height: "calc(100dvh - 60px)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Blessing</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            Quelques questions avant de débloquer les appels à projets
          </p>
        </div>
        <ChatProjetGeneral />
      </main>
    </>
  );
}
