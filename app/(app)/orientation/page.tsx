import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ParcoursOrientation } from "@/components/orientation/ParcoursOrientation";
import { sessionCourante } from "@/lib/session";
import { ANNEE_UNIVERSITAIRE } from "@/lib/orientation/donnees";
import { getProfilActif } from "@/lib/profil/actif";

export const metadata: Metadata = {
  title: "IA Orientation",
  description:
    "Calcule ta moyenne de classement pour chaque filière des universités publiques du Bénin, à partir de ton relevé de notes.",
};

export default async function Orientation() {
  const session = await sessionCourante();
  if (!session?.user?.id) redirect("/connexion");

  const profil = await getProfilActif(session.user.id);
  const nom = profil?.nomComplet?.trim() || session.user.name?.trim() || null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-5">
      <header>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
          IA Orientation
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Ta moyenne de classement, filière par filière, calculée selon la règle
          officielle du guide MESRS {ANNEE_UNIVERSITAIRE}.
        </p>
      </header>

      <ParcoursOrientation nom={nom} />
    </div>
  );
}
