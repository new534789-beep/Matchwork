import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { FormulaireProfil } from "@/components/profil/FormulaireProfil";

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
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const profilBrut = await prisma.profil.findUnique({
    where: { userId: session.user.id },
  });

  const profil = parseProfil(profilBrut as unknown as Record<string, unknown> | null);

  return (
    <>
      <EnteteApp titre="Mon profil" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        <FormulaireProfil profilInitial={profil as never} />
      </main>
    </>
  );
}
