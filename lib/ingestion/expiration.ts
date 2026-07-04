import { prisma } from "@/lib/prisma";

/**
 * Passe en `expiree` (et retire du fil public) toute opportunité publiée
 * dont la date limite est dépassée. Renvoie le nombre d'opportunités retirées.
 */
export async function retirerExpirees(): Promise<number> {
  const res = await prisma.opportunite.updateMany({
    where: { statut: "publiee", dateLimite: { lt: new Date() } },
    data: { statut: "expiree", actif: false },
  });
  return res.count;
}
