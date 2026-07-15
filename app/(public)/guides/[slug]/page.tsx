import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { GUIDES, getGuideBySlug } from "@/lib/guides";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { GuideLayout } from "@/components/public/GuideLayout";
import { LettreMotivationBourse } from "@/components/guides/LettreMotivationBourse";
import { CampusFranceGuide } from "@/components/guides/CampusFranceGuide";
import { CvPremierEmploi } from "@/components/guides/CvPremierEmploi";
import { NoteConceptuelleProjet } from "@/components/guides/NoteConceptuelleProjet";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide introuvable — Matchwork", robots: { index: false } };

  const url = `${getSiteUrl()}/guides/${slug}`;
  return {
    title: guide.titre,
    description: guide.description,
    keywords: guide.motsCles,
    alternates: { canonical: url },
    openGraph: {
      title: guide.titre,
      description: guide.description,
      url,
      type: "article",
      publishedTime: guide.datePublication,
      siteName: "Matchwork",
      locale: "fr_FR",
    },
  };
}

const CONTENUS: Record<string, () => React.ReactNode> = {
  "lettre-de-motivation-bourse-etude": LettreMotivationBourse,
  "bourse-campus-france-guide": CampusFranceGuide,
  "cv-premier-emploi-afrique-ouest": CvPremierEmploi,
  "note-conceptuelle-appel-projet": NoteConceptuelleProjet,
};

export default async function PageGuide({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  const Contenu = CONTENUS[slug];
  if (!guide || !Contenu) notFound();

  const base = getSiteUrl();
  const url = `${base}/guides/${slug}`;

  const jsonLdArticle = buildArticleJsonLd({
    titre: guide.titre,
    description: guide.description,
    datePublication: guide.datePublication,
    url,
  });
  const jsonLdFil = buildBreadcrumbJsonLd([
    { name: "Accueil", url: `${base}/` },
    { name: "Guides", url: `${base}/guides` },
    { name: guide.titreCourt, url },
  ]);

  return (
    <GuideLayout guide={guide}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFil) }} />
      <Contenu />
    </GuideLayout>
  );
}
