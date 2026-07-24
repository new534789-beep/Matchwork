import Link from "next/link";
import { etapesDossier, type EtapeStatut, type EtapesDossierProps } from "@/lib/dossier-etapes";

const V = "#7c3aed";

function Puce({ statut }: { statut: EtapeStatut }) {
  if (statut === "fait") {
    return (
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: V, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
    );
  }
  if (statut === "en_cours") {
    return (
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${V}`, background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: V }} />
      </div>
    );
  }
  if (statut === "verrouille") {
    return (
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
      </div>
    );
  }
  return <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid var(--border)", background: "var(--bg-card)", flexShrink: 0 }} />;
}

export function TimelineDossier(props: EtapesDossierProps) {
  const etapes = etapesDossier(props);

  return (
    <div style={{ borderRadius: 14, padding: "16px 18px", marginBottom: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 14 }}>
        Suivi de candidature
      </p>
      <div>
        {etapes.map((e, i) => (
          <div key={e.label} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Puce statut={e.statut} />
              {i < etapes.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 22, background: e.statut === "fait" ? V : "var(--border)", opacity: e.statut === "fait" ? 0.5 : 1 }} />
              )}
            </div>
            <div style={{ paddingBottom: i < etapes.length - 1 ? 16 : 0 }}>
              <p style={{
                fontSize: "0.84rem", fontWeight: 600, lineHeight: 1.3,
                color: e.statut === "a_venir" || e.statut === "verrouille" ? "var(--text-3)" : "var(--text)",
              }}>
                {e.label}
              </p>
              {e.sousTexte && (
                <p style={{ fontSize: "0.72rem", color: e.statut === "verrouille" ? V : "var(--text-3)", marginTop: 2 }}>
                  {e.statut === "verrouille" ? (
                    <Link href="/compte" style={{ color: V, textDecoration: "underline" }}>{e.sousTexte} — passer Pro →</Link>
                  ) : e.sousTexte}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
