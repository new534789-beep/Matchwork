import { auth } from "@/lib/auth";

/**
 * Renvoie la session si l'utilisateur courant est admin, sinon null.
 * À utiliser dans toutes les routes API sous /api/admin.
 */
export async function getAdminSession() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "admin") return null;
  return session;
}
