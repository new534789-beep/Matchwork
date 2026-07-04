"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX = 15000;

export function CollerOffreForm() {
  const router = useRouter();
  const [texte, setTexte] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function analyser() {
    if (!texte.trim() || chargement) return;
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/ia/lire-offre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenu: texte.trim() }),
      });
      const data = await res.json() as { opportuniteId?: string; erreur?: string };
      if (!res.ok || !data.opportuniteId) {
        setErreur(data.erreur ?? "Impossible d'analyser cette offre. Réessayez.");
        return;
      }
      router.push(`/opportunites/${data.opportuniteId}`);
    } catch {
      setErreur("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div>
      <div
        style={{
          borderRadius: 16,
          background: "var(--input-bg)",
          border: "1px solid var(--input-border)",
          padding: 14,
        }}
      >
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value.slice(0, MAX))}
          placeholder="Collez ici le texte complet d'une annonce de bourse : organisme, intitulé, conditions, pièces à fournir, date limite…"
          rows={10}
          disabled={chargement}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "vertical",
            color: "var(--text)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            minHeight: 200,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{texte.length} / {MAX}</span>
        </div>
      </div>

      {erreur && (
        <div style={{ marginTop: 12, borderRadius: 12, padding: "11px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", gap: 9 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: "0.8rem", color: "#fca5a5" }}>{erreur}</p>
        </div>
      )}

      <button
        onClick={analyser}
        disabled={!texte.trim() || chargement}
        style={{
          width: "100%",
          marginTop: 14,
          padding: "13px 0",
          borderRadius: 12,
          border: "none",
          fontWeight: 700,
          fontSize: "0.9rem",
          cursor: texte.trim() && !chargement ? "pointer" : "not-allowed",
          background: texte.trim() && !chargement ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "var(--bg-card)",
          color: texte.trim() && !chargement ? "#fff" : "var(--text-3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.2s ease",
        }}
      >
        {chargement ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Analyse en cours…
          </>
        ) : (
          <>
            Analyser l&apos;offre
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
