import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import Link from "next/link";

export const dynamic = "force-dynamic";

function debutDuMois() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const ICONES: Record<string, React.ReactNode> = {
  users: (<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /></>),
  fichier: (<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
  megaphone: (<><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 11-5.8-1.6" /></>),
  eclair: (<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>),
};

function CarteStat({ stat }: { stat: { label: string; valeur: number; sous: string; icone: keyof typeof ICONES } }) {
  return (
    <div style={{ borderRadius: 18, padding: "18px 20px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <span style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 11, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.28)", marginBottom: 14 }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONES[stat.icone]}</svg>
      </span>
      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" }}>{stat.label}</p>
      <p style={{ fontSize: "2.1rem", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text)" }}>{stat.valeur}</p>
      <p style={{ fontSize: "0.74rem", marginTop: 6, color: "var(--text-3)" }}>{stat.sous}</p>
    </div>
  );
}

export default async function AdminSuivi() {
  const debutMois = debutDuMois();
  const [
    inscriptions, inscriptionsMois, dossiersGeneres, opportunitesEnLigne,
    generationsMois, aValider, sourcesActives, sourcesEnPanne, comptesSuspendus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: debutMois } } }),
    prisma.dossier.count({ where: { statut: { in: ["genere", "utilise", "soumis"] } } }),
    prisma.opportunite.count({ where: { statut: "publiee", actif: true } }),
    prisma.documentGenere.count({ where: { type: "cv", createdAt: { gte: debutMois } } }),
    prisma.opportunite.count({ where: { statut: { in: ["a_valider", "revue_manuelle"] } } }),
    prisma.fluxSource.count({ where: { actif: true } }),
    prisma.fluxSource.count({ where: { etat: "erreur" } }),
    prisma.user.count({ where: { suspendu: true } }),
  ]);

  const stats = [
    { label: "Inscriptions", valeur: inscriptions, sous: `+${inscriptionsMois} ce mois-ci`, icone: "users" as const },
    { label: "Dossiers générés", valeur: dossiersGeneres, sous: "CV + lettres créés", icone: "fichier" as const },
    { label: "Opportunités en ligne", valeur: opportunitesEnLigne, sous: `${aValider} en attente`, icone: "megaphone" as const },
    { label: "Générations ce mois", valeur: generationsMois, sous: "depuis le 1er", icone: "eclair" as const },
  ];

  return (
    <>
      <EnteteAdmin titre="Suivi & santé" sousTitre="Vue d'ensemble du produit" />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {stats.map((s) => <CarteStat key={s.label} stat={s} />)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/validation" style={{ textDecoration: "none" }}>
            <div style={{ borderRadius: 16, padding: 18, height: "100%", background: aValider > 0 ? "rgba(124,58,237,0.1)" : "var(--bg-card)", border: `1px solid ${aValider > 0 ? "rgba(124,58,237,0.3)" : "var(--border)"}` }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>File de validation</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: aValider > 0 ? "#a78bfa" : "var(--text)", margin: "4px 0" }}>{aValider}</p>
              <p style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>opportunité{aValider > 1 ? "s" : ""} à vérifier</p>
            </div>
          </Link>
          <Link href="/admin/sources" style={{ textDecoration: "none" }}>
            <div style={{ borderRadius: 16, padding: 18, height: "100%", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>Sources de flux</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", margin: "4px 0" }}>{sourcesActives}</p>
              <p style={{ fontSize: "0.74rem", color: sourcesEnPanne > 0 ? "#a78bfa" : "var(--text-3)" }}>{sourcesEnPanne > 0 ? `${sourcesEnPanne} en panne` : "actives"}</p>
            </div>
          </Link>
          <Link href="/admin/utilisateurs" style={{ textDecoration: "none" }}>
            <div style={{ borderRadius: 16, padding: 18, height: "100%", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>Comptes suspendus</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", margin: "4px 0" }}>{comptesSuspendus}</p>
              <p style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>sur {inscriptions} au total</p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
