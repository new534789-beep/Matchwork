"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLES_PARAMETRES } from "@/lib/parametres-cles";

const labelStyle: React.CSSProperties = { fontSize: "0.84rem", fontWeight: 600, color: "var(--text)", marginBottom: 4, display: "block" };
const aideStyle: React.CSSProperties = { fontSize: "0.74rem", color: "var(--text-3)", marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: "0.9rem", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" };

export function FormParametres({
  valeurs,
  defauts,
}: {
  valeurs: Record<string, string>;
  defauts: Record<string, string>;
}) {
  const router = useRouter();
  const [v, setV] = useState(valeurs);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = (cle: string, val: string) => setV((p) => ({ ...p, [cle]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/parametres", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reglages: v }) });
      if (res.ok) { setMsg("Réglages enregistrés."); router.refresh(); }
      else setMsg("Erreur lors de l'enregistrement.");
    } catch {
      setMsg("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 20 }}>
      {msg && <div style={{ padding: "9px 13px", borderRadius: 10, fontSize: "0.82rem", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.28)", color: "#a78bfa" }}>{msg}</div>}

      <div>
        <label style={labelStyle}>Quota gratuit par défaut</label>
        <p style={aideStyle}>Nombre de générations offertes par mois. Vide = valeur d&apos;environnement ({defauts[CLES_PARAMETRES.quotaGratuitDefaut] || "3"}).</p>
        <input type="number" min={0} value={v[CLES_PARAMETRES.quotaGratuitDefaut] ?? ""} onChange={(e) => set(CLES_PARAMETRES.quotaGratuitDefaut, e.target.value)} placeholder={defauts[CLES_PARAMETRES.quotaGratuitDefaut] || "3"} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Fournisseur IA</label>
        <p style={aideStyle}>Indicatif. Par défaut : {defauts[CLES_PARAMETRES.fournisseurIa] || "mistral"}.</p>
        <input value={v[CLES_PARAMETRES.fournisseurIa] ?? ""} onChange={(e) => set(CLES_PARAMETRES.fournisseurIa, e.target.value)} placeholder={defauts[CLES_PARAMETRES.fournisseurIa] || "mistral"} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Fournisseur d&apos;envoi d&apos;e-mails</label>
        <p style={aideStyle}>Par défaut : {defauts[CLES_PARAMETRES.fournisseurEmail] || "(non configuré)"}.</p>
        <input value={v[CLES_PARAMETRES.fournisseurEmail] ?? ""} onChange={(e) => set(CLES_PARAMETRES.fournisseurEmail, e.target.value)} placeholder={defauts[CLES_PARAMETRES.fournisseurEmail] || "(non configuré)"} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Message d&apos;accueil</label>
        <p style={aideStyle}>Texte affichable sur la landing / l&apos;accueil.</p>
        <textarea value={v[CLES_PARAMETRES.texteAccueil] ?? ""} onChange={(e) => set(CLES_PARAMETRES.texteAccueil, e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Trouvez la bourse qui vous correspond…" />
      </div>

      <div>
        <button type="submit" disabled={busy} style={{ padding: "11px 22px", borderRadius: 11, border: "none", cursor: busy ? "default" : "pointer", fontWeight: 600, fontSize: "0.88rem", color: "#fff", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", opacity: busy ? 0.6 : 1 }}>Enregistrer les réglages</button>
      </div>
    </form>
  );
}
