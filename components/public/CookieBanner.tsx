"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { choixConsentementActuel, enregistrerConsentement } from "@/lib/cookie-consent";

const V = "#7c3aed";

/**
 * Bannière de consentement cookies. N'affiche rien tant que le choix n'a pas
 * pu être lu côté client (évite un flash) ; ne réapparaît jamais une fois un
 * choix enregistré (accepté OU refusé).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [personnaliser, setPersonnaliser] = useState(false);
  const [marketingActive, setMarketingActive] = useState(true);

  useEffect(() => {
    setVisible(choixConsentementActuel() === null);
  }, []);

  function accepter() {
    enregistrerConsentement("accepte");
    setVisible(false);
  }

  function refuser() {
    enregistrerConsentement("refuse");
    setVisible(false);
  }

  function enregistrerPersonnalisation() {
    enregistrerConsentement(marketingActive ? "accepte" : "refuse");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Préférences cookies"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 300,
        display: "flex", justifyContent: "center", padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 640, borderRadius: 18, padding: "20px 22px",
          background: "var(--bg-card-solide)", border: "1px solid var(--border)",
          boxShadow: "0 20px 60px -10px rgba(0,0,0,0.35)",
        }}
      >
        {!personnaliser ? (
          <>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
              Cookies
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.55, marginBottom: 16 }}>
              Matchwork utilise des cookies essentiels au fonctionnement du site (connexion, sécurité), et un cookie
              marketing optionnel pour savoir d&apos;où viennent les visites. Voir notre{" "}
              <Link href="/legal/cookies" style={{ color: V, textDecoration: "underline" }}>politique de cookies</Link>.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={accepter}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: V, color: "#fff", fontWeight: 600, fontSize: "0.82rem" }}
              >
                Accepter
              </button>
              <button
                onClick={refuser}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", background: "var(--bg)", color: "var(--text)", fontWeight: 600, fontSize: "0.82rem" }}
              >
                Refuser
              </button>
              <button
                onClick={() => setPersonnaliser(true)}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "var(--text-3)", fontWeight: 600, fontSize: "0.82rem" }}
              >
                Personnaliser
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
              Personnaliser les cookies
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 10, padding: "10px 12px", borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)" }}>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>Essentiels</p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>Connexion, sécurité — toujours actifs.</p>
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", flexShrink: 0, marginTop: 2 }}>Obligatoire</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 16, padding: "10px 12px", borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)" }}>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>Marketing</p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>Mesure d&apos;où viennent les inscriptions.</p>
              </div>
              <button
                onClick={() => setMarketingActive((v) => !v)}
                aria-pressed={marketingActive}
                style={{
                  flexShrink: 0, width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                  background: marketingActive ? V : "var(--border-strong, var(--border))",
                  position: "relative", transition: "background 0.15s ease",
                }}
              >
                <span style={{
                  position: "absolute", top: 2, left: marketingActive ? 20 : 2,
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  transition: "left 0.15s ease",
                }} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={enregistrerPersonnalisation}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: V, color: "#fff", fontWeight: 600, fontSize: "0.82rem" }}
              >
                Enregistrer mes choix
              </button>
              <button
                onClick={() => setPersonnaliser(false)}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "var(--text-3)", fontWeight: 600, fontSize: "0.82rem" }}
              >
                Retour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
