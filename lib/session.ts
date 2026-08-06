import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * Résout la session Auth.js une seule fois par requête HTTP.
 *
 * Sans mémorisation, le layout de l'espace connecté ET la page résolvent chacun
 * `auth()` (déchiffrage JWT) — soit deux résolutions pour une seule navigation.
 * React `cache()` mémorise la valeur pendant le rendu : les appels suivants de
 * la même requête sont gratuits.
 */
export const sessionCourante = cache(async () => {
  return await auth();
});

/** Utilisateur de la session courante (null si non connecté), mémorisé par requête. */
export const getUtilisateurCourant = cache(async () => {
  const session = await sessionCourante();
  return session?.user ?? null;
});
