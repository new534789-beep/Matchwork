import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { OpportuniteForm } from "@/components/admin/OpportuniteForm";

export const dynamic = "force-dynamic";

export default async function ModifierOpportunite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await prisma.opportunite.findUnique({ where: { id } });
  if (!o) notFound();

  const initial = {
    type: o.type,
    organisme: o.organisme,
    intitule: o.intitule,
    description: o.description,
    dateLimite: o.dateLimite ? o.dateLimite.toISOString().slice(0, 10) : "",
    lien: o.lien ?? "",
    conditions: o.conditions ?? "",
    exigenceLangue: o.exigenceLangue ?? "",
    langueDetectee: o.langueDetectee ?? "fr",
  };

  return (
    <>
      <EnteteAdmin titre="Modifier l'opportunité" sousTitre={o.intitule} />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full">
        <OpportuniteForm mode="edit" id={o.id} initial={initial} />
      </main>
    </>
  );
}
