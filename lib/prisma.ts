import { PrismaClient } from "@prisma/client";
import { genererSlugOpportunite, genererSlugArticle } from "./slug";
import { detecterPays } from "./pays";
import { detecterModalite } from "./modalite";
import { classifierDomaines } from "./ia/classification-domaines";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientExtended };

const base = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

type DonneesOpportunite = {
  slug?: string | null;
  pays?: string | null;
  modalite?: string | null;
  domaines?: string | null;
  statut?: unknown;
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

// Classe le domaine (droit, maths-info, santé...) UNIQUEMENT au moment où
// l'offre est/devient "publiee" — jamais à la simple création — pour ne pas
// payer un appel IA sur une offre qui ne sera jamais publiée (rejetée, doublon,
// en file d'attente). Fail-open : ne bloque jamais la publication.
async function classerDomainesSiPubliee(d: DonneesOpportunite) {
  const seraPubliee = d.statut === undefined || d.statut === "publiee";
  if (!seraPubliee || d.domaines !== undefined) return;
  const intitule = typeof d.intitule === "string" ? d.intitule : "";
  const description = typeof d.description === "string" ? d.description : "";
  const conditions = typeof d.conditions === "string" ? d.conditions : null;
  if (!intitule) return;
  const domaines = await classifierDomaines({ intitule, description, conditions });
  if (domaines) d.domaines = JSON.stringify(domaines);
}

// Même logique que ci-dessus, mais pour une mise à jour de statut vers
// "publiee" où le texte de l'offre n'est pas forcément dans `data` (ex. le
// cron d'auto-validation ne fait qu'un `update({ data: { statut: "publiee" } })`).
// Va chercher le texte et le domaine actuel en base si besoin.
async function classerDomainesSurPublicationUpdate(
  base: PrismaClient,
  where: { id?: string } | undefined,
  data: DonneesOpportunite
) {
  if (data.statut !== "publiee" || data.domaines !== undefined || !where?.id) return;
  const actuelle = await base.opportunite.findUnique({
    where: { id: where.id },
    select: { intitule: true, description: true, conditions: true, domaines: true },
  });
  if (!actuelle || (actuelle.domaines && actuelle.domaines !== "[]")) return;
  const domaines = await classifierDomaines({
    intitule: actuelle.intitule,
    description: actuelle.description,
    conditions: actuelle.conditions,
  });
  if (domaines) data.domaines = JSON.stringify(domaines);
}

type DonneesArticle = { slug?: string | null; titre?: unknown };

// Le slug d'un article n'est jamais fourni par l'appelant (Make ou l'admin) :
// toujours régénéré côté serveur à partir du titre, pour rester la seule
// source de vérité sur les URLs publiques.
function completerSlugArticle(d: DonneesArticle) {
  d.slug = genererSlugArticle(String(d.titre ?? ""));
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
        await classerDomainesSiPubliee(args.data);
        return query(args);
      },
      async createMany({ args, query }) {
        const data = Array.isArray(args.data) ? args.data : [args.data];
        for (const d of data) {
          completerChampsAutoDetectes(d);
          await classerDomainesSiPubliee(d);
        }
        return query(args);
      },
      async update({ args, query }) {
        await classerDomainesSurPublicationUpdate(base, args.where, args.data as DonneesOpportunite);
        return query(args);
      },
    },
    article: {
      async create({ args, query }) {
        completerSlugArticle(args.data);
        return query(args);
      },
      async createMany({ args, query }) {
        const data = Array.isArray(args.data) ? args.data : [args.data];
        for (const d of data) completerSlugArticle(d);
        return query(args);
      },
    },
  },
});

type PrismaClientExtended = typeof withSlug;

export const prisma: PrismaClientExtended = globalForPrisma.prisma ?? withSlug;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
