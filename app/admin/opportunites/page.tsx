import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { GestionOpportunites } from "@/components/admin/GestionOpportunites";

export const dynamic = "force-dynamic";

export default async function PageOpportunites() {
  const rows = await prisma.opportunite.findMany({
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
    select: { id: true, intitule: true, organisme: true, type: true, statut: true, actif: true, dateLimite: true, source: true },
  });

  const initial = rows.map((o) => ({
    id: o.id,
    intitule: o.intitule,
    organisme: o.organisme,
    type: o.type,
    statut: o.statut,
    actif: o.actif,
    dateLimite: o.dateLimite?.toISOString() ?? null,
    source: o.source,
  }));

  return (
    <>
      <EnteteAdmin
        titre="Gestion des opportunités"
        sousTitre={`${initial.length} au total`}
        action={
          <Link href="/admin/opportunites/nouvelle" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontSize: "0.84rem", fontWeight: 600, textDecoration: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Ajouter
          </Link>
        }
      />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full">
        <GestionOpportunites initial={initial} />
      </main>
    </>
  );
}
