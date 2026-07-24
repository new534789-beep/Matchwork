"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProfilResume = { id: string; nom: string; actif: boolean; complete: boolean; nomComplet: string | null };

const V = "#7c3aed";

/**
 * Sélecteur de profils multiples (Pro) — permet de créer plusieurs profils
 * complets (ex. "Génie civil", "Comptabilité") et de basculer celui utilisé
 * pour le fil, le contrôle de compatibilité et la génération de dossier.
 */
export function SelecteurProfils() {
  const router = useRouter();
  const [profils, setProfils] = useState<ProfilResume[] | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);
  const [nomNouveau, setNomNouveau] = useState("");
  const [renommer, setRenommer] = useState<string | null>(null);
  const [nomRenomme, setNomRenomme] = useState("");

  async function charger() {
    const res = await fetch("/api/profils");
    if (res.ok) {
      const data = (await res.json()) as { profils: ProfilResume[] };
      setProfils(data.profils);
    }
  }

  useEffect(() => { void charger(); }, []);

  async function activer(id: string) {
    if (enCours) return;
    setEnCours(true); setErreur(null);
    try {
      const res = await fetch(`/api/profils/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actif: true }),
      });
      if (!res.ok) { setErreur("Impossible de changer de profil."); return; }
      await charger();
      router.refresh();
    } finally { setEnCours(false); }
  }

  async function creer() {
    if (!nomNouveau.trim() || enCours) return;
    setEnCours(true); setErreur(null);
    try {
      const res = await fetch("/api/profils", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom: nomNouveau.trim() }),
      });
      const data = (await res.json()) as { erreur?: string };
      if (!res.ok) { setErreur(data.erreur ?? "Impossible de créer le profil."); return; }
      setNomNouveau(""); setCreation(false);
      await charger();
    } finally { setEnCours(false); }
  }

  async function renommerProfil(id: string) {
    if (!nomRenomme.trim() || enCours) return;
    setEnCours(true); setErreur(null);
    try {
      const res = await fetch(`/api/profils/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom: nomRenomme.trim() }),
      });
      if (!res.ok) { setErreur("Impossible de renommer le profil."); return; }
      setRenommer(null);
      await charger();
    } finally { setEnCours(false); }
  }

  async function supprimer(id: string) {
    if (enCours) return;
    if (!confirm("Supprimer ce profil ? Cette action est irréversible.")) return;
    setEnCours(true); setErreur(null);
    try {
      const res = await fetch(`/api/profils/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { erreur?: string };
      if (!res.ok) { setErreur(data.erreur ?? "Impossible de supprimer ce profil."); return; }
      await charger();
      router.refresh();
    } finally { setEnCours(false); }
  }

  if (!profils) return null;

  return (
    <div style={{ borderRadius: 14, padding: "14px 18px", marginBottom: 18, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)" }}>
          Mes profils
        </span>
        {!creation && profils.length < 5 && (
          <button onClick={() => setCreation(true)} style={{ fontSize: "0.76rem", fontWeight: 600, color: V, background: "none", border: "none", cursor: "pointer" }}>
            + Nouveau profil
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {profils.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: p.actif ? "rgba(124,58,237,0.1)" : "var(--bg)", border: `1px solid ${p.actif ? V : "var(--border)"}` }}>
            {renommer === p.id ? (
              <input
                autoFocus
                value={nomRenomme}
                onChange={(e) => setNomRenomme(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void renommerProfil(p.id); if (e.key === "Escape") setRenommer(null); }}
                style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.82rem" }}
              />
            ) : (
              <button
                onClick={() => !p.actif && activer(p.id)}
                disabled={enCours}
                style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: p.actif ? "default" : "pointer", padding: 0 }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{p.nom}</span>
                {p.actif && <span style={{ marginLeft: 8, fontSize: "0.68rem", fontWeight: 700, color: V }}>ACTIF</span>}
                {!p.complete && <span style={{ marginLeft: 8, fontSize: "0.68rem", color: "var(--text-3)" }}>incomplet</span>}
              </button>
            )}

            {renommer === p.id ? (
              <button onClick={() => renommerProfil(p.id)} style={{ fontSize: "0.72rem", fontWeight: 600, color: V, background: "none", border: "none", cursor: "pointer" }}>OK</button>
            ) : (
              <>
                <button onClick={() => { setRenommer(p.id); setNomRenomme(p.nom); }} style={{ fontSize: "0.72rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}>Renommer</button>
                {profils.length > 1 && (
                  <button onClick={() => supprimer(p.id)} style={{ fontSize: "0.72rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Suppr.</button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {creation && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            autoFocus
            placeholder="Ex. Génie civil, Comptabilité…"
            value={nomNouveau}
            onChange={(e) => setNomNouveau(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void creer(); if (e.key === "Escape") setCreation(false); }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.82rem" }}
          />
          <button onClick={creer} disabled={enCours} style={{ padding: "8px 14px", borderRadius: 9, background: V, border: "none", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>Créer</button>
        </div>
      )}

      {erreur && <p style={{ fontSize: "0.76rem", color: "#ef4444", marginTop: 8 }}>{erreur}</p>}
      <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 10 }}>
        Le profil actif est utilisé pour le fil de swipe, le contrôle de compatibilité et la génération de dossier.
      </p>
    </div>
  );
}
