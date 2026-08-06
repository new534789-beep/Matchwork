import { prisma } from "@/lib/prisma";
import { getUtilisateur } from "@/lib/session";

/**
 * Panneau « Activité » du tableau de bord, isolé dans sa propre frontière
 * Suspense : il ne doit jamais retarder l'affichage du haut de page. Sa
 * requête principale (tout l'historique d'interactions) est la plus lourde de
 * la page ; elle ne s'exécute que lorsque l'utilisateur ouvre cet onglet.
 */
export default async function PanneauActivite({ userId }: { userId: string }) {
  const [allInteractions, user, dossiers, documents] = await Promise.all([
    prisma.interaction.findMany({ where: { userId }, select: { decision: true } }),
    getUtilisateur(userId),
    prisma.dossier.count({ where: { userId } }),
    prisma.document.count({ where: { userId } }),
  ]);

  const totalVues = allInteractions.length;
  const totalInteresse = allInteractions.filter((i) => i.decision === "interesse").length;
  const totalIgnore = allInteractions.filter((i) => i.decision === "ignore").length;

  const carte: React.CSSProperties = { borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border)", padding: 20 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div style={carte}>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Vue d&apos;ensemble</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Offres consultées", valeur: totalVues, icone: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></> },
            { label: "Intéressé", valeur: totalInteresse, icone: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></> },
            { label: "Dossiers générés", valeur: dossiers, icone: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></> },
            { label: "Documents déposés", valeur: documents, icone: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></> },
          ].map((s) => (
            <div key={s.label} style={{ padding: "14px 12px", borderRadius: 14, background: "var(--bg)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.icone}</svg>
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{s.label}</span>
              </div>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>{s.valeur}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={carte}>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Taux d&apos;intérêt</p>
        {totalVues > 0 ? (
          <>
            <div className="flex items-center justify-center" style={{ padding: "10px 0 18px" }}>
              <div style={{ position: "relative", width: 120, height: 120 }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#7c3aed" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${Math.round((totalInteresse / totalVues) * 314)} 314`} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>{Math.round((totalInteresse / totalVues) * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6" style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
                Intéressé ({totalInteresse})
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
                Passé ({totalIgnore})
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "24px 12px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>Commencez à swiper pour voir vos statistiques</p>
          </div>
        )}

        <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: 2 }}>Membre depuis</p>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
