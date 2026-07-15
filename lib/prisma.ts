import { PrismaClient } from "@prisma/client";
import { genererSlugOpportunite } from "./slug";
import { detecterPays } from "./pays";
import { detecterModalite } from "./modalite";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientExtended };

const base = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

type DonneesOpportunite = {
  slug?: string | null;
  pays?: string | null;
  modalite?: string | null;
  intitule?: unknown;
  organisme?: unknown;
  description?: unknown;
  conditions?: unknown;
};

function completerChampsAutoDetectes(d: DonneesOpportunite) {
  if (!d.slug) {
    d.slug = genererSlugOpportunite(String(d.intitule ?? ""), String(d.organisme ?? ""));
  }
  const intitule = typeof d.intitule === "string" ? d.intitule : null;
  const conditions = typeof d.conditions === "string" ? d.conditions : null;
  const description = typeof d.description === "string" ? d.description : null;
  if (d.pays === undefined) {
    d.pays = detecterPays(intitule, conditions, description);
  }
  if (d.modalite === undefined) {
    d.modalite = detecterModalite(intitule, conditions, description);
  }
}

// Auto-génère le slug SEO public et détecte le pays d'une Opportunite à la
// création, quel que soit le point d'entrée (admin, ingestion RSS, scraping,
// "coller une offre", seeds) — évite de dupliquer la logique dans chaque site
// d'appel (~19 endroits font prisma.opportunite.create/createMany).
const withSlug = base.$extends({
  query: {
    opportunite: {
      async create({ args, query }) {
        completerChampsAutoDetectes(args.data);
        return query(args);
      },
      async createMany({ args, query }) {
        const data = Array.isArray(args.data) ? args.data : [args.data];
        for (const d of data) completerChampsAutoDetectes(d);
        return query(args);
      },
    },
  },
});

type PrismaClientExtended = typeof withSlug;

export const prisma: PrismaClientExtended = globalForPrisma.prisma ?? withSlug;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
