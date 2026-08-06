import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

/** Lecture utilisateur dédupliquée : champs utiles au rendu, jamais de secret (motDePasse, tokens). */
export type UserLecture = {
  id: string;
  email: string;
  plan: string;
  role: string;
  suspendu: boolean;
  createdAt: Date;
};

/**
 * Utilisateur en base, mémorisé par requête : le layout et la page (voire un
 * panneau Suspense) qui lisent le même utilisateur partagent une seule requête
 * au lieu d'une par `select` différent. Retourne null si l'utilisateur n'existe
 * plus — aucun secret (motDePasse, resetToken*) n'est sélectionné.
 */
export const getUtilisateur = cache(async (userId: string): Promise<UserLecture | null> => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, plan: true, role: true, suspendu: true, createdAt: true },
  });
});
