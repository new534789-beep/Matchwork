"use client";

import { useState } from "react";

export type OppAValider = {
  id: string;
  intitule: string;
  organisme: string;
  type: string;
  description: string;
  source: string;
  lien: string | null;
  dateLimite: string | null;
  langueDetectee: string | null;
  statut: string;
  confianceDateLimite: number | null;
  sourceDateLimite: string | null;
  fluxSourceNom: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "Non précisée";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "Non précisée";
  }
}

/** YYYY-MM-DD pour préremplir un <input type="date"> (ou "" si absent). */
function pourInputDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function FileValidation({ initial }: { initial: OppAValider[] }) {
  const [liste, setListe] = useState(initial);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  // Date saisie à la main par l'admin pour les items « revue manuelle ».
  const [dates, setDates] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.map((o) => [o.id, pourInputDate(o.dateLimite)])),
  );

  async function traiter(id: string, action: "approuver" | "rejeter") {
    setEnCours(id);
    setErreur(null);
    try {
      // À l'approbation, on transmet la date saisie à la main (si présente).
      const dateLimite = action === "approuver" && dates[id] ? dates[id] : undefined;
      const res = await fetch(`/api/admin/opportunites/${id}/validation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, dateLimite }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErreur(d.erreur ?? "Erreur lors du traitement.");
        return;
      }
      setListe((prev) => prev.filter((o) => o.id !== id));
    } catch {
      setErreur("Erreur réseau.");
    } finally {
      setEnCours(null);
    }
  }

  if (liste.length === 0) {
    return (
      <div style={{ borderRadius: 18, padding: "48px 24px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 14px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p style={{ fontWeight: 700, color: "var(--text)" }}>File vide</p>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: 4 }}>Aucune opportunité en attente de validation.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {erreur && (
        <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: "0.82rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>{erreur}</div>
      )}
      {liste.map((o) => {
        const busy = enCours === o.id;
        const aRevoir = o.statut === "revue_manuelle";
        const confiancePct = o.confianceDateLimite != null ? Math.round(o.confianceDateLimite * 100) : null;
        return (
          <div key={o.id} style={{ borderRadius: 16, padding: 18, background: "var(--bg-card)", border: `1px solid ${aRevoir ? "rgba(245,158,11,0.4)" : "var(--border)"}` }}>
            {/* Bandeau « à vérifier » pour les dates absentes/incertaines */}
            {aRevoir && (
              <div className="flex items-center gap-2" style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <span style={{ fontSize: "0.78rem", color: "#fbbf24", fontWeight: 600 }}>
                  Date à vérifier — fixe la date limite à la main avant d'approuver
                  {confiancePct != null ? ` (confiance IA : ${confiancePct}%)` : " (aucune date détectée)"}
                </span>
              </div>
            )}

            <div className="flex items-start justify-between gap-3" style={{ marginBottom: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 6, color: "#a78bfa", background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.28)" }}>{o.type}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{o.fluxSourceNom ? `via ${o.fluxSourceNom}` : o.source}</span>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>{o.intitule}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-2)", marginTop: 2 }}>{o.organisme}</p>
              </div>
            </div>

            <p style={{ fontSize: "0.84rem", color: "var(--text-2)", lineHeight: 1.55, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{o.description}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1" style={{ fontSize: "0.76rem", color: "var(--text-3)", marginBottom: 14 }}>
              <span>Échéance : <span style={{ color: "var(--text-2)" }}>{formatDate(o.dateLimite)}</span></span>
              {o.sourceDateLimite && <span title={o.sourceDateLimite} style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Source date : <span style={{ color: "var(--text-2)" }}>{o.sourceDateLimite}</span></span>}
              {o.langueDetectee && <span>Langue : <span style={{ color: "var(--text-2)" }}>{o.langueDetectee}</span></span>}
              {o.lien && (
                <a href={o.lien} target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Lien source
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
              )}
            </div>

            {/* Saisie manuelle de la date limite (items à revoir) */}
            {aRevoir && (
              <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
                <label style={{ fontSize: "0.76rem", color: "var(--text-2)", fontWeight: 600 }}>Date limite :</label>
                <input
                  type="date"
                  value={dates[o.id] ?? ""}
                  onChange={(e) => setDates((prev) => ({ ...prev, [o.id]: e.target.value }))}
                  style={{ padding: "7px 10px", borderRadius: 9, fontSize: "0.82rem", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => traiter(o.id, "approuver")}
                disabled={busy}
                style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", cursor: busy ? "default" : "pointer", fontWeight: 600, fontSize: "0.85rem", color: "#fff", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {aRevoir ? "Fixer la date & approuver" : "Approuver"}
              </button>
              <button
                onClick={() => traiter(o.id, "rejeter")}
                disabled={busy}
                style={{ flex: 1, padding: "10px", borderRadius: 11, cursor: busy ? "default" : "pointer", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                Rejeter
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
