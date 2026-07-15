"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const CLE_MASQUE = "mw-install-dismissed";

type EvenementInstallation = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function estMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function estIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function dejaInstallee(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Popup d'installation PWA — 100% habillé Matchwork, jamais le popup natif
 * du navigateur. On intercepte `beforeinstallprompt` et on appelle
 * `preventDefault()` immédiatement pour empêcher Chrome/Edge d'afficher son
 * propre bandeau ; on ne déclenche `prompt()` (natif, imposé par le
 * navigateur — étape que même les apps natives ne peuvent pas éviter) que
 * lorsque l'utilisateur clique sur NOTRE bouton "Installer".
 *
 * Sur iOS, Safari n'expose pas `beforeinstallprompt` du tout (restriction
 * Apple) : impossible de déclencher l'installation par code, donc on affiche
 * des instructions ("Partager → Sur l'écran d'accueil") plutôt qu'un bouton.
 */
export function InstallPrompt({ justSignedUp }: { justSignedUp: boolean }) {
  const [evenement, setEvenement] = useState<EvenementInstallation | null>(null);
  const [visible, setVisible] = useState(false);
  const [modeIOS, setModeIOS] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setEvenement(e as EvenementInstallation);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  useEffect(() => {
    if (!justSignedUp) return;
    if (localStorage.getItem(CLE_MASQUE)) return;
    if (!estMobile() || dejaInstallee()) return;

    if (estIOS()) {
      // Pas d'évènement à attendre : on montre directement les instructions.
      setModeIOS(true);
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }

    // Android/Chrome : laisse un peu de temps à beforeinstallprompt pour arriver.
    const t = setTimeout(() => {
      setVisible((v) => v || !!evenement);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justSignedUp, evenement]);

  function fermer() {
    localStorage.setItem(CLE_MASQUE, "1");
    setVisible(false);
  }

  async function installer() {
    if (!evenement) return;
    await evenement.prompt();
    await evenement.userChoice;
    localStorage.setItem(CLE_MASQUE, "1");
    setVisible(false);
  }

  if (!visible || (!modeIOS && !evenement)) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer Matchwork"
      style={{
        position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 200,
        maxWidth: 420, margin: "0 auto",
        borderRadius: 20, padding: "20px 20px 18px",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        boxShadow: "0 20px 50px -12px rgba(31,16,64,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
        <Image src="/logo-glossy.png" alt="Matchwork" width={44} height={44} style={{ borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Installez Matchwork sur votre téléphone
          </p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.5 }}>
            {modeIOS
              ? <>Appuyez sur <strong>Partager</strong> <span aria-hidden>⬆︎</span>, puis <strong>« Sur l&apos;écran d&apos;accueil »</strong>.</>
              : "Accès plus rapide, alertes de deadlines, et une expérience plein écran sans le navigateur."}
          </p>
        </div>
        <button
          onClick={fermer}
          aria-label="Fermer"
          style={{ flexShrink: 0, background: "transparent", cursor: "pointer", padding: 4, color: "var(--text-3)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {!modeIOS && (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            onClick={fermer}
            style={{ flex: 1, padding: "10px 0", borderRadius: 11, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
          >
            Plus tard
          </button>
          <button
            onClick={installer}
            style={{ flex: 1, padding: "10px 0", borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", border: "none", cursor: "pointer", boxShadow: "0 6px 18px rgba(124,58,237,0.35)" }}
          >
            Installer
          </button>
        </div>
      )}
      {modeIOS && (
        <button
          onClick={fermer}
          style={{ width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 11, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
        >
          Compris
        </button>
      )}
    </div>
  );
}
