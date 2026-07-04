import { prisma } from "@/lib/prisma";
import { CLES_PARAMETRES } from "@/lib/parametres-cles";

/**
 * Réglages globaux du SaaS (table `parametres`, clé/valeur).
 * Chaque lecture retombe sur une valeur par défaut (souvent une variable d'env)
 * si le réglage n'a pas été défini en base.
 */

export { CLES_PARAMETRES };

export async function getParametre(cle: string, defaut = ""): Promise<string> {
  const p = await prisma.parametre.findUnique({ where: { cle } });
  return p?.valeur ?? defaut;
}

export async function getParametres(cles: string[]): Promise<Record<string, string | null>> {
  const rows = await prisma.parametre.findMany({ where: { cle: { in: cles } } });
  const map: Record<string, string | null> = {};
  for (const c of cles) map[c] = rows.find((r) => r.cle === c)?.valeur ?? null;
  return map;
}

export async function setParametre(cle: string, valeur: string) {
  return prisma.parametre.upsert({
    where: { cle },
    update: { valeur },
    create: { cle, valeur },
  });
}

/** Quota gratuit mensuel effectif : réglage base → variable d'env → 3. */
export async function getQuotaGratuit(): Promise<number> {
  const val = await getParametre(CLES_PARAMETRES.quotaGratuitDefaut, "");
  const n = parseInt(val || process.env.QUOTA_GRATUIT_MENSUEL || "3", 10);
  return Number.isFinite(n) && n > 0 ? n : 3;
}
