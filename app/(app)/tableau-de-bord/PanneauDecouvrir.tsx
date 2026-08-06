import Link from "next/link";
import { prisma } from "@/lib/prisma";

function joursRestants(date: Date | null): number | null {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

/**
 * Bloc « Suggestions pour vous » du tableau de bord, isolé dans sa propre
 * frontière Suspense : la liste des bourses non encore swipées ne doit pas
 * retarder l'affichage des statistiques principales.
 */
export default async function PanneauDecouvrir({ userId }: { userId: string }) {
  const suggestions = await prisma.opportunite.findMany({
    where: { type: "BOURSE", actif: true, statut: "publiee", interactions: { none: { userId } } },
    orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
    take: 4,
    select: { id: true, intitule: true, organisme: true, dateLimite: true },
  });

  if (suggestions.length === 0) {
    return <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Aucune nouvelle suggestion pour le moment.</p>;
  }

  return (
    <>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Suggestions pour vous</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((s) => {
          const jours = joursRestants(s.dateLimite);
          return (
            <Link key={s.id} href={`/opportunites/${s.id}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 11, background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{s.organisme.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.intitule}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{s.organisme}</p>
                </div>
                {jours !== null && jours >= 0 && <span style={{ fontSize: "0.68rem", color: jours <= 7 ? "#a78bfa" : "var(--text-3)", whiteSpace: "nowrap" }}>J-{jours}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
