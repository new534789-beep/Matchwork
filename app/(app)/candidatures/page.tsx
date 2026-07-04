import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnteteApp } from "@/components/navigation/EnteteApp";

function statutLabel(s: string) {
  if (s === "genere" || s === "GENERE") return "Généré";
  if (s === "utilise" || s === "soumis" || s === "SOUMIS") return "Utilisé";
  return "En préparation";
}

function statutCouleur(s: string) {
  if (s === "genere" || s === "GENERE") return { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)", color: "#a78bfa" };
  if (s === "utilise" || s === "soumis" || s === "SOUMIS") return { bg: "#7c3aed", border: "#7c3aed", color: "#fff" };
  return { bg: "var(--bg-card)", border: "var(--border)", color: "var(--text-3)" };
}

function deadlineBadge(dateLimite: Date | null) {
  if (!dateLimite) return null;
  const jours = Math.ceil((dateLimite.getTime() - Date.now()) / 86400000);
  if (jours < 0) return { label: "Expirée", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
  if (jours === 0) return { label: "Aujourd'hui !", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
  if (jours <= 7) return { label: `J-${jours}`, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" };
  if (jours <= 30) return { label: `J-${jours}`, color: "#d97706", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)" };
  return { label: `J-${jours}`, color: "var(--text-3)", bg: "var(--bg-card)", border: "var(--border)" };
}

export default async function Candidatures() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const dossiers = await prisma.dossier.findMany({
    where: { userId: session.user.id },
    include: {
      opportunite: {
        select: { intitule: true, organisme: true, dateLimite: true },
      },
    },
  });

  // Tri : deadline la plus proche d'abord, null en dernier
  dossiers.sort((a, b) => {
    const da = a.opportunite.dateLimite;
    const db = b.opportunite.dateLimite;
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.getTime() - db.getTime();
  });

  return (
    <>
      <EnteteApp titre="Mes candidatures" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">

        {dossiers.length === 0 ? (
          <div style={{
            borderRadius: 20, padding: "40px 24px", textAlign: "center",
            background: "var(--bg-card)", border: "1px solid var(--border)",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
            }}>
              <svg className="w-7 h-7" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>Aucun dossier généré</p>
            <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
              Swipez une bourse et générez votre dossier en un clic.
            </p>
            <Link href="/opportunites" style={{
              display: "inline-flex", alignItems: "center", padding: "10px 22px", borderRadius: 12,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff",
              fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
            }}>
              Voir les bourses
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
            {dossiers.map((d) => {
              const c = statutCouleur(d.statut);
              const badge = deadlineBadge(d.opportunite.dateLimite);
              return (
                <Link key={d.id} href={`/dossiers/${d.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    borderRadius: 16, padding: "14px 16px",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 13,
                    transition: "border-color 0.18s ease",
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(91,33,182,0.15))",
                      border: "1px solid rgba(124,58,237,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", fontWeight: 700, color: "#a78bfa",
                    }}>
                      {d.opportunite.organisme.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "0.875rem", fontWeight: 600, color: "var(--text)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {d.opportunite.intitule}
                      </p>
                      <p style={{ fontSize: "0.73rem", color: "var(--text-3)", marginTop: 2 }}>
                        {d.opportunite.organisme}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 600,
                        padding: "3px 9px", borderRadius: 6,
                        background: c.bg, border: `1px solid ${c.border}`, color: c.color,
                      }}>
                        {statutLabel(d.statut)}
                      </span>
                      {badge && (
                        <span style={{
                          fontSize: "0.68rem", fontWeight: 700,
                          padding: "2px 8px", borderRadius: 5,
                          background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
                        }}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
