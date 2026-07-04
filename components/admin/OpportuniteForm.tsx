"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TYPES_OPP, LABEL_TYPE } from "@/lib/opportunites";

type Valeurs = {
  type: string;
  organisme: string;
  intitule: string;
  description: string;
  dateLimite: string;
  lien: string;
  conditions: string;
  exigenceLangue: string;
  langueDetectee: string;
};

const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)", marginBottom: 6, display: "block" };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: "0.9rem",
  background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)",
};

export function OpportuniteForm({ mode, id, initial }: { mode: "create" | "edit"; id?: string; initial?: Partial<Valeurs> }) {
  const router = useRouter();
  const [v, setV] = useState<Valeurs>({
    type: initial?.type ?? "BOURSE",
    organisme: initial?.organisme ?? "",
    intitule: initial?.intitule ?? "",
    description: initial?.description ?? "",
    dateLimite: initial?.dateLimite ?? "",
    lien: initial?.lien ?? "",
    conditions: initial?.conditions ?? "",
    exigenceLangue: initial?.exigenceLangue ?? "",
    langueDetectee: initial?.langueDetectee ?? "fr",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof Valeurs>(k: K, val: string) => setV((p) => ({ ...p, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const url = mode === "create" ? "/api/admin/opportunites" : `/api/admin/opportunites/${id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.erreur ?? "Erreur lors de l'enregistrement.");
        return;
      }
      router.push("/admin/opportunites");
      router.refresh();
    } catch {
      setErr("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 16 }}>
      {err && (
        <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: "0.82rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>{err}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Type</label>
          <select value={v.type} onChange={(e) => set("type", e.target.value)} style={inputStyle}>
            {TYPES_OPP.map((t) => <option key={t} value={t}>{LABEL_TYPE[t]}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Organisme *</label>
          <input value={v.organisme} onChange={(e) => set("organisme", e.target.value)} style={inputStyle} placeholder="Ex. Fondation X" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Intitulé *</label>
        <input value={v.intitule} onChange={(e) => set("intitule", e.target.value)} style={inputStyle} placeholder="Ex. Bourse de master 2026" />
      </div>

      <div>
        <label style={labelStyle}>Description *</label>
        <textarea value={v.description} onChange={(e) => set("description", e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="Détails de l'opportunité…" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Date limite</label>
          <input type="date" value={v.dateLimite} onChange={(e) => set("dateLimite", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Lien source</label>
          <input value={v.lien} onChange={(e) => set("lien", e.target.value)} style={inputStyle} placeholder="https://…" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Langue du dossier</label>
          <input value={v.langueDetectee} onChange={(e) => set("langueDetectee", e.target.value)} style={inputStyle} placeholder="fr" />
        </div>
        <div>
          <label style={labelStyle}>Exigence de langue</label>
          <input value={v.exigenceLangue} onChange={(e) => set("exigenceLangue", e.target.value)} style={inputStyle} placeholder="Ex. Français B2" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Conditions</label>
        <textarea value={v.conditions} onChange={(e) => set("conditions", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Conditions d'éligibilité…" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} style={{ padding: "11px 22px", borderRadius: 11, border: "none", cursor: busy ? "default" : "pointer", fontWeight: 600, fontSize: "0.88rem", color: "#fff", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", opacity: busy ? 0.6 : 1 }}>
          {mode === "create" ? "Publier l'opportunité" : "Enregistrer"}
        </button>
        <button type="button" onClick={() => router.push("/admin/opportunites")} style={{ padding: "11px 18px", borderRadius: 11, cursor: "pointer", fontWeight: 600, fontSize: "0.88rem", color: "var(--text-2)", background: "transparent", border: "1px solid var(--border)" }}>
          Annuler
        </button>
      </div>
    </form>
  );
}
