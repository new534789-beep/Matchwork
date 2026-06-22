import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { FormulaireProfil } from "@/components/profil/FormulaireProfil";

export default async function Profil() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const profil = await prisma.profil.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <>
      <EnteteApp titre="Mon profil" />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <FormulaireProfil profilInitial={profil} />
      </main>
    </>
  );
}
