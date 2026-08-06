"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Bascule vers la vraie page d'accueil de l'application dès que le JavaScript
 * est prêt. `replace` et non `push` : /lancement ne doit pas rester dans
 * l'historique, sinon le bouton « retour » y ramènerait en boucle.
 */
export function Redirection({ vers }: { vers: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(vers);
  }, [router, vers]);

  return null;
}
