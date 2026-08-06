import { sessionCourante } from "@/lib/session";
import { redirect } from "next/navigation";
import { obtenirFilOpportunites } from "@/lib/opportunites/fil";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { FilSwipe } from "../FilSwipe";
import { calculerScore } from "@/lib/matching/score";
import { getProfilActifSelect } from "@/lib/profil/actif";

export default async function FilAppelsProjets() {
  const session = await sessionCourante();
  if (!session?.user?.id) redirect("/connexion");

  const [fil, profil] = await Promise.all([
    obtenirFilOpportunites(session.user.id, "APPEL_PROJET"),
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
      <EnteteApp titre="Appels à projets" retour="/opportunites" />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Fil des appels à projets</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            Glissez à droite pour décrire votre projet et générer votre dossier.
          </p>
        </div>
        <FilSwipe
          initial={initial}
          profilComplet={!!profil?.complete}
          gateSupplementaire={
            !profil?.profilProjet
              ? {
                  lien: "/onboarding-projet",
                  titre: "Décrivez votre projet avec Amara",
                  sousTitre: "Répondez à quelques questions pour débloquer le swipe des appels à projets",
                }
              : undefined
          }
        />
      </main>
    </>
  );
}
