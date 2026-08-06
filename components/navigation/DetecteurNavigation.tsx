"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Détecte toute navigation interne déclenchée par un clic n'importe où dans
 * l'app (menu, boutons, liens dans le contenu des pages...) — pas seulement
 * depuis la sidebar. Retourne un booléen que l'appelant utilise pour flouter
 * son propre contenu et afficher le popup de chargement, jusqu'à ce que la
 * nouvelle page soit prête (changement de pathname).
 */
export function useDetecteurNavigation(): boolean {
  const pathname = usePathname();
  const [navigationEnCours, setNavigationEnCours] = useState(false);

  useEffect(() => {
    setNavigationEnCours(false);
  }, [pathname]);

  useEffect(() => {
    if (!navigationEnCours) return;
    const t = setTimeout(() => setNavigationEnCours(false), 6000);
    return () => clearTimeout(t);
  }, [navigationEnCours]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Ne PAS vérifier e.defaultPrevented : <Link> de Next.js appelle
      // toujours preventDefault() pour intercepter la navigation côté
      // client — c'est justement le cas normal qu'on veut détecter ici.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const lien = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!lien) return;
      if (lien.target === "_blank" || lien.hasAttribute("download")) return;

      let url: URL;
      try { url = new URL(lien.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;

      setNavigationEnCours(true);
    }
    // Phase de capture : s'exécute avant le handler interne de <Link>,
    // pour ne jamais dépendre de l'ordre d'attachement des listeners.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return navigationEnCours;
}
