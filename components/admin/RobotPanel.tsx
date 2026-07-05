"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Dernier = {
  finAt?: string; creees: number; aValider: number; revueManuelle: number;
  sourcesOk: number; sourcesPanne: number; sourcesTraitees: number; expirees?: number;
} | null;

type Initial = { aValider: number; actives: number; ok: number; panne: number; inconnu: number; dernier: Dernier };

const TAILLE_LOT = 4; // sources traitées par lot (évite les timeouts)
const V = "#7c3aed", VL = "#a78bfa";

function fmt(iso?: string) {
  if (!iso) return "jamais";
  try { return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}

function Carte({ label, valeur, sous }: { label: string; valeur: string | number; sous?: string }) {
  return (
    <div style={{ borderRadius: 16, padding: "16px 18px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)" }}>{label}</p>
      <p style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", margin: "2px 0" }}>{valeur}</p>
      {sous && <p style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{sous}</p>}
    </div>
  );
}

export function RobotPanel({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [resultat, setResultat] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  async function lancerAction(action: string, label: string) {
    if (running || runningAction) return;
    setRunningAction(action); setErreur(null); setResultat(null);
    try {
      const res = await fetch("/api/admin/ingestion", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) { setErreur(d.erreur ?? `Échec ${label}.`); return; }
      const r = d.rapport;
      setResultat(`${label} terminé : ${r.creees ?? 0} créées · ${r.doublons ?? 0} doublons · ${r.erreurs ?? 0} erreurs`);
      router.refresh();
    } catch {
      setErreur(`Erreur réseau (${label}).`);
    } finally {
      setRunningAction(null);
    }
  }

  async function lancer() {
    if (running) return;
    setRunning(true); setErreur(null); setResultat(null);
    const acc = { creees: 0, aValider: 0, revueManuelle: 0, rejetees: 0, panne: 0 };
    let skip = 0;
    try {
      // Boucle par lots jusqu'à ce que toutes les sources actives soient traitées.
      // Garde-fou : 500 itérations max.
      for (let i = 0; i < 500; i++) {
        const res = await fetch("/api/admin/ingestion", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skip, take: TAILLE_LOT }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok || !d.ok) { setErreur(d.erreur ?? "Échec de la collecte."); break; }
        const r = d.rapport;
        acc.creees += r.creees; acc.aValider += r.aValider; acc.revueManuelle += r.revueManuelle;
        acc.rejetees += r.rejetees; acc.panne += r.sourcesEnPanne;
        setProgress(`${Math.min(d.prochainSkip, d.totalActives)} / ${d.totalActives} sources traitées · ${acc.creees} offres ramenées`);
        if (d.termine || r.sources === 0) break;
        skip = d.prochainSkip;
      }
      setResultat(`Terminé : ${acc.aValider} prêtes à valider · ${acc.revueManuelle} à revoir · ${acc.rejetees} écartées (date) · ${acc.panne} source(s) en panne.`);
      router.refresh();
    } catch {
      setErreur("Erreur réseau pendant la collecte.");
    } finally {
      setRunning(false); setProgress(null);
    }
  }

  const d = initial.dernier;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 18 }}>
        <Carte label="Dernière collecte" valeur={d?.finAt ? "✓" : "—"} sous={fmt(d?.finAt)} />
        <Carte label="Offres ramenées" valeur={d?.creees ?? 0} sous="au dernier run" />
        <Carte label="En attente de validation" valeur={initial.aValider} sous="dans la file" />
        <Carte label="Sources" valeur={`${initial.ok}✓ / ${initial.panne}✕`} sous={`${initial.actives} actives · ${initial.inconnu} à tester`} />
      </div>

      <button onClick={lancer} disabled={running || initial.actives === 0} style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, border: "none",
        cursor: running || initial.actives === 0 ? "default" : "pointer", fontWeight: 700, fontSize: "0.9rem", color: "#fff",
        background: "linear-gradient(135deg,#7c3aed,#5b21b6)", opacity: running || initial.actives === 0 ? 0.6 : 1,
        boxShadow: "0 6px 18px rgba(124,58,237,0.35)",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={running ? { animation: "spin 1s linear infinite" } : undefined}>
          <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
        {running ? "Collecte en cours…" : "Lancer maintenant"}
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
        {([
          { action: "stages", label: "Stages", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
          { action: "formations", label: "Formations", icon: "M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
          { action: "admissions", label: "Admissions", icon: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" },
        ] as const).map((b) => (
          <button key={b.action} onClick={() => lancerAction(b.action, b.label)} disabled={!!running || !!runningAction} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.3)",
            cursor: running || runningAction ? "default" : "pointer", fontWeight: 600, fontSize: "0.82rem", color: VL,
            background: "rgba(124,58,237,0.08)", opacity: running || runningAction ? 0.5 : 1,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={runningAction === b.action ? { animation: "spin 1s linear infinite" } : undefined}>
              <path d={b.icon} />
            </svg>
            {runningAction === b.action ? `${b.label}…` : b.label}
          </button>
        ))}
      </div>

      {progress && <p style={{ fontSize: "0.8rem", color: VL, marginTop: 12 }}>{progress}</p>}
      {resultat && (
        <div style={{ marginTop: 14, padding: "11px 15px", borderRadius: 11, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.28)", color: VL, fontSize: "0.83rem" }}>
          {resultat} <a href="/admin/validation" style={{ color: VL, fontWeight: 700 }}>Voir la file de validation →</a>
        </div>
      )}
      {erreur && <div style={{ marginTop: 14, padding: "11px 15px", borderRadius: 11, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", fontSize: "0.83rem" }}>{erreur}</div>}

      <p style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: 18 }}>
        La collecte se fait <strong style={{ color: "var(--text-2)" }}>par lots de {TAILLE_LOT} sources</strong> (RSS + scraping), en respectant robots.txt. Une source en panne est marquée et n&apos;arrête pas les autres. Rien n&apos;est publié sans passer par la <strong style={{ color: V }}>file de validation</strong>.
      </p>
    </div>
  );
}
