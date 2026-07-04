import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { OpportuniteForm } from "@/components/admin/OpportuniteForm";

export default function NouvelleOpportunite() {
  return (
    <>
      <EnteteAdmin titre="Ajouter une opportunité" sousTitre="Opportunité vérifiée — publiée directement (ne passe pas par la file)" />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full">
        <OpportuniteForm mode="create" />
      </main>
    </>
  );
}
