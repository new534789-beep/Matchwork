import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { CoffreFortClient } from "@/components/coffre-fort/CoffreFortClient";

export default async function CoffreFort() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      nomFichier: true,
      taille: true,
      infosExtraites: true,
      extraitParIa: true,
      createdAt: true,
    },
  });

  return (
    <>
      <EnteteApp titre="Coffre-fort" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-2)" }}>
          Déposez vos pièces ici. Elles sont chiffrées et accessibles uniquement par vous.
          L&apos;IA en extrait automatiquement les informations utiles pour vos candidatures.
        </p>
        <CoffreFortClient documentsInitiaux={documents} />
      </main>
    </>
  );
}
