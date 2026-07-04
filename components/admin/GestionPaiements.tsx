"use client";

import { useState } from "react";

export type PaiementRow = { id: string; email: string; montant: number; fournisseur: string; statut: string; createdAt: string };
export type CompteRow = { id: string; email: string; plan: string; quota: number };

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function statutBadge(s: string) {
  if (["reussi", "confirme", "paye"].includes(s)) return { color: "#a78bfa", bg: "rgba(124,58,237,0.14)", border: "rgba(124,58,237,0.3)" };
  if (["echoue", "annule"].includes(s)) return { color: "#fca5a5", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
  return { color: "var(--text-3)", bg: "var(--bg)", border: "var(--border)" };
}

export function GestionPaiements({ paiements, comptes, quotaMax }: { paiements: PaiementRow[]; comptes: CompteRow[]; quotaMax: number }) {
  const [rows, setRows] = useState(comptes);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const visibles = rows.filter((c) => c.email.toLowerCase().includes(q.trim().toLowerCase()));

  async function changerPlan(c: CompteRow, plan: string) {
    setBusy(c.id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/utilisateurs/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      if (res.ok) { setRows((p) => p.map((r) => (r.id === c.id ? { ...r, plan } : r))); setMsg(`Plan de ${c.email} → ${plan}.`); }
    } finally {
      setBusy(null);
    }
  }

  async function enregistrerQuota(c: CompteRow, valeur: number) {
    setBusy(c.id);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/quotas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: c.id, generationsUtilisees: valeur }) });
      if (res.ok) { setRows((p) => p.map((r) => (r.id === c.id ? { ...r, quota: valeur } : r))); setMsg(`Quota de ${c.email} ajusté à ${valeur}.`); }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Transactions */}
      <section>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Transactions (mobile money)</h2>
        {paiements.length === 0 ? (
          <div style={{ borderRadius: 14, padding: "28px 20px", textAlign: "center", color: "var(--text-3)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>Aucune transaction pour le moment.</div>
        ) : (
          <div style={{ borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
            {paiements.map((p, i) => {
              const sb = statutBadge(p.statut);
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: "var(--bg-card)", borderTop: i === 0 ? "none" : "1px solid var(--border)", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)" }}>{p.email}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{fmt(p.createdAt)} · {p.fournisseur}</p>
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{p.montant.toLocaleString("fr-FR")} F</span>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 9px", borderRadius: 6, color: sb.color, background: sb.bg, border: `1px solid ${sb.border}` }}>{p.statut}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Plans & quotas */}
      <section>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Plans & quotas</h2>
        <p style={{ fontSize: "0.76rem", color: "var(--text-3)", marginBottom: 10 }}>Quota gratuit du mois : {quotaMax} générations.</p>
        {msg && <div style={{ padding: "8px 12px", borderRadius: 9, fontSize: "0.8rem", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.28)", color: "#a78bfa", marginBottom: 10 }}>{msg}</div>}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par e-mail…" style={{ width: "100%", maxWidth: 360, padding: "9px 12px", borderRadius: 10, fontSize: "0.86rem", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", marginBottom: 12 }} />
        <div className="flex flex-col gap-2">
          {visibles.map((c) => (
            <CompteLigne key={c.id} compte={c} quotaMax={quotaMax} busy={busy === c.id} onPlan={(plan) => changerPlan(c, plan)} onQuota={(v) => enregistrerQuota(c, v)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CompteLigne({ compte, quotaMax, busy, onPlan, onQuota }: { compte: CompteRow; quotaMax: number; busy: boolean; onPlan: (p: string) => void; onQuota: (v: number) => void }) {
  const [val, setVal] = useState(String(compte.quota));
  return (
    <div style={{ borderRadius: 12, padding: "11px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span style={{ flex: 1, minWidth: 160, fontSize: "0.84rem", fontWeight: 600, color: "var(--text)" }}>{compte.email}</span>
      <select value={compte.plan} onChange={(e) => onPlan(e.target.value)} disabled={busy} style={{ padding: "7px 10px", borderRadius: 9, fontSize: "0.8rem", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
        <option value="gratuit">gratuit</option>
        <option value="payant">payant</option>
      </select>
      <div className="flex items-center gap-1.5">
        <input type="number" min={0} value={val} onChange={(e) => setVal(e.target.value)} style={{ width: 64, padding: "7px 9px", borderRadius: 9, fontSize: "0.8rem", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
        <span style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>/ {quotaMax}</span>
        <button onClick={() => onQuota(Math.max(0, parseInt(val || "0", 10)))} disabled={busy} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "#fff", background: "#7c3aed", border: "none", cursor: "pointer", opacity: busy ? 0.6 : 1 }}>OK</button>
      </div>
    </div>
  );
}
