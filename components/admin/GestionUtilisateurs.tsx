"use client";

import { useState } from "react";

export type UserRow = {
  id: string;
  email: string;
  plan: string;
  role: string;
  suspendu: boolean;
  createdAt: string;
  nbDossiers: number;
  nbDocuments: number;
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export function GestionUtilisateurs({ initial }: { initial: UserRow[] }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const visibles = rows.filter((u) => u.email.toLowerCase().includes(q.trim().toLowerCase()));

  async function toggle(u: UserRow) {
    setBusy(u.id);
    try {
      const res = await fetch(`/api/admin/utilisateurs/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ suspendu: !u.suspendu }) });
      if (res.ok) setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, suspendu: !r.suspendu } : r)));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par e-mail…" style={{ width: "100%", maxWidth: 360, padding: "9px 12px", borderRadius: 10, fontSize: "0.86rem", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", marginBottom: 16 }} />

      <div style={{ borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
        {visibles.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-3)", background: "var(--bg-card)" }}>Aucun utilisateur.</div>
        ) : (
          visibles.map((u, i) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-card)", borderTop: i === 0 ? "none" : "1px solid var(--border)", flexWrap: "wrap", opacity: u.suspendu ? 0.6 : 1 }}>
              <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>{(u.email[0] || "U").toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text)" }}>{u.email}</span>
                  {u.role === "admin" && <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", padding: "1px 7px", borderRadius: 5, color: "#a78bfa", background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)" }}>Admin</span>}
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", padding: "1px 7px", borderRadius: 5, color: "var(--text-3)", background: "var(--bg)", border: "1px solid var(--border)" }}>{u.plan}</span>
                  {u.suspendu && <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", padding: "1px 7px", borderRadius: 5, color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>Suspendu</span>}
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>Inscrit le {fmt(u.createdAt)} · {u.nbDossiers} dossier{u.nbDossiers > 1 ? "s" : ""} · {u.nbDocuments} document{u.nbDocuments > 1 ? "s" : ""}</p>
              </div>
              {u.role !== "admin" && (
                <button onClick={() => toggle(u)} disabled={busy === u.id} style={{ padding: "7px 14px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", flexShrink: 0, color: u.suspendu ? "#fff" : "var(--text-2)", background: u.suspendu ? "#7c3aed" : "var(--bg)", border: u.suspendu ? "none" : "1px solid var(--border)" }}>{u.suspendu ? "Réactiver" : "Suspendre"}</button>
              )}
            </div>
          ))
        )}
      </div>

      <p style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: 12 }}>
        Confidentialité : seuls des compteurs sont affichés. Le contenu des coffres-forts (CV, diplômes, pièces) n&apos;est jamais accessible depuis l&apos;admin.
      </p>
    </div>
  );
}
