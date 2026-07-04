"use client";

import { useState } from "react";
import Link from "next/link";

type Paiement = {
  id: string;
  montant: number;
  fournisseur: string;
  statut: string;
  createdAt: string;
};

type Props = {
  email: string;
  plan: string;
  quotaMax: number;
  generationsUtilisees: number;
  quotaRestant: number | null;
  paiements: Paiement[];
};

const PLANS = [
  { id: "gratuit",  nom: "Gratuit",  prix: 0,    features: ["3 dossiers / mois", "Profil IA de base", "Coffre-fort documents"] },
  { id: "pro",      nom: "Pro",      prix: 1700,  features: ["Dossiers illimités", "Traduction IA intégrée", "Alertes deadline", "Support prioritaire"] },
  { id: "premium",  nom: "Premium",  prix: 2900,  features: ["Tout le Pro", "Génération prioritaire", "Support WhatsApp 24/7", "Historique illimité"] },
] as const;

function statutBadge(statut: string) {
  if (statut === "reussi") return { label: "Réussi", color: "#a78bfa", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)" };
  if (statut === "echoue") return { label: "Échoué", color: "var(--text-3)", bg: "var(--bg-card)", border: "var(--border)" };
  return { label: "En attente", color: "var(--text-2)", bg: "var(--bg-card)", border: "var(--border)" };
}

function formatPrix(n: number) {
  return n.toLocaleString("fr-FR");
}

export function CompteClient({ email, plan, quotaMax, generationsUtilisees, quotaRestant, paiements }: Props) {
  const [planChoisi, setPlanChoisi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const estGratuit = plan === "gratuit" || plan === "GRATUIT";
  const barreProgression = estGratuit ? Math.min(1, generationsUtilisees / quotaMax) : 0;
  const planSel = PLANS.find((p) => p.id === planChoisi);

  const payer = async () => {
    if (!planChoisi || planChoisi === "gratuit") return;
    setLoading(true);
    setErreur(null);
    try {
      const res = await fetch("/api/paiement/initier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planChoisi }),
      });
      const data = await res.json() as { redirectUrl?: string; erreur?: string };
      if (!res.ok || !data.redirectUrl) throw new Error(data.erreur ?? "Erreur d'initiation");
      window.location.href = data.redirectUrl;
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur lors du paiement.");
      setLoading(false);
    }
  };

  const carte: React.CSSProperties = { borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border)", padding: 20 };

  return (
    <div className="space-y-5">

      {/* ── Mon plan ── */}
      <div style={{ borderRadius: 18, padding: 20, background: "linear-gradient(135deg,rgba(124,58,237,0.14),rgba(91,33,182,0.06))", border: "1px solid rgba(124,58,237,0.25)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-2)", marginBottom: 3 }}>{email}</p>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)" }}>Mon abonnement</h2>
          </div>
          <span style={{ padding: "5px 14px", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700, background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
            {estGratuit ? "Gratuit" : "Payant"}
          </span>
        </div>
        {estGratuit ? (
          <>
            <div className="flex justify-between mb-1.5">
              <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>Générations ce mois</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a78bfa" }}>{generationsUtilisees} / {quotaMax}</span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, width: `${barreProgression * 100}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", transition: "width 0.5s ease" }} />
            </div>
            {(quotaRestant ?? 0) === 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-2)", marginTop: 8 }}>Quota épuisé — choisissez un abonnement ci-dessous pour débloquer la génération.</p>
            )}
          </>
        ) : (
          <p style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>Générations illimitées ce mois. Merci de votre confiance.</p>
        )}
      </div>

      {/* ── Choix de l'abonnement ── */}
      {estGratuit && (
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Choisir un abonnement</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-2)", marginBottom: 16 }}>Sans engagement · Paiement Mobile Money · Résiliable à tout moment.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((p) => {
              const actuel = p.id === "gratuit";
              const selectionne = planChoisi === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => { if (!actuel) { setPlanChoisi(p.id); setErreur(null); } }}
                  style={{
                    borderRadius: 16, padding: 18, cursor: actuel ? "default" : "pointer",
                    background: selectionne ? "rgba(124,58,237,0.1)" : "var(--bg-card)",
                    border: `1.5px solid ${selectionne ? "#7c3aed" : "var(--border)"}`,
                    transition: "border-color 0.18s ease, background 0.18s ease",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)" }}>{p.nom}</span>
                    {actuel && <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-3)" }}>Actuel</span>}
                    {p.id === "pro" && <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(124,58,237,0.14)", color: "#a78bfa" }}>Populaire</span>}
                  </div>
                  <div className="mb-3">
                    {p.prix === 0 ? (
                      <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>Gratuit</span>
                    ) : (
                      <><span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{formatPrix(p.prix)}</span><span style={{ fontSize: "0.78rem", color: "var(--text-3)", marginLeft: 5 }}>XOF / mois</span></>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2" style={{ fontSize: "0.78rem", color: "var(--text-2)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!actuel && (
                    <div style={{ marginTop: 14, textAlign: "center", padding: "8px 0", borderRadius: 10, fontSize: "0.8rem", fontWeight: 600, background: selectionne ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "var(--bg)", border: selectionne ? "none" : "1px solid var(--border)", color: selectionne ? "#fff" : "var(--text-2)" }}>
                      {selectionne ? "Sélectionné" : "Choisir"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Formulaire de paiement ── */}
      {estGratuit && planSel && (
        <div style={carte}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Paiement — {planSel.nom} · {formatPrix(planSel.prix)} XOF/mois
          </h3>

          <div style={{ marginTop: 12, marginBottom: 20, padding: "10px 13px", borderRadius: 10, background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.18)" }}>
            <p style={{ fontSize: "0.76rem", color: "var(--text-2)", lineHeight: 1.6 }}>
              Vous serez redirigé vers la page de paiement FedaPay sécurisée. Accepte <strong>MTN MoMo</strong>, <strong>Moov Money</strong> et les <strong>cartes bancaires</strong> Visa / Mastercard.
            </p>
          </div>

          {erreur && <div style={{ marginBottom: 14, borderRadius: 11, padding: "10px 13px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", fontSize: "0.8rem" }}>{erreur}</div>}

          <button
            onClick={() => void payer()}
            disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: loading ? "default" : "pointer", boxShadow: "0 6px 20px rgba(124,58,237,0.28)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? (
              "Redirection…"
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                Payer {formatPrix(planSel.prix)} XOF
              </>
            )}
          </button>
          <p style={{ fontSize: "0.69rem", color: "var(--text-3)", textAlign: "center", marginTop: 8 }}>Sans engagement · Résiliable à tout moment</p>
        </div>
      )}

      {/* ── Historique ── */}
      {paiements.length > 0 && (
        <div style={{ ...carte, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)" }}>Historique des paiements</span>
          </div>
          <ul>
            {paiements.map((p) => {
              const badge = statutBadge(p.statut);
              const date = new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
              const labelMoyen = p.fournisseur === "fedapay" ? "FedaPay" : p.fournisseur;
              return (
                <li key={p.id} style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)" }}>{labelMoyen}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 1 }}>{date}</p>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-2)" }}>{formatPrix(p.montant)} XOF</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>{badge.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
