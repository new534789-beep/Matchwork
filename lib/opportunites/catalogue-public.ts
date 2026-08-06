import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Listes d'offres des pages publiques (catégories et pays), mises en cache.
 *
 * Pourquoi ce module existe : ces pages déclarent `revalidate = 3600`, mais ce
 * réglage n'a jamais eu d'effet. Elles lisent un paramètre d'URL
 * (`?modalite=`, `?type=`), ce qui bascule la route en rendu dynamique — Next
 * ne met alors plus la page en cache du tout. Résultat mesuré : environ deux
 * secondes par visite, sans amélioration au fil des appels, chaque visiteur
 * déclenchant une interrogation complète de la base.
 *
 * On ne cherche pas à rendre la page statique (le filtre resterait à traiter) :
 * on met en cache le *résultat de la requête*, par combinaison de filtres. La
 * page reste dynamique et rapide, la base n'est plus sollicitée.
 *
 * L'invalidation passe par le tag « opportunites », déjà déclenché depuis
 * l'extension Prisma à chaque publication d'offre — quel que soit le point
 * d'entrée (robot d'ingestion, admin, « coller une offre »).
 */

const DUREE_CACHE_SEC = 3600;
const TAILLE_LISTE = 100;

const CHAMPS = {
  id: true,
  slug: true,
  type: true,
  organisme: true,
  intitule: true,
  dateLimite: true,
} as const;

/**
 * `dateLimite` traverse le cache : elle en ressort sérialisée. On la normalise
 * donc en chaîne ISO dès la sortie de la base, pour que le type annoncé
 * corresponde à ce que reçoit réellement l'appelant — un `Date` déclaré ici
 * serait une chaîne à l'exécution, et `toLocaleDateString` planterait.
 */
export type LigneCatalogue = {
  id: string;
  slug: string | null;
  type: string;
  organisme: string;
  intitule: string;
  dateLimite: string | null;
};

type Ligne = {
  id: string;
  slug: string | null;
  type: string;
  organisme: string;
  intitule: string;
  dateLimite: Date | null;
};

function normaliser(lignes: Ligne[]): LigneCatalogue[] {
  return lignes.map((o) => ({
    ...o,
    dateLimite: o.dateLimite ? o.dateLimite.toISOString() : null,
  }));
}

/** Offres d'une catégorie SEO, filtrées éventuellement par modalité. */
export function offresDeCategorie(
  slugCategorie: string,
  types: readonly string[],
  modalite?: string
): Promise<LigneCatalogue[]> {
  return unstable_cache(
    async () => {
      const lignes = await prisma.opportunite.findMany({
        where: {
          actif: true,
          statut: "publiee",
          type: { in: [...types] },
          slug: { not: null },
          ...(modalite ? { modalite } : {}),
        },
        select: CHAMPS,
        orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
        take: TAILLE_LISTE,
      });
      return normaliser(lignes);
    },
    ["catalogue-categorie", slugCategorie, modalite ?? "toutes"],
    { revalidate: DUREE_CACHE_SEC, tags: ["opportunites", `opportunites-categorie-${slugCategorie}`] }
  )();
}

/** Offres d'un pays, filtrées éventuellement par catégorie et par modalité. */
export function offresDePays(
  codePays: string,
  slugPays: string,
  types?: readonly string[],
  modalite?: string
): Promise<LigneCatalogue[]> {
  return unstable_cache(
    async () => {
      const lignes = await prisma.opportunite.findMany({
        where: {
          actif: true,
          statut: "publiee",
          pays: codePays,
          slug: { not: null },
          ...(types ? { type: { in: [...types] } } : {}),
          ...(modalite ? { modalite } : {}),
        },
        select: CHAMPS,
        orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
        take: TAILLE_LISTE,
      });
      return normaliser(lignes);
    },
    ["catalogue-pays", slugPays, types ? [...types].join(",") : "tous", modalite ?? "toutes"],
    { revalidate: DUREE_CACHE_SEC, tags: ["opportunites", `opportunites-pays-${slugPays}`] }
  )();
}

/** Formate une date ISO issue du cache pour l'affichage. */
export function formatDateCatalogue(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
