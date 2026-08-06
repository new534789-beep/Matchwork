import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { BlogLayout } from "@/components/public/BlogLayout";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: { opportunite: { select: { slug: true, intitule: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.statut !== "publie") {
    return { title: "Article introuvable — Matchwork", robots: { index: false } };
  }

  const url = `${getSiteUrl()}/blog/${slug}`;
  const title = article.seoTitre || article.titre;
  const description = article.seoDescription || article.extrait;
  let motsCles: string[] = [];
  try {
    motsCles = JSON.parse(article.motsCles);
  } catch {
    motsCles = [];
  }

  // Bannière générée automatiquement par catégorie (voir app/api/og/blog/[slug])
  // tant qu'aucune image personnalisée n'a été renseignée sur l'article.
  const image = article.imageCouverture || `${getSiteUrl()}/api/og/blog/${slug}`;

  return {
    title,
    description,
    keywords: motsCles.length ? motsCles : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publieLe.toISOString(),
      siteName: "Matchwork",
      locale: "fr_FR",
      images: [image],
    },
  };
}

export default async function PageArticle({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.statut !== "publie") notFound();

  const base = getSiteUrl();
  const url = `${base}/blog/${slug}`;

  const jsonLdArticle = buildArticleJsonLd({
    titre: article.titre,
    description: article.extrait,
    datePublication: article.publieLe.toISOString(),
    url,
  });
  const jsonLdFil = buildBreadcrumbJsonLd([
    { name: "Accueil", url: `${base}/` },
    { name: "Blog", url: `${base}/blog` },
    { name: article.titre, url },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFil) }} />
      <BlogLayout article={article} image={article.imageCouverture || `/api/og/blog/${slug}`} />
    </>
  );
}
