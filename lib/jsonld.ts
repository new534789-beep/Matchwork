/**
 * Génération des données structurées Schema.org (JSON-LD) pour le SEO.
 * - EMPLOI / STAGE → JobPosting (éligible Google for Jobs)
 * - FORMATION / ADMISSION → Course
 * - BOURSE / BOURSE_ETUDE / APPEL_PROJET → WebPage descriptive
 * Un fil d'Ariane (BreadcrumbList) est aussi fourni.
 */

import { detecterPays } from "./pays";

type OppJsonLd = {
  id: string;
  type: string;
  intitule: string;
  organisme: string;
  description: string;
  conditions?: string | null;
  dateLimite?: Date | null;
  datePublication?: Date | null;
  createdAt: Date;
  pays?: string | null;
};

export function buildOffreJsonLd(
  opp: OppJsonLd,
  url: string,
  expiree = false
): Record<string, unknown> {
  const datePosted = (opp.datePublication ?? opp.createdAt).toISOString().slice(0, 10);
  const validThrough = opp.dateLimite ? opp.dateLimite.toISOString() : undefined;

  // Offre expirée : Google exige de retirer le balisage JobPosting/Course actif
  // (au risque de pénaliser tout le domaine sur Google for Jobs) une fois la
  // position fermée. On garde la page vivante (SEO acquis) mais on redescend
  // en simple WebPage descriptive, sans prétendre que l'offre est encore ouverte.
  if (expiree) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${opp.intitule} (offre expirée)`,
      description: opp.description,
      url,
      provider: { "@type": "Organization", name: opp.organisme },
    };
  }

  // Emplois et stages : JobPosting.
  if (opp.type === "EMPLOI" || opp.type === "STAGE") {
    const pays = opp.pays ?? detecterPays(opp.intitule, opp.conditions, opp.description);
    const jp: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: opp.intitule,
      description: opp.description,
      datePosted,
      employmentType: opp.type === "STAGE" ? "INTERN" : "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: opp.organisme,
      },
      url,
      directApply: false,
    };
    if (validThrough) jp.validThrough = validThrough;
    if (pays) {
      jp.jobLocation = {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressCountry: pays },
      };
    } else {
      jp.applicantLocationRequirements = { "@type": "Country", name: "Afrique de l'Ouest" };
      jp.jobLocationType = "TELECOMMUTE";
    }
    return jp;
  }

  // Formations et admissions : Course.
  if (opp.type === "FORMATION" || opp.type === "ADMISSION") {
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      name: opp.intitule,
      description: opp.description,
      url,
      provider: {
        "@type": "Organization",
        name: opp.organisme,
      },
    };
  }

  // Bourses, appels à projets : page descriptive générique.
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opp.intitule,
    description: opp.description,
    url,
    provider: {
      "@type": "Organization",
      name: opp.organisme,
    },
  };
}

export function buildFaqJsonLd(items: { q: string; r: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.r },
    })),
  };
}

export function buildArticleJsonLd(article: {
  titre: string;
  description: string;
  datePublication: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titre,
    description: article.description,
    datePublished: article.datePublication,
    dateModified: article.datePublication,
    author: { "@type": "Organization", name: "Matchwork" },
    publisher: { "@type": "Organization", name: "Matchwork" },
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
