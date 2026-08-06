import { sessionCourante } from "@/lib/session";
import { redirect } from "next/navigation";
import { obtenirFilOpportunites } from "@/lib/opportunites/fil";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { FilSwipe } from "../FilSwipe";
import { calculerScore } from "@/lib/matching/score";
import { getProfilActifSelect } from "@/lib/profil/actif";

export default async function FilRecompenses() {
  const session = await sessionCourante();
  if (!session?.user?.id) redirect("/connexion");

  const [fil, profil] = await Promise.all([
    obtenirFilOpportunites(session.user.id, "RECOMPENSE"),
    getProfilActifSelect(session.user.id, {
      complete: true, formations: true, experiences: true, competences: true, langues: true, objectifs: true, nationalite: true,
    }),
  ]);

  const initial = fil.map((o) => ({
    ...o,
    piecesExigees: (() => {
      try { return JSON.parse(o.piecesExigees) as { nom: string; obligatoire: boolean }[]; }
      catch { return []; }
    })(),
    score: profil?.complete ? calculerScore(profil, o) : null,
  }));

  if (profil?.complete) initial.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <>
      <EnteteApp titre="Récompenses" retour="/opportunites" />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Fil des prix et récompenses</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            Glissez à droite si ça vous intéresse, à gauche pour passer.
          </p>
        </div>
        <FilSwipe initial={initial} profilComplet={!!profil?.complete} />
      </main>
    </>
  );
}
