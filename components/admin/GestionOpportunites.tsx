"use client";

import { useState } from "react";
import Link from "next/link";
import { LABEL_TYPE, LABEL_STATUT } from "@/lib/opportunites";

export type OppRow = {
  id: string;
  intitule: string;
  organisme: string;
  type: string;
  statut: string;
  actif: boolean;
  dateLimite: string | null;
  source: string;
};

function joursAvant(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

const FILTRES = [
  { id: "toutes", label: "Toutes" },
  { id: "publiee", label: "Publiées" },
  { id: "a_valider", label: "À valider" },
  { id: "expiree", label: "Expirées" },
  { id: "rejetee", label: "Rejetées" },
  { id: "retirees", label: "Retirées" },
];

function badgeStatut(o: OppRow): { label: string; bg: string; color: string; border: string } {
  if (!o.actif && o.statut === "publiee") return { label: "Retirée", bg: "var(--bg)", color: "var(--text-3)", border: "var(--border)" };
  if (o.statut === "publiee") return { label: "Publiée", bg: "rgba(124,58,237,0.14)", color: "#a78bfa", border: "rgba(124,58,237,0.32)" };
  if (o.statut === "a_valider") return { label: "À valider", bg: "rgba(124,58,237,0.08)", color: "#a78bfa", border: "rgba(124,58,237,0.25)" };
  return { label: LABEL_STATUT[o.statut] ?? o.statut, bg: "var(--bg)", color: "var(--text-3)", border: "var(--border)" };
}

export function GestionOpportunites({ initial }: { initial: OppRow[] }) {
  const [rows, setRows] = useState(initial);
  const [filtre, setFiltre] = useState("toutes");
  const [busy, setBusy] = useState<string | null>(null);

  const visibles = rows.filter((o) => {
    if (filtre === "toutes") return true;
    if (filtre === "retirees") return !o.actif;
    if (filtre === "publiee") return o.statut === "publiee" && o.actif;
    return o.statut === filtre;
  });

  async function patch(id: string, data: Record<string, unknown>) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/opportunites/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) setRows((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } as OppRow : o)));
    } finally {
      setBusy(null);
    }
  }

  async function supprimer(id: string) {
    if (!confirm("Supprimer définitivement cette opportunité ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/opportunites/${id}`, { method: "DELETE" });
      if (res.ok) setRows((prev) => prev.filter((o) => o.id !== id));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, padding: 6, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 16, overflowX: "auto" }}>
        {FILTRES.map((f) => {
          const a = filtre === f.id;
          return (
            <button key={f.id} onClick={() => setFiltre(f.id)} style={{ padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: "0.82rem", fontWeight: 600, background: a ? "#7c3aed" : "transparent", color: a ? "#fff" : "var(--text-2)", boxShadow: a ? "0 4px 12px rgba(124,58,237,0.35)" : undefined }}>{f.label}</button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <div style={{ borderRadius: 16, padding: "40px 20px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)" }}>Aucune opportunité dans cette vue.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibles.map((o) => {
            const j = joursAvant(o.dateLimite);
            const expireBientot = o.actif && o.statut === "publiee" && j !== null && j >= 0 && j <= 14;
            const sb = badgeStatut(o);
            return (
              <div key={o.id} style={{ borderRadius: 13, padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "1px 7px", borderRadius: 5, color: "var(--text-3)", background: "var(--bg)", border: "1px solid var(--border)" }}>{LABEL_TYPE[o.type] ?? o.type}</span>
                    <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, color: sb.color, background: sb.bg, border: `1px solid ${sb.border}` }}>{sb.label}</span>
                    {expireBientot && <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, color: "#a78bfa", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}>Expire dans {j} j</span>}
                  </div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.intitule}</p>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: 1 }}>{o.organisme} · {o.source}</p>
                </div>
                <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
                  <Link href={`/admin/opportunites/${o.id}/modifier`} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", textDecoration: "none" }}>Modifier</Link>
                  {o.actif ? (
                    <button onClick={() => patch(o.id, { actif: false })} disabled={busy === o.id} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer" }}>Retirer</button>
                  ) : (
                    <button onClick={() => patch(o.id, { actif: true, statut: "publiee" })} disabled={busy === o.id} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "#fff", background: "#7c3aed", border: "none", cursor: "pointer" }}>Remettre</button>
                  )}
                  <button onClick={() => supprimer(o.id)} disabled={busy === o.id} title="Supprimer" style={{ padding: "7px 9px", borderRadius: 9, color: "#fca5a5", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
