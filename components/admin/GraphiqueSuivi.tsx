"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { StatsData } from "./GraphiquesCharts";

/**
 * Statistiques du tableau de bord admin (réservées à l'administration).
 *
 * La partie purement graphique (recharts, ~150 Ko) est chargée à la demande
 * via next/dynamic (ssr:false), uniquement quand les statistiques sont
 * arrivées : aucun candidat ne télécharge recharts, et l'écran admin s'affiche
 * sans attendre la bibliothèque de graphiques.
 */
const Graphiques = dynamic(() => import("./GraphiquesCharts").then((m) => m.Graphiques), { ssr: false });

function Skeleton() {
  return (
    <div style={{ height: 200, borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Chargement...</p>
    </div>
  );
}

const V = "#7c3aed";
const VL = "#a78bfa";

export function GraphiqueSuivi() {
  const [data, setData] = useState<StatsData | null>(null);
  const [periode, setPeriode] = useState<7 | 30>(30);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setErreur(true));
  }, []);

  if (erreur) {
    return (
      <div style={{ padding: 18, borderRadius: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", fontSize: "0.83rem", marginTop: 18 }}>
        Impossible de charger les statistiques.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 12 }}>
        {([7, 30] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriode(p)}
            style={{
              padding: "4px 12px", borderRadius: 8, border: "1px solid",
              borderColor: periode === p ? V : "var(--border)",
              background: periode === p ? "rgba(124,58,237,0.15)" : "transparent",
              color: periode === p ? VL : "var(--text-3)",
              fontSize: "0.74rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            {p}j
          </button>
        ))}
      </div>

      {data ? (
        <Graphiques data={data} periode={periode} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      )}
    </div>
  );
}
