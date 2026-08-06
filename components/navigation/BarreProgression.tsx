"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Barre de progression fine en haut de l'écran, affichée pendant les
 * navigations internes. Contrairement à l'ancien ChargementNavigation, elle
 * ne bloque RIEN : pas d'overlay, pas de flou, pas d'état modal — l'application
 * reste entièrement cliquable. Le rendu réel de la page suivante est assuré par
 * les squelettes loading.tsx, la barre ne fait qu'indiquer qu'une navigation
 * est en cours.
 */
export function BarreProgression() {
  const pathname = usePathname();
  const [actif, setActif] = useState(false);
  const [largeur, setLargeur] = useState(0);

  // Toute navigation interne (clic sur un <a> interne) lance la barre.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const lien = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!lien) return;
      if (lien.target === "_blank" || lien.hasAttribute("download")) return;

      let url: URL;
      try { url = new URL(lien.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;

      setActif(true);
      setLargeur(8);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  // Avance de façon heuristique tant que la page n'est pas arrivée : plus la
  // navigation dure, plus la barre se remplit — sans jamais atteindre 100 %
  // (le 100 % est réservé à l'arrivée de la page).
  useEffect(() => {
    if (!actif) return;
    const t = setInterval(() => {
      setLargeur((l) => {
        if (l >= 90) return l;
        const reste = 90 - l;
        return l + Math.max(0.5, reste * 0.08);
      });
    }, 120);
    return () => clearInterval(t);
  }, [actif]);

  // La page est arrivée : complète la barre puis la retire.
  useEffect(() => {
    if (!actif) return;
    setLargeur(100);
    const t = setTimeout(() => {
      setActif(false);
      setLargeur(0);
    }, 260);
    return () => clearTimeout(t);
  }, [pathname, actif]);

  if (!actif) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 400,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${largeur}%`,
          background: "linear-gradient(90deg,#a78bfa,#7c3aed)",
          boxShadow: "0 0 10px rgba(124,58,237,0.6)",
          transition: "width 0.15s ease",
        }}
      />
    </div>
  );
}
