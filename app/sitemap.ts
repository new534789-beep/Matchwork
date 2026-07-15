import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { CATEGORIES_SEO } from "@/lib/categories-seo";
import { PAYS_SEO } from "@/lib/pays";
import { GUIDES } from "@/lib/guides";

// Régénère le sitemap au plus une fois par heure (les offres bougent souvent).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const maintenant = new Date();

  // Pages statiques principales.
  const statiques: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: maintenant, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/offres`, lastModified: maintenant, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/guides`, lastModified: maintenant, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/inscription`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/connexion`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Pages catégories publiques.
  const categories: MetadataRoute.Sitemap = CATEGORIES_SEO.map((c) => ({
    url: `${base}/offres/categorie/${c.slug}`,
    lastModified: maintenant,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Pages pays publiques.
  const pays: MetadataRoute.Sitemap = PAYS_SEO.map((p) => ({
    url: `${base}/offres/pays/${p.slug}`,
    lastModified: maintenant,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  // Guides éditoriaux.
  const guides: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: new Date(g.datePublication),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  // Offres publiées et actives + offres expirées (page gardée vivante,
  // priorité réduite, pour ne pas perdre le SEO déjà acquis sur l'URL).
  let offres: MetadataRoute.Sitemap = [];
  try {
    const rows = await prisma.opportunite.findMany({
      where: { statut: { in: ["publiee", "expiree"] }, slug: { not: null } },
      select: { slug: true, updatedAt: true, statut: true },
      orderBy: { updatedAt: "desc" },
      take: 45000, // marge sous la limite de 50 000 URLs par sitemap
    });
    offres = rows.map((o) => ({
      url: `${base}/offres/${o.slug}`,
      lastModified: o.updatedAt,
      changeFrequency: o.statut === "expiree" ? "monthly" : "weekly",
      priority: o.statut === "expiree" ? 0.3 : 0.6,
    }));
  } catch {
    // En cas d'indisponibilité DB, on renvoie au moins les pages statiques.
  }

  return [...statiques, ...categories, ...pays, ...guides, ...offres];
}
