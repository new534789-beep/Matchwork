import { sessionCourante, getUtilisateur } from "@/lib/session";
import { redirect } from "next/navigation";
import { SelecteurProfils } from "@/components/profil/SelecteurProfils";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { FormulaireProfil } from "@/components/profil/FormulaireProfil";
import { getProfilActif } from "@/lib/profil/actif";

function parseProfil(profil: Record<string, unknown> | null) {
  if (!profil) return null;
  return {
    ...profil,
    formations: JSON.parse((profil.formations as string) || "[]"),
    experiences: JSON.parse((profil.experiences as string) || "[]"),
    competences: JSON.parse((profil.competences as string) || "[]"),
    langues: JSON.parse((profil.langues as string) || "[]"),
    sessionOnboarding: JSON.parse((profil.sessionOnboarding as string) || "[]"),
  };
}

export default async function Profil() {
  const session = await sessionCourante();
  if (!session?.user?.id) redirect("/connexion");

  const [profilBrut, user] = await Promise.all([
    getProfilActif(session.user.id),
    getUtilisateur(session.user.id),
  ]);

  const profil = parseProfil(profilBrut as unknown as Record<string, unknown> | null);

  return (
    <>
      <EnteteApp titre="Mon profil" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        {(user?.plan === "pro" || user?.plan === "pro_plus") && <SelecteurProfils />}
        <FormulaireProfil key={profilBrut?.id} profilInitial={profil as never} />
      </main>
    </>
  );
}
