import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { FileValidation } from "@/components/admin/FileValidation";
import { STATUTS_EN_FILE } from "@/lib/opportunites";

export const dynamic = "force-dynamic";

export default async function PageValidation() {
  const rows = await prisma.opportunite.findMany({
    // a_valider (date fiable) + revue_manuelle (date à fixer à la main).
    where: { statut: { in: [...STATUTS_EN_FILE] } },
    // Les items à revoir d'abord, puis les plus récemment vus.
    orderBy: [{ statut: "asc" }, { premiereVue: "desc" }],
    select: {
      id: true, intitule: true, organisme: true, type: true, description: true,
      source: true, lien: true, dateLimite: true, langueDetectee: true,
      statut: true, confianceDateLimite: true, sourceDateLimite: true,
      fluxSource: { select: { nom: true } },
    },
  });

  const initial = rows.map((o) => ({
    id: o.id,
    intitule: o.intitule,
    organisme: o.organisme,
    type: o.type,
    description: o.description,
    source: o.source,
    lien: o.lien,
    dateLimite: o.dateLimite?.toISOString() ?? null,
    langueDetectee: o.langueDetectee,
    statut: o.statut,
    confianceDateLimite: o.confianceDateLimite,
    sourceDateLimite: o.sourceDateLimite,
    fluxSourceNom: o.fluxSource?.nom ?? null,
  }));

  return (
    <>
      <EnteteAdmin
        titre="File de validation"
        sousTitre={`${initial.length} opportunité${initial.length > 1 ? "s" : ""} en attente — rien n'est publié sans validation`}
      />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full" style={{ maxWidth: 880 }}>
        <FileValidation initial={initial} />
      </main>
    </>
  );
}
