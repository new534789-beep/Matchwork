"use client";

import { useState, useEffect } from "react";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { Carte } from "@/components/ui/carte";

type Stats = { total: number; inscrits: number; actifs: number };
type ParrainageItem = { statut: string; createdAt: string };

export default function Parrainage() {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState<Stats>({ total: 0, inscrits: 0, actifs: 0 });
  const [parrainages, setParrainages] = useState<ParrainageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copie, setCopie] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "erreur"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/parrainage")
      .then((r) => r.json())
      .then((data) => {
        setCode(data.code || "");
        setStats(data.stats || { total: 0, inscrits: 0, actifs: 0 });
        setParrainages(data.parrainages || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const copierCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const partager = async () => {
    const texte = `Rejoins Matchwork et trouve des bourses adaptées à ton profil ! Utilise mon code ${code} pour t'inscrire : https://matchwork-seven.vercel.app/inscription?ref=${code}`;
    if (navigator.share) {
      await navigator.share({ title: "Matchwork — Parrainage", text: texte });
    } else {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    }
  };

  const utiliserCode = async () => {
    if (!codeInput.trim()) return;
    setMessage(null);
    try {
      const res = await fetch("/api/parrainage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "ok", text: "Parrainage enregistré avec succès !" });
        setCodeInput("");
      } else {
        setMessage({ type: "erreur", text: data.erreur || "Erreur" });
      }
    } catch {
      setMessage({ type: "erreur", text: "Erreur réseau" });
    }
  };

  if (loading) {
    return (
      <>
        <EnteteApp titre="Parrainage" />
        <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full flex items-center justify-center">
          <p style={{ color: "var(--text-2)" }}>Chargement...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <EnteteApp titre="Parrainage" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Invitez vos amis</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Partagez votre code et gagnez des avantages quand vos filleuls s&apos;inscrivent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Mon code */}
          <Carte>
            <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Mon code de parrainage</h2>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 12,
              background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
            }}>
              <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "0.1em", color: "#7c3aed", flex: 1 }}>
                {code}
              </span>
              <button onClick={copierCode} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: "#7c3aed", color: "#fff", fontSize: "0.78rem", fontWeight: 600,
              }}>
                {copie ? "Copié !" : "Copier"}
              </button>
            </div>
            <button onClick={partager} style={{
              marginTop: 12, width: "100%", padding: "11px", borderRadius: 11, cursor: "pointer",
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff",
              border: "none", fontWeight: 600, fontSize: "0.85rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Partager le lien
            </button>
          </Carte>

          {/* Statistiques */}
          <Carte>
            <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Mes filleuls</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Invités", valeur: stats.total, couleur: "#7c3aed" },
                { label: "Inscrits", valeur: stats.inscrits, couleur: "#059669" },
                { label: "Actifs", valeur: stats.actifs, couleur: "#0ea5e9" },
              ].map((s) => (
                <div key={s.label} style={{
                  textAlign: "center", padding: "14px 8px", borderRadius: 12,
                  background: "rgba(124,58,237,0.04)", border: "1px solid var(--border)",
                }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: s.couleur }}>{s.valeur}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
            {parrainages.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-2)" }}>Historique</p>
                {parrainages.slice(0, 5).map((p, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: i < parrainages.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                      background: p.statut === "actif" ? "rgba(5,150,105,0.1)" : "rgba(124,58,237,0.08)",
                      color: p.statut === "actif" ? "#059669" : "#7c3aed",
                    }}>
                      {p.statut === "actif" ? "Actif" : p.statut === "inscrit" ? "Inscrit" : "En attente"}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Carte>
        </div>

        {/* Utiliser un code */}
        <Carte>
          <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Vous avez un code ?</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="MW-XXXXXX"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)",
                background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem",
                fontWeight: 600, letterSpacing: "0.08em",
              }}
            />
            <button onClick={utiliserCode} style={{
              padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "#7c3aed", color: "#fff", fontSize: "0.82rem", fontWeight: 600,
            }}>
              Valider
            </button>
          </div>
          {message && (
            <p style={{
              marginTop: 8, fontSize: "0.8rem", fontWeight: 600,
              color: message.type === "ok" ? "#059669" : "#ef4444",
            }}>
              {message.text}
            </p>
          )}
        </Carte>
      </main>
    </>
  );
}
