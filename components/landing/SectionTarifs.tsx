"use client";

import Link from "next/link";
import { useState } from "react";

type Plan = {
  nom: string;
  mensuel: number | null; // null = gratuit
  features: string[];
  vedette?: boolean;
  cta: string;
};

const PLANS: Plan[] = [
  {
    nom: "Gratuit",
    mensuel: null,
    cta: "Commencer gratuitement",
    features: [
      "3 dossiers complets / mois",
      "Profil IA de base",
      "Coffre-fort 5 documents",
      "10 opportunités / semaine",
      "Support communautaire",
    ],
  },
  {
    nom: "Standard",
    mensuel: 4900,
    vedette: true,
    cta: "Commencer",
    features: [
      "Dossiers illimités",
      "Bourses, emplois, concours, résidences",
      "Traduction IA intégrée",
      "CV + lettre + checklist",
      "Alertes deadline",
      "Support prioritaire",
    ],
  },
  {
    nom: "Pro",
    mensuel: 9900,
    cta: "Commencer",
    features: [
      "Tout le Plan Standard",
      "Génération IA prioritaire",
      "Analytics candidatures",
      "Support WhatsApp 24/7",
      "Export PDF avancé",
      "Historique illimité",
    ],
  },
];

const REDUCTION = 0.2; // -20% en facturation annuelle

function formaterPrix(n: number) {
  return n.toLocaleString("fr-FR");
}

function BadgesMobileMoney() {
  return (
    <div className="flex items-center gap-2 mb-7">
      <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: "5px", background: "#FFCC00", color: "#0a0a0a" }}>MTN MoMo</span>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: "5px", background: "#0066CC", color: "#fff" }}>Moov</span>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: "5px", background: "#00A651", color: "#fff" }}>BjPay</span>
    </div>
  );
}

function Check({ couleur }: { couleur: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
      <path d="M20 6L9 17l-5-5" stroke={couleur} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SectionTarifs() {
  const [annuel, setAnnuel] = useState(false);

  return (
    <section id="tarifs" className="py-32 px-8 relative overflow-hidden" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div
        aria-hidden
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-44%)",
          fontSize: "clamp(100px,16vw,220px)",
          fontWeight: 900, color: "rgba(255,255,255,0.018)",
          letterSpacing: "-0.06em", whiteSpace: "nowrap",
          userSelect: "none", pointerEvents: "none", lineHeight: 1,
        }}
      >
        Tarifs
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <p className="text-center text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(167,139,250,0.8)" }}>
          Offres
        </p>
        <h2 className="text-center font-extrabold mb-4 text-white" style={{ fontSize: "clamp(2rem,3.5vw,3rem)", letterSpacing: "-0.03em" }}>
          Tarification simple et transparente
        </h2>
        <p className="text-center mb-10" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem" }}>
          Sans carte bancaire · Paiement Mobile Money · Résiliable à tout moment
        </p>

        {/* Toggle mensuel / annuel */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: annuel ? "rgba(255,255,255,0.4)" : "#fff" }}>Mensuel</span>
          <button
            onClick={() => setAnnuel((v) => !v)}
            aria-label="Basculer la facturation"
            style={{
              position: "relative", width: 56, height: 30, borderRadius: 999,
              background: annuel ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.12)",
              border: "1px solid " + (annuel ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.15)"),
              cursor: "pointer", transition: "background 0.25s ease, border-color 0.25s ease", flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: annuel ? 28 : 3,
              width: 22, height: 22, borderRadius: "50%", background: "#fff",
              transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            }} />
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: annuel ? "#fff" : "rgba(255,255,255,0.4)" }}>Annuel</span>
          <span style={{
            fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999,
            background: "rgba(124,58,237,0.15)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)",
          }}>
            Économisez 20 %
          </span>
        </div>

        {/* Cartes */}
        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.08fr 1fr", gap: "18px", alignItems: "center" }}>
          {PLANS.map((plan) => {
            const vedette = plan.vedette;
            const prixMensuelEffectif = plan.mensuel === null ? null : annuel ? Math.round(plan.mensuel * (1 - REDUCTION)) : plan.mensuel;

            return (
              <div
                key={plan.nom}
                className="price-card rounded-2xl flex flex-col"
                style={
                  vedette
                    ? { padding: "36px 28px", background: "#ffffff", boxShadow: "0 0 80px rgba(124,58,237,0.28), 0 40px 80px rgba(0,0,0,0.6)" }
                    : { padding: "32px 26px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }
                }
              >
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: vedette ? "rgba(10,10,10,0.4)" : "rgba(255,255,255,0.28)" }}>{plan.nom}</p>
                  {vedette && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>Recommandé</span>
                  )}
                </div>

                {/* Prix */}
                <div className="mb-2" style={{ minHeight: 52 }}>
                  {prixMensuelEffectif === null ? (
                    <span className="font-extrabold" style={{ fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "-0.04em", color: vedette ? "#0a0a0a" : "#fff" }}>Gratuit</span>
                  ) : (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {annuel && (
                        <span style={{ fontSize: "1.1rem", fontWeight: 600, textDecoration: "line-through", color: vedette ? "rgba(10,10,10,0.3)" : "rgba(255,255,255,0.3)" }}>
                          {formaterPrix(plan.mensuel!)}
                        </span>
                      )}
                      <span className="font-extrabold" style={{ fontSize: "clamp(1.9rem,4vw,2.9rem)", letterSpacing: "-0.04em", color: vedette ? "#0a0a0a" : "#fff" }}>
                        {formaterPrix(prixMensuelEffectif)}
                      </span>
                      <span className="text-sm font-medium" style={{ color: vedette ? "rgba(10,10,10,0.38)" : "rgba(255,255,255,0.28)" }}>FCFA / mois</span>
                    </div>
                  )}
                  {annuel && prixMensuelEffectif !== null && (
                    <p style={{ fontSize: "0.72rem", marginTop: 4, color: vedette ? "rgba(124,58,237,0.8)" : "#a78bfa" }}>
                      Facturé annuellement · {formaterPrix(prixMensuelEffectif * 12)} FCFA / an
                    </p>
                  )}
                </div>

                {plan.mensuel !== null && <BadgesMobileMoney />}
                {plan.mensuel === null && <div style={{ height: 12 }} />}

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: vedette ? "rgba(10,10,10,0.62)" : "rgba(255,255,255,0.4)" }}>
                      <Check couleur={vedette ? "#7c3aed" : "rgba(124,58,237,0.7)"} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/inscription"
                  style={
                    vedette
                      ? { display: "block", width: "100%", textAlign: "center", padding: "13px 0", borderRadius: "12px", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", background: "#7c3aed", color: "#fff", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }
                      : { display: "block", width: "100%", textAlign: "center", padding: "12px 0", borderRadius: "12px", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Badges de réassurance */}
        <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
          {[
            { t: "Paiement sécurisé", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" },
            { t: "Sans carte bancaire", d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
            { t: "Résiliable à tout moment", d: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2" },
          ].map((b) => (
            <div key={b.t} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b.d} /></svg>
              {b.t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
