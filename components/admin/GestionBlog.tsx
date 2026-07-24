"use client";

import { useState } from "react";
import Link from "next/link";

export type ArticleRow = {
  id: string;
  slug: string;
  titre: string;
  categorie: string | null;
  statut: string;
  publieLe: string;
  opportuniteIntitule: string | null;
};

const LABEL_CATEGORIE: Record<string, string> = {
  actualite: "Actualité",
  bourses: "Bourses",
  candidature: "Candidature",
  emploi: "Emploi",
  projets: "Appels à projets",
};

const FILTRES = [
  { id: "toutes", label: "Toutes" },
  { id: "publie", label: "Publiés" },
  { id: "archive", label: "Archivés" },
];

export function GestionBlog({ initial }: { initial: ArticleRow[] }) {
  const [rows, setRows] = useState(initial);
  const [filtre, setFiltre] = useState("toutes");
  const [busy, setBusy] = useState<string | null>(null);

  const visibles = rows.filter((a) => filtre === "toutes" || a.statut === filtre);

  async function patch(id: string, data: Record<string, unknown>) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) setRows((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } as ArticleRow : a)));
    } finally {
      setBusy(null);
    }
  }

  async function supprimer(id: string) {
    if (!confirm("Supprimer définitivement cet article ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) setRows((prev) => prev.filter((a) => a.id !== id));
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
        <div style={{ borderRadius: 16, padding: "40px 20px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)" }}>Aucun article dans cette vue.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibles.map((a) => {
            const publie = a.statut === "publie";
            return (
              <div key={a.id} style={{ borderRadius: 13, padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "1px 7px", borderRadius: 5, color: "var(--text-3)", background: "var(--bg)", border: "1px solid var(--border)" }}>{LABEL_CATEGORIE[a.categorie ?? "actualite"] ?? a.categorie}</span>
                    <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, color: publie ? "#a78bfa" : "var(--text-3)", background: publie ? "rgba(124,58,237,0.14)" : "var(--bg)", border: `1px solid ${publie ? "rgba(124,58,237,0.32)" : "var(--border)"}` }}>{publie ? "Publié" : "Archivé"}</span>
                  </div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titre}</p>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: 1 }}>
                    {new Date(a.publieLe).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {a.opportuniteIntitule ? ` · généré depuis « ${a.opportuniteIntitule} »` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
                  <Link href={`/blog/${a.slug}`} target="_blank" style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", textDecoration: "none" }}>Voir</Link>
                  {publie ? (
                    <button onClick={() => patch(a.id, { statut: "archive" })} disabled={busy === a.id} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer" }}>Dépublier</button>
                  ) : (
                    <button onClick={() => patch(a.id, { statut: "publie" })} disabled={busy === a.id} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "#fff", background: "#7c3aed", border: "none", cursor: "pointer" }}>Republier</button>
                  )}
                  <button onClick={() => supprimer(a.id)} disabled={busy === a.id} title="Supprimer" style={{ padding: "7px 9px", borderRadius: 9, color: "#fca5a5", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center" }}>
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
