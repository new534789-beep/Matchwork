import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { PAYS_SEO, getPaysSeoBySlug } from "@/lib/pays";
import { CATEGORIES_SEO, getCategorieBySlug } from "@/lib/categories-seo";
import { MODALITES, LABEL_MODALITE, type Modalite } from "@/lib/modalite";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { ShellPublic } from "@/components/public/ShellPublic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string; modalite?: string }>;
};

function modaliteValide(v: string | undefined): Modalite | undefined {
  return MODALITES.find((m) => m === v);
}

export const revalidate = 3600;

// Pré-génère les pages pays connues.
export function generateStaticParams() {
  return PAYS_SEO.map((p) => ({ slug: p.slug }));
}

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { type, modalite } = await searchParams;
  const pays = getPaysSeoBySlug(slug);
  if (!pays) return { title: "Pays introuvable — Matchwork", robots: { index: false } };

  const cat = type ? getCategorieBySlug(type) : undefined;
  const mod = modaliteValide(modalite);
  const base = getSiteUrl();
  const params_ = new URLSearchParams();
  if (cat) params_.set("type", cat.slug);
  if (mod) params_.set("modalite", mod);
  const suffixe = params_.toString();
  const url = `${base}/offres/pays/${slug}${suffixe ? `?${suffixe}` : ""}`;

  const suffixeModalite = mod ? ` en ${LABEL_MODALITE[mod].toLowerCase()}` : "";
  const titre = cat
    ? `${cat.labelPluriel} au ${pays.nom}${suffixeModalite} | Matchwork`
    : `Bourses, emplois et stages au ${pays.nom}${suffixeModalite} | Matchwork`;
  const description = cat
    ? `${cat.labelPluriel} disponibles au ${pays.nom}${suffixeModalite}, vérifiées et mises à jour, avec dates limites et conditions.`
    : `Toutes les opportunités au ${pays.nom}${suffixeModalite} : bourses d'études, offres d'emploi, stages, formations et appels à projets, vérifiés et mis à jour.`;

  return {
    title: { absolute: titre },
    description,
    alternates: { canonical: url },
    openGraph: { title: titre, description, url, siteName: "Matchwork", locale: "fr_FR", type: "website" },
  };
}

export default async function OffresParPays({ params, searchParams }: Props) {
  const { slug } = await params;
  const { type, modalite } = await searchParams;
  const pays = getPaysSeoBySlug(slug);
  if (!pays) notFound();

  const cat = type ? getCategorieBySlug(type) : undefined;
  const mod = modaliteValide(modalite);
  const base = getSiteUrl();

  const offres = await prisma.opportunite.findMany({
    where: {
      actif: true,
      statut: "publiee",
      pays: pays.code,
      slug: { not: null },
      ...(cat ? { type: { in: cat.types } } : {}),
      ...(mod ? { modalite: mod } : {}),
    },
    select: { id: true, slug: true, type: true, organisme: true, intitule: true, dateLimite: true },
    orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const paysSlug = pays.slug;
  function avecFiltres(extra: Record<string, string>): string {
    const p = new URLSearchParams();
    if (cat) p.set("type", cat.slug);
    if (mod) p.set("modalite", mod);
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    const s = p.toString();
    return `/offres/pays/${paysSlug}${s ? `?${s}` : ""}`;
  }

  const jsonLdFil = buildBreadcrumbJsonLd([
    { name: "Accueil", url: `${base}/` },
    { name: "Offres", url: `${base}/offres` },
    { name: pays.nom, url: `${base}/offres/pays/${pays.slug}` },
    ...(cat ? [{ name: cat.labelPluriel, url: `${base}${avecFiltres({ type: cat.slug })}` }] : []),
    ...(mod ? [{ name: LABEL_MODALITE[mod], url: `${base}${avecFiltres({ modalite: mod })}` }] : []),
  ]);

  const titreVisible = cat ? `${cat.labelPluriel} au ${pays.nom}` : `Opportunités au ${pays.nom}`;

  return (
    <ShellPublic>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFil) }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 20px" }}>
        <nav aria-label="Fil d'Ariane" style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 16 }}>
          <Link href="/offres" style={{ color: "var(--text-3)", textDecoration: "none" }}>Offres</Link>
          <span> › {pays.nom}</span>
          {cat && <span> › {cat.labelPluriel}</span>}
        </nav>

        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.3rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 10 }}>
          {titreVisible}
        </h1>
        <p style={{ fontSize: "0.98rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 640, marginBottom: 24 }}>
          Bourses d&apos;études, offres d&apos;emploi, stages, formations et appels à projets disponibles au {pays.nom}, vérifiés et mis à jour.
        </p>

        {/* Filtres par catégorie, en query param lisible et indexable. */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <Link
            href={avecFiltres({ type: "" })}
            style={{
              fontSize: "0.8rem", fontWeight: 600, padding: "6px 14px", borderRadius: 20, textDecoration: "none",
              background: !cat ? "#7c3aed" : "var(--bg-card)", color: !cat ? "#fff" : "var(--text-2)",
              border: "1px solid " + (!cat ? "#7c3aed" : "var(--border)"),
            }}
          >
            Toutes catégories
          </Link>
          {CATEGORIES_SEO.map((c) => (
            <Link
              key={c.slug}
              href={avecFiltres({ type: c.slug })}
              style={{
                fontSize: "0.8rem", fontWeight: 600, padding: "6px 14px", borderRadius: 20, textDecoration: "none",
                background: cat?.slug === c.slug ? "#7c3aed" : "var(--bg-card)", color: cat?.slug === c.slug ? "#fff" : "var(--text-2)",
                border: "1px solid " + (cat?.slug === c.slug ? "#7c3aed" : "var(--border)"),
              }}
            >
              {c.labelPluriel}
            </Link>
          ))}
        </div>

        {/* Filtres par modalité, combinable avec la catégorie ci-dessus. */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          <Link
            href={avecFiltres({ modalite: "" })}
            style={{
              fontSize: "0.78rem", fontWeight: 600, padding: "5px 12px", borderRadius: 20, textDecoration: "none",
              background: !mod ? "var(--text)" : "var(--bg-card)", color: !mod ? "var(--bg)" : "var(--text-3)",
              border: "1px solid " + (!mod ? "var(--text)" : "var(--border)"),
            }}
          >
            Toutes modalités
          </Link>
          {MODALITES.map((m) => (
            <Link
              key={m}
              href={avecFiltres({ modalite: m })}
              style={{
                fontSize: "0.78rem", fontWeight: 600, padding: "5px 12px", borderRadius: 20, textDecoration: "none",
                background: mod === m ? "var(--text)" : "var(--bg-card)", color: mod === m ? "var(--bg)" : "var(--text-3)",
                border: "1px solid " + (mod === m ? "var(--text)" : "var(--border)"),
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
          <Link href={`/inscription?ref=pays:${pays.slug}`} style={{ display: "inline-flex", padding: "11px 26px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </ShellPublic>
  );
}
