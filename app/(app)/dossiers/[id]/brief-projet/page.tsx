import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { ChatProjet } from "./ChatProjet";

export default async function BriefProjetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { id } = await params;

  const dossier = await prisma.dossier.findFirst({
    where: { id, userId: session.user.id },
    include: {
      opportunite: {
        select: {
          id: true,
          intitule: true,
          organisme: true,
          description: true,
        },
      },
    },
  });

  if (!dossier) redirect("/opportunites");

  if (dossier.briefProjet && dossier.statut !== "brief_en_cours") {
    redirect(`/dossiers/${id}`);
  }

  return (
    <>
      <EnteteApp titre="Brief projet" retour="/opportunites/appels-projets" />
      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full" style={{ height: "calc(100dvh - 60px)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {dossier.opportunite.intitule}
          </p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            {dossier.opportunite.organisme}
          </p>
        </div>
        <ChatProjet dossierId={dossier.id} />
      </main>
    </>
  );
}
