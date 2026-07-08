import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Renvoie la session si l'utilisateur courant est admin, sinon null.
 * Vérifie le rôle en base (pas uniquement le JWT).
 */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "admin") return null;
  return session;
}

/**
 * Enregistre une action admin dans le journal d'audit (table journal_admin).
 * À appeler après chaque mutation effectuée via une route /api/admin/*.
 */
export async function journaliserActionAdmin(
  adminId: string,
  action: string,
  cible?: string,
  details?: unknown
) {
  await prisma.journalAdmin.create({
    data: {
      adminId,
      action,
      cible: cible ?? null,
      details: details !== undefined ? JSON.stringify(details) : null,
    },
  });
}
