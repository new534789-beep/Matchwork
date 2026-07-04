import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { CollerOffreForm } from "@/components/opportunites/CollerOffreForm";

export default async function CollerOffrePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  return (
    <>
      <EnteteApp titre="Coller une offre" retour="/tableau-de-bord" />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-2)" }}>
          Vous avez trouvé une bourse ailleurs ? Collez le texte de l&apos;annonce :
          Amara en extrait l&apos;organisme, les conditions, les pièces exigées et la date
          limite, puis l&apos;ajoute à vos opportunités.
        </p>
        <CollerOffreForm />
      </main>
    </>
  );
}
