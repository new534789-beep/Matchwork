"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type StatsData = {
  inscriptionsParJour: { jour: string; total: number }[];
  sessionsParJour: { jour: string; dureeMoyenneMs: number; utilisateursActifs: number }[];
  interactionsParJour: { jour: string; total: number }[];
};

const V = "#7c3aed";
const VL = "#a78bfa";
const VD = "#5b21b6";

function jourCourt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

function filtrerJours<T extends { jour: string }>(data: T[], jours: number): T[] {
  const seuil = new Date();
  seuil.setDate(seuil.getDate() - jours);
  return data.filter((d) => new Date(d.jour) >= seuil);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", fontSize: "0.78rem" }}>
      <p style={{ color: "var(--text-2)", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 700 }}>{p.name} : {p.value}</p>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ height: 200, borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Chargement...</p>
    </div>
  );
}

function CarteGraphe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 18, padding: "18px 20px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>{titre}</p>
      {children}
    </div>
  );
}

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

  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ marginTop: 18 }}>
        <Skeleton /><Skeleton /><Skeleton />
      </div>
    );
  }

  const inscriptions = filtrerJours(data.inscriptionsParJour, periode).map((d) => ({ ...d, jour: jourCourt(d.jour) }));
  const sessions = filtrerJours(data.sessionsParJour, periode).map((d) => ({
    jour: jourCourt(d.jour),
    minutes: Math.round(d.dureeMoyenneMs / 60000),
    actifs: d.utilisateursActifs,
  }));
  const interactions = filtrerJours(data.interactionsParJour, periode).map((d) => ({ ...d, jour: jourCourt(d.jour) }));

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CarteGraphe titre="Inscriptions">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={inscriptions}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jour" tick={{ fill: "var(--text-3)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Inscriptions" stroke={V} fill={V} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CarteGraphe>

        <CarteGraphe titre="Temps moyen / session">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={sessions}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jour" tick={{ fill: "var(--text-3)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} tickLine={false} axisLine={false} unit=" min" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="minutes" name="Minutes" stroke={VL} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CarteGraphe>

        <CarteGraphe titre="Utilisateurs actifs / jour">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sessions}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jour" tick={{ fill: "var(--text-3)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="actifs" name="Actifs" fill={VD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CarteGraphe>
      </div>
    </div>
  );
}
