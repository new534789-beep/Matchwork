import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { LABEL_TYPE } from "@/lib/opportunites";
import { CATEGORIES_SEO, getCategorieBySlug } from "@/lib/categories-seo";
import { MODALITES, LABEL_MODALITE, type Modalite } from "@/lib/modalite";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { ShellPublic } from "@/components/public/ShellPublic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ modalite?: string }>;
};

export const revalidate = 3600;

// Pré-génère les pages catégories connues.
export function generateStaticParams() {
  return CATEGORIES_SEO.map((c) => ({ slug: c.slug }));
}

function modaliteValide(v: string | undefined): Modalite | undefined {
  return MODALITES.find((m) => m === v);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { modalite } = await searchParams;
  const cat = getCategorieBySlug(slug);
  if (!cat) return { title: "Catégorie introuvable — Matchwork", robots: { index: false } };

  const mod = modaliteValide(modalite);
  const base = getSiteUrl();
  const url = mod
    ? `${base}/offres/categorie/${slug}?modalite=${mod}`
    : `${base}/offres/categorie/${slug}`;
  const titre = mod ? `${cat.labelPluriel} — ${LABEL_MODALITE[mod]} | Matchwork` : cat.titre;
  const description = mod
    ? `${cat.labelPluriel} en ${LABEL_MODALITE[mod].toLowerCase()}. ${cat.description}`
    : cat.description;

  return {
    // Titre déjà complet (inclut « | Matchwork ») → on court-circuite le template racine.
    title: { absolute: titre },
    description,
    alternates: { canonical: url },
    openGraph: { title: titre, description, url, siteName: "Matchwork", locale: "fr_FR", type: "website" },
  };
}

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default async function CategoriePublique({ params, searchParams }: Props) {
  const { slug } = await params;
  const { modalite } = await searchParams;
  const cat = getCategorieBySlug(slug);
  if (!cat) notFound();

  const mod = modaliteValide(modalite);
  const base = getSiteUrl();
  const offres = await prisma.opportunite.findMany({
    where: {
      actif: true,
      statut: "publiee",
      type: { in: cat.types },
      slug: { not: null },
      ...(mod ? { modalite: mod } : {}),
    },
    select: { id: true, slug: true, type: true, organisme: true, intitule: true, dateLimite: true },
    orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const jsonLdFil = buildBreadcrumbJsonLd([
    { name: "Accueil", url: `${base}/` },
    { name: "Offres", url: `${base}/offres` },
    { name: cat.labelPluriel, url: `${base}/offres/categorie/${cat.slug}` },
    ...(mod ? [{ name: LABEL_MODALITE[mod], url: `${base}/offres/categorie/${cat.slug}?modalite=${mod}` }] : []),
  ]);

  return (
    <ShellPublic>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFil) }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 20px" }}>
        <nav aria-label="Fil d'Ariane" style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 16 }}>
          <Link href="/offres" style={{ color: "var(--text-3)", textDecoration: "none" }}>Offres</Link>
          <span> › {cat.labelPluriel}</span>
        </nav>

        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.3rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 10 }}>
          {cat.h1}
        </h1>
        <p style={{ fontSize: "0.98rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 640, marginBottom: 20 }}>
          {cat.introduction}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          <Link
            href={`/offres/categorie/${cat.slug}`}
            style={{
              fontSize: "0.8rem", fontWeight: 600, padding: "6px 14px", borderRadius: 20, textDecoration: "none",
              background: !mod ? "#7c3aed" : "var(--bg-card)", color: !mod ? "#fff" : "var(--text-2)",
              border: "1px solid " + (!mod ? "#7c3aed" : "var(--border)"),
            }}
          >
            Toutes modalités
          </Link>
          {MODALITES.map((m) => (
            <Link
              key={m}
              href={`/offres/categorie/${cat.slug}?modalite=${m}`}
              style={{
                fontSize: "0.8rem", fontWeight: 600, padding: "6px 14px", borderRadius: 20, textDecoration: "none",
                background: mod === m ? "#7c3aed" : "var(--bg-card)", color: mod === m ? "#fff" : "var(--text-2)",
                border: "1px solid " + (mod === m ? "#7c3aed" : "var(--border)"),
              }}
            >
              {LABEL_MODALITE[m]}
            </Link>
          ))}
        </div>

        {offres.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "var(--text-3)" }}>Aucune offre disponible pour le moment. Revenez bientôt.</p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
            {offres.map((o) => {
              const dl = formatDate(o.dateLimite);
              return (
                <li key={o.id}>
                  <Link
                    href={`/offres/${o.slug}`}
                    style={{ display: "block", padding: "16px 18px", borderRadius: 13, background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none", transition: "border-color 0.15s ease" }}
                  >
                    <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: 4 }}>{o.organisme}</p>
                    <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.35, marginBottom: dl ? 6 : 0 }}>{o.intitule}</p>
                    {dl && <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Date limite : {dl}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div style={{ marginTop: 32, padding: "22px", borderRadius: 16, background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.03))", border: "1px solid rgba(124,58,237,0.25)", textAlign: "center" }}>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
            Générez vos dossiers de candidature en quelques minutes
          </p>
          <Link href={`/inscription?ref=categorie:${cat.slug}`} style={{ display: "inline-flex", padding: "11px 26px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </ShellPublic>
  );
}
