"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TYPES_OPP, LABEL_TYPE } from "@/lib/opportunites";

export type SourceRow = {
  id: string;
  nom: string;
  url: string;
  type: string;
  categorie: string;
  actif: boolean;
  etat: string;
  dernierFetch: string | null;
};

const inputStyle: React.CSSProperties = {
  padding: "9px 11px", borderRadius: 9, fontSize: "0.85rem",
  background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)",
};

function etatBadge(etat: string) {
  if (etat === "ok") return { label: "Fonctionne", color: "#a78bfa", bg: "rgba(124,58,237,0.14)", border: "rgba(124,58,237,0.32)" };
  if (etat === "panne") return { label: "En panne", color: "#fca5a5", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
  return { label: "Inconnu", color: "var(--text-3)", bg: "var(--bg)", border: "var(--border)" };
}

function fmtFetch(iso: string | null) {
  if (!iso) return "jamais";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

type RapportDetail = { source: string; etat: "ok" | "panne"; creees: number; erreur?: string };
type Rapport = {
  creees: number; enrichies: number; doublons: number; sourcesEnPanne: number;
  aValider: number; revueManuelle: number; rejetees: number;
  details: RapportDetail[];
};

export function GestionSources({ initial }: { initial: SourceRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [nom, setNom] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("rss");
  const [categorie, setCategorie] = useState("BOURSE");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [ingest, setIngest] = useState(false);
  const [resultat, setResultat] = useState<string | null>(null);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom, url, type, categorie }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(d.erreur ?? "Erreur."); return; }
      setRows((prev) => [...prev, d.source]);
      setNom(""); setUrl(""); setType("rss"); setCategorie("BOURSE");
    } finally {
      setBusy(false);
    }
  }

  async function recupererMaintenant() {
    if (ingest) return;
    setIngest(true);
    setResultat(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/ingestion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; rapport?: Rapport; expirees?: number; erreur?: string };
      if (!res.ok || !d.ok) { setErr(d.erreur ?? "Échec de l'ingestion."); return; }
      const r = d.rapport;
      if (r) {
        setResultat(`${r.aValider} prête(s) à valider · ${r.revueManuelle} à revoir (date à fixer) · ${r.rejetees} déjà close(s) écartée(s) · ${r.doublons} doublon(s) ignoré(s) · ${r.sourcesEnPanne} source(s) en panne${typeof d.expirees === "number" ? ` · ${d.expirees} expirée(s) retirée(s)` : ""}.`);
        const now = new Date().toISOString();
        setRows((prev) => prev.map((row) => {
          const det = r.details.find((x) => x.source === row.nom);
          return det ? { ...row, etat: det.etat, dernierFetch: now } : row;
        }));
        router.refresh();
      }
    } catch {
      setErr("Erreur réseau pendant l'ingestion.");
    } finally {
      setIngest(false);
    }
  }

  async function toggle(s: SourceRow) {
    const res = await fetch(`/api/admin/sources/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actif: !s.actif }) });
    if (res.ok) setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, actif: !r.actif } : r)));
  }

  function lancerEdition(s: SourceRow) {
    setEditId(s.id); setEditNom(s.nom); setEditUrl(s.url);
  }

  async function enregistrer(id: string) {
    const res = await fetch(`/api/admin/sources/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom: editNom, url: editUrl }) });
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, nom: editNom, url: editUrl } : r)));
      setEditId(null);
    }
  }

  async function supprimer(id: string) {
    if (!confirm("Supprimer cette source ?")) return;
    const res = await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const nbActives = rows.filter((r) => r.actif).length;

  return (
    <div>
      {/* Barre d'action : récupérer maintenant */}
      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>{nbActives} source(s) active(s)</p>
        <button onClick={recupererMaintenant} disabled={ingest || nbActives === 0} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 11, border: "none", cursor: ingest || nbActives === 0 ? "default" : "pointer", fontWeight: 600, fontSize: "0.85rem", color: "#fff", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", opacity: ingest || nbActives === 0 ? 0.55 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ingest ? { animation: "spin 1s linear infinite" } : undefined}>
            <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          {ingest ? "Récupération…" : "Récupérer maintenant"}
        </button>
      </div>

      {resultat && (
        <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: "0.82rem", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.28)", color: "#a78bfa", marginBottom: 14 }}>
          {resultat} <a href="/admin/validation" style={{ color: "#a78bfa", fontWeight: 700 }}>Voir la file de validation →</a>
        </div>
      )}
      {err && <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: "0.82rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", marginBottom: 14 }}>{err}</div>}

      {/* Ajout */}
      <form onSubmit={ajouter} style={{ borderRadius: 14, padding: 16, background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 18 }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Ajouter une source</p>
        <div className="flex gap-2 flex-wrap" style={{ alignItems: "center" }}>
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom (ex. DAAD)" style={{ ...inputStyle, flex: "1 1 150px" }} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL du flux RSS, ou page liste à scraper" style={{ ...inputStyle, flex: "2 1 220px" }} />
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} style={inputStyle} title="Catégorie d'opportunités">
            {TYPES_OPP.map((t) => <option key={t} value={t}>{LABEL_TYPE[t]}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle} title="Mode de récupération">
            <option value="rss">RSS</option>
            <option value="xml">XML</option>
            <option value="scrape">Scraping</option>
          </select>
          <button type="submit" disabled={busy} style={{ padding: "9px 18px", borderRadius: 9, border: "none", cursor: busy ? "default" : "pointer", fontWeight: 600, fontSize: "0.84rem", color: "#fff", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", opacity: busy ? 0.6 : 1 }}>Ajouter</button>
        </div>
      </form>

      {/* Aide Google Alerts — couverture web quasi illimitée */}
      <details style={{ borderRadius: 14, padding: "12px 16px", marginBottom: 18, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <summary style={{ cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>
          Ajouter un flux Google Alerts (couverture web illimitée)
        </summary>
        <div style={{ marginTop: 10, fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.6 }}>
          <p>Sur <a href="https://www.google.com/alerts" target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa" }}>google.com/alerts</a>, crée une alerte par mot-clé → « Diffuser vers » = <strong style={{ color: "var(--text)" }}>Flux</strong> → colle l&apos;URL RSS ci-dessus (mode <strong style={{ color: "var(--text)" }}>RSS</strong>). Chaque mot-clé couvre tout le web.</p>
          <p style={{ marginTop: 8, fontWeight: 600, color: "var(--text)" }}>Mots-clés recommandés :</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {["bourse d'études Afrique francophone", "bourse master Bénin", "bourse doctorat Afrique", "bourse entièrement financée 2026", "appel à candidatures bourse Afrique", "concours fonction publique Bénin", "recrutement Cotonou", "offre d'emploi Bénin", "stage rémunéré Cotonou", "fellowship jeunes Africains", "programme jeunes leaders Afrique", "subvention projet jeunes Afrique"].map((m) => (
              <span key={m} style={{ fontSize: "0.72rem", padding: "3px 9px", borderRadius: 999, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>{m}</span>
            ))}
          </div>
          <p style={{ marginTop: 8, color: "var(--text-3)" }}>Astuce : cible un site précis avec <code>site:</code> — ex. <code>site:gouv.bj concours</code>.</p>
        </div>
      </details>

      {rows.length === 0 ? (
        <div style={{ borderRadius: 14, padding: "36px 20px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)" }}>Aucune source pour le moment.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((s) => {
            const eb = etatBadge(s.etat);
            const enEdition = editId === s.id;
            return (
              <div key={s.id} style={{ borderRadius: 12, padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", opacity: s.actif ? 1 : 0.6 }}>
                {enEdition ? (
                  <div className="flex gap-2 flex-wrap" style={{ flex: 1, minWidth: 220 }}>
                    <input value={editNom} onChange={(e) => setEditNom(e.target.value)} style={{ ...inputStyle, flex: "1 1 140px" }} />
                    <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} style={{ ...inputStyle, flex: "2 1 220px" }} />
                  </div>
                ) : (
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>{s.nom}</span>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", padding: "1px 6px", borderRadius: 5, color: "#a78bfa", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}>{LABEL_TYPE[s.categorie] ?? s.categorie}</span>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", padding: "1px 6px", borderRadius: 5, color: "var(--text-3)", background: "var(--bg)", border: "1px solid var(--border)" }}>{s.type}</span>
                      <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, color: eb.color, background: eb.bg, border: `1px solid ${eb.border}` }}>{eb.label}</span>
                    </div>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.url}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: 1 }}>Dernier fetch : {fmtFetch(s.dernierFetch)}</p>
                  </div>
                )}
                <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
                  {enEdition ? (
                    <>
                      <button onClick={() => enregistrer(s.id)} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "#fff", background: "#7c3aed", border: "none", cursor: "pointer" }}>Enregistrer</button>
                      <button onClick={() => setEditId(null)} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer" }}>Annuler</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => lancerEdition(s)} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer" }}>Modifier</button>
                      <button onClick={() => toggle(s)} style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer" }}>{s.actif ? "Désactiver" : "Activer"}</button>
                      <button onClick={() => supprimer(s.id)} title="Supprimer" style={{ padding: "7px 9px", borderRadius: 9, color: "#fca5a5", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
