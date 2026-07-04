import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { GestionSources } from "@/components/admin/GestionSources";

export const dynamic = "force-dynamic";

export default async function PageSources() {
  const rows = await prisma.fluxSource.findMany({ orderBy: { createdAt: "desc" } });
  const initial = rows.map((s) => ({
    id: s.id,
    nom: s.nom,
    url: s.url,
    type: s.type,
    categorie: s.categorie,
    actif: s.actif,
    etat: s.etat,
    dernierFetch: s.dernierFetch?.toISOString() ?? null,
  }));

  return (
    <>
      <EnteteAdmin titre="Sources de flux" sousTitre="URLs RSS/XML à ingérer — l'ingestion alimente la file de validation" />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full" style={{ maxWidth: 900 }}>
        <GestionSources initial={initial} />
      </main>
    </>
  );
}
