import { prisma } from "@/lib/prisma";

/**
 * Récupère le profil actif d'un utilisateur (multi-profils Pro). Si aucun
 * profil n'est marqué actif — cas défensif, ne devrait pas arriver en usage
 * normal — retombe sur le premier profil créé, pour ne jamais planter un
 * appelant qui s'attend à « le » profil de l'utilisateur.
 */
export async function getProfilActif(userId: string) {
  const actif = await prisma.profil.findFirst({ where: { userId, actif: true } });
  if (actif) return actif;
  return prisma.profil.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
}

// `select` typé en `any` volontairement : le typage générique de Prisma
// (Prisma.ProfilSelect<S>) provoque une explosion combinatoire du compilateur
// TS sur ce repli à deux requêtes ; les appelants savent déjà ce qu'ils
// sélectionnent (même patron que les `as unknown as ...` déjà utilisés
// ailleurs dans le code pour les résultats Prisma).
/** Variante avec `select` — même logique de repli que getProfilActif. */
export async function getProfilActifSelect(
  userId: string,
  select: Record<string, boolean>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const actif = await prisma.profil.findFirst({ where: { userId, actif: true }, select });
  if (actif) return actif;
  return prisma.profil.findFirst({ where: { userId }, orderBy: { createdAt: "asc" }, select });
}

/**
 * Bascule le profil actif : désactive tous les autres profils de l'utilisateur
 * puis active la cible, en transaction pour ne jamais laisser 0 ou 2+ profils
 * actifs en cas d'échec partiel.
 */
export async function activerProfil(userId: string, profilId: string) {
  await prisma.$transaction([
    prisma.profil.updateMany({ where: { userId, actif: true }, data: { actif: false } }),
    prisma.profil.update({ where: { id: profilId }, data: { actif: true } }),
  ]);
}
