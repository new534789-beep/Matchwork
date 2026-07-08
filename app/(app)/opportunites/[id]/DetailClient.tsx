"use client";

import { useState } from "react";

type PieceExigee = { nom: string; obligatoire: boolean };

type Opportunite = {
  id: string;
  organisme: string;
  intitule: string;
  description: string;
  langueDetectee: string | null;
  conditions: string | null;
  piecesExigees: PieceExigee[];
  exigenceLangue: string | null;
  dateLimite: string | null;
  lien: string | null;
  source: string;
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function joursRestants(iso: string | null) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  const jours = Math.ceil(diff / 86400000);
  if (jours < 0) return "Délai dépassé";
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "1 jour restant";
  return `${jours} jours restants`;
}

export function DetailClient({
  opportunite,
  decisionInitiale,
  dossierId: dossierIdInitial,
  quotaRestant,
}: {
  opportunite: Opportunite;
  decisionInitiale: string | null;
  dossierId: string | null;
  quotaRestant: number;
}) {
  const [decision, setDecision] = useState(decisionInitiale);
  const [loadingDecision, setLoadingDecision] = useState(false);
  const [description, setDescription] = useState(opportunite.description);
  const [loadingTraduction, setLoadingTraduction] = useState(false);
  const [traduit, setTraduit] = useState(false);
  const [dossierId, setDossierId] = useState(dossierIdInitial);
  const [generation, setGeneration] = useState<"idle" | "loading" | "done" | "error">(
    dossierIdInitial ? "done" : decisionInitiale === "interesse" ? "error" : "idle"
  );
  const [erreurGen, setErreurGen] = useState<string | null>(
    !dossierIdInitial && decisionInitiale === "interesse" ? "La génération a échoué. Vérifiez que votre profil est complet, puis réessayez." : null
  );

  const estEtranger = opportunite.langueDetectee && opportunite.langueDetectee !== "fr";

  const marquerInteresse = async () => {
    if (decision === "interesse" || loadingDecision) return;
    setLoadingDecision(true);
    try {
      await fetch(`/api/opportunites/${opportunite.id}/interaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "interesse" }),
      });
      setDecision("interesse");
      setGeneration("loading");
      setErreurGen(null);
      try {
        const res = await fetch("/api/dossiers/generer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opportuniteId: opportunite.id }),
        });
        const data = await res.json() as { dossierId?: string; statut?: string; erreur?: string; quotaAtteint?: boolean };
        if (data.dossierId && data.statut === "genere") {
          setDossierId(data.dossierId);
          setGeneration("done");
        } else if (data.quotaAtteint) {
          setGeneration("error");
          setErreurGen("Quota mensuel atteint. Passez au plan Pro pour continuer.");
        } else if (data.erreur) {
          setGeneration("error");
          setErreurGen(data.erreur);
        } else {
          setDossierId(data.dossierId ?? null);
          setGeneration("error");
          setErreurGen("La génération n'a pas abouti. Réessayez.");
        }
      } catch {
        setGeneration("error");
        setErreurGen("Erreur réseau lors de la génération.");
      }
    } finally {
      setLoadingDecision(false);
    }
  };

  const traduire = async () => {
    if (traduit || loadingTraduction) return;
    setLoadingTraduction(true);
    try {
      const res = await fetch("/api/ia/traduire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportuniteId: opportunite.id }),
      });
      const data = await res.json() as { traduit?: string; erreur?: string };
      if (data.traduit) {
        setDescription(data.traduit);
        setTraduit(true);
      }
    } finally {
      setLoadingTraduction(false);
    }
  };

  const dateFormatee = formatDate(opportunite.dateLimite);
  const jours = joursRestants(opportunite.dateLimite);
  const joursUrgent = opportunite.dateLimite
    ? (new Date(opportunite.dateLimite).getTime() - Date.now()) / 86400000 < 14
    : false;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 40px" }}>

      {/* En-tête */}
      <div style={{
        borderRadius: "16px", overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: "16px",
      }}>
        <div style={{
          padding: "24px 20px 20px",
          background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(13,61,128,0.1))",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{
              width: 48, height: 48, borderRadius: "14px", flexShrink: 0,
              background: "linear-gradient(135deg,#7c3aed,#1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem", fontWeight: 700, color: "#fff",
            }}>
              {opportunite.organisme.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-2)", marginBottom: "2px" }}>
                {opportunite.organisme}
                {opportunite.source === "COLLEE" && (
                  <span style={{
                    marginLeft: "8px", fontSize: "0.68rem", padding: "2px 7px",
                    borderRadius: "5px", background: "rgba(124,58,237,0.15)",
                    color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)",
                  }}>
                    Collée
                  </span>
                )}
              </p>
              <h1 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                {opportunite.intitule}
              </h1>
            </div>
          </div>

          {/* Méta-données */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {opportunite.exigenceLangue && (
              <span style={{
                fontSize: "0.75rem", padding: "4px 10px", borderRadius: "8px",
                background: "rgba(255,255,255,0.06)", color: "var(--text-2)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                {opportunite.exigenceLangue}
              </span>
            )}
            {dateFormatee && (
              <span style={{
                fontSize: "0.75rem", padding: "4px 10px", borderRadius: "8px",
                background: joursUrgent ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.06)",
                color: joursUrgent ? "#f59e0b" : "rgba(255,255,255,0.55)",
                border: `1px solid ${joursUrgent ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.1)"}`,
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {dateFormatee} {jours ? `· ${jours}` : ""}
              </span>
            )}
            {estEtranger && (
              <span style={{
                fontSize: "0.75rem", padding: "4px 10px", borderRadius: "8px",
                background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.2)",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" /></svg>
                {opportunite.langueDetectee?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
              Description
            </p>
            {estEtranger && !traduit && (
              <button
                onClick={traduire}
                disabled={loadingTraduction}
                style={{
                  fontSize: "0.75rem", fontWeight: 600, padding: "4px 12px",
                  borderRadius: "8px", background: "rgba(245,158,11,0.1)",
                  color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)",
                  cursor: loadingTraduction ? "default" : "pointer",
                  opacity: loadingTraduction ? 0.6 : 1,
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}
              >
                {!loadingTraduction && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" /></svg>
                )}
                {loadingTraduction ? "Traduction…" : "Traduire en français"}
              </button>
            )}
            {traduit && (
              <span style={{ fontSize: "0.72rem", color: "rgba(245,158,11,0.6)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Traduit
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {description}
          </p>
        </div>
      </div>

      {/* Conditions */}
      {opportunite.conditions && (
        <div style={{
          borderRadius: "16px", padding: "18px 20px", marginBottom: "16px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "10px" }}>
            Conditions d&apos;éligibilité
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {opportunite.conditions}
          </p>
        </div>
      )}

      {/* Pièces exigées */}
      {opportunite.piecesExigees.length > 0 && (
        <div style={{
          borderRadius: "16px", padding: "18px 20px", marginBottom: "16px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "12px" }}>
            Pièces exigées
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {opportunite.piecesExigees.map((p, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: p.obligatoire ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${p.obligatoire ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.1)"}`,
                }}>
                  {p.obligatoire ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                  )}
                </div>
                <span style={{ fontSize: "0.85rem", color: p.obligatoire ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)" }}>
                  {p.nom}
                  {!p.obligatoire && (
                    <span style={{ marginLeft: 6, fontSize: "0.72rem", color: "var(--text-3)" }}>(optionnel)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lien officiel */}
      {opportunite.lien && (
        <div style={{ marginBottom: "16px" }}>
          <a
            href={opportunite.lien}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 16px", borderRadius: "12px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-2)", fontSize: "0.82rem", textDecoration: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Voir sur le site officiel
          </a>
        </div>
      )}

      {/* Partager sur WhatsApp */}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => {
            const url = `${window.location.origin}/opportunites/${opportunite.id}`;
            const texte = `${opportunite.intitule} — ${opportunite.organisme}\n\n${url}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, "_blank", "noopener");
          }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 16px", borderRadius: "12px",
            background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.25)",
            color: "#25d366", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Partager sur WhatsApp
        </button>
      </div>

      {/* Actions principales */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>

        {/* Ça m'intéresse */}
        <button
          onClick={marquerInteresse}
          disabled={decision === "interesse" || loadingDecision}
          style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            fontWeight: 600, fontSize: "0.95rem",
            background: decision === "interesse"
              ? "rgba(34,197,94,0.12)"
              : "linear-gradient(135deg,#7c3aed,#5b21b6)",
            border: decision === "interesse" ? "1px solid rgba(34,197,94,0.3)" : "none",
            color: decision === "interesse" ? "#4ade80" : "#fff",
            cursor: decision === "interesse" ? "default" : loadingDecision ? "default" : "pointer",
            opacity: loadingDecision ? 0.7 : 1,
          }}
        >
          {decision === "interesse" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Marqué comme intéressant
            </span>
          ) : loadingDecision ? "Enregistrement…" : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              Ça m&apos;intéresse
            </span>
          )}
        </button>

        {/* Accès au dossier */}
        {generation === "done" && dossierId ? (
          <a
            href={`/dossiers/${dossierId}`}
            style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              fontWeight: 600, fontSize: "0.95rem", textAlign: "center",
              background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
              color: "#a78bfa", textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Voir mon dossier
          </a>
        ) : generation === "loading" ? (
          <div
            style={{
              width: "100%", padding: "16px", borderRadius: "14px",
              background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#a78bfa" }}>
                L&apos;IA rédige votre dossier…
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
              Cela peut prendre 15 à 30 secondes.
            </span>
          </div>
        ) : generation === "error" ? (
          <div
            style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "#fca5a5" }}>
              {erreurGen ?? "La génération a échoué."}
            </span>
            <button
              onClick={() => {
                setGeneration("loading");
                setErreurGen(null);
                fetch("/api/dossiers/generer", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ opportuniteId: opportunite.id }),
                })
                  .then((r) => r.json())
                  .then((data: { dossierId?: string; statut?: string; erreur?: string }) => {
                    if (data.dossierId && data.statut === "genere") {
                      setDossierId(data.dossierId);
                      setGeneration("done");
                    } else {
                      setGeneration("error");
                      setErreurGen(data.erreur ?? "La génération n'a pas abouti.");
                    }
                  })
                  .catch(() => {
                    setGeneration("error");
                    setErreurGen("Erreur réseau. Vérifiez votre connexion.");
                  });
              }}
              style={{
                padding: "8px 20px", borderRadius: "10px",
                background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
