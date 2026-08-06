import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const TAILLE_CATALOGUE = 200;
const DUREE_CACHE_SEC = 3600;
const TAILLE_FIL = 50;

export type LigneOpportunite = {
  id: string;
  type: string;
  organisme: string;
  intitule: string;
  description: string;
  langueDetectee: string | null;
  conditions: string | null;
  piecesExigees: string;
  exigenceLangue: string | null;
  dateLimite: string | null;
  lien: string | null;
  source: string;
};

function catalogueType(type: string): Promise<LigneOpportunite[]> {
  return unstable_cache(
    async () => {
      const lignes = await prisma.opportunite.findMany({
        where: { type, actif: true, statut: "publiee" },
        orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
        take: TAILLE_CATALOGUE,
        select: {
          id: true, type: true, organisme: true, intitule: true, description: true,
          langueDetectee: true, conditions: true, piecesExigees: true,
          exigenceLangue: true, dateLimite: true, lien: true, source: true,
        },
      });
      return lignes.map((o) => ({
        ...o,
        dateLimite: o.dateLimite ? o.dateLimite.toISOString() : null,
      }));
    },
    ["fil-opportunites", type],
    { revalidate: DUREE_CACHE_SEC, tags: ["opportunites", `opportunites-${type}`] }
  )();
}

async function idsInteragis(userId: string): Promise<Set<string>> {
  const lignes = await prisma.interaction.findMany({
    where: { userId },
    select: { opportuniteId: true },
    distinct: ["opportuniteId"],
  });
  return new Set(lignes.map((l) => l.opportuniteId));
}

export async function obtenirFilOpportunites(userId: string, type: string): Promise<LigneOpportunite[]> {
  const [catalogue, dejaVus] = await Promise.all([catalogueType(type), idsInteragis(userId)]);
  return catalogue.filter((o) => !dejaVus.has(o.id)).slice(0, TAILLE_FIL);
}
