import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { FilSwipe } from "../FilSwipe";

export default async function FilAdmissions() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const opportunites = await prisma.opportunite.findMany({
    where: {
      type: "ADMISSION",
      actif: true,
      statut: "publiee",
      interactions: { none: { userId: session.user.id } },
    },
    orderBy: [
      { dateLimite: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      type: true,
      organisme: true,
      intitule: true,
      description: true,
      langueDetectee: true,
      conditions: true,
      piecesExigees: true,
      exigenceLangue: true,
      dateLimite: true,
      lien: true,
      source: true,
    },
  });

  const initial = opportunites.map((o) => ({
    ...o,
    piecesExigees: (() => {
      try { return JSON.parse(o.piecesExigees) as { nom: string; obligatoire: boolean }[]; }
      catch { return []; }
    })(),
    dateLimite: o.dateLimite?.toISOString() ?? null,
  }));

  return (
    <>
      <EnteteApp titre="Admissions" retour="/opportunites" />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Fil des admissions</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            Glissez à droite si ça vous intéresse, à gauche pour passer.
          </p>
        </div>
        <FilSwipe initial={initial} />
      </main>
    </>
  );
}
