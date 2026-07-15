import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { LABEL_TYPE } from "@/lib/opportunites";
import { slugForType, getCategorieBySlug } from "@/lib/categories-seo";
import { buildOffreJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { ShellPublic } from "@/components/public/ShellPublic";

type Props = { params: Promise<{ slug: string }> };

// Les offres bougent : on régénère la page au plus une fois par heure.
export const revalidate = 3600;

async function getOffrePublique(slug: string) {
  // On garde les offres expirées visibles (SEO acquis) : seules a_valider /
  // revue_manuelle / rejetee restent hors du public.
  return prisma.opportunite.findFirst({
    where: { slug, statut: { in: ["publiee", "expiree"] } },
    select: {
      id: true, slug: true, type: true, organisme: true, intitule: true, description: true,
      conditions: true, exigenceLangue: true, langueDetectee: true, statut: true,
      piecesExigees: true, dateLimite: true, datePublication: true, createdAt: true,
    },
  });
}

async function getOffresSimilaires(type: string, excluId: string) {
  return prisma.opportunite.findMany({
    where: { type, actif: true, statut: "publiee", id: { not: excluId }, slug: { not: null } },
    select: { id: true, slug: true, intitule: true, organisme: true, dateLimite: true },
    orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
    take: 4,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOffrePublique(slug);
  if (!opp) return { title: "Offre introuvable — Matchwork", robots: { index: false } };

  const base = getSiteUrl();
  const url = `${base}/offres/${opp.slug}`;
  const expiree = opp.statut === "expiree";
  // Le layout racine applique le template "%s | Matchwork" → ne pas le répéter ici.
  const title = expiree
    ? `${opp.intitule} — ${opp.organisme} (offre expirée)`
    : `${opp.intitule} — ${opp.organisme}`;
  const description = expiree
    ? `Cette offre est expirée. ${opp.description}`.slice(0, 160).trim()
    : opp.description.slice(0, 160).trim();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Matchwork`,
      description,
      type: "article",
      url,
      siteName: "Matchwork",
      locale: "fr_FR",
      images: [{ url: `${base}/api/og/${opp.id}`, width: 1200, height: 630, alt: opp.intitule }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${base}/api/og/${opp.id}`],
    },
  };
}

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function OffrePublique({ params }: Props) {
  const { slug } = await params;
  const opp = await getOffrePublique(slug);
  if (!opp) notFound();

  const expiree = opp.statut === "expiree";
  const similaires = expiree ? await getOffresSimilaires(opp.type, opp.id) : [];

  const base = getSiteUrl();
  const url = `${base}/offres/${opp.slug}`;
  const catSlug = slugForType(opp.type);
  const cat = catSlug ? getCategorieBySlug(catSlug) : undefined;
  const dateLimite = formatDate(opp.dateLimite);

  const pieces: { nom: string; obligatoire?: boolean }[] = (() => {
    try { return JSON.parse(opp.piecesExigees); } catch { return []; }
  })();

  const jsonLdOffre = buildOffreJsonLd(opp, url, expiree);
  const jsonLdFil = buildBreadcrumbJsonLd([
    { name: "Accueil", url: `${base}/` },
    { name: "Offres", url: `${base}/offres` },
    ...(cat ? [{ name: cat.labelPluriel, url: `${base}/offres/categorie/${cat.slug}` }] : []),
    { name: opp.intitule, url },
  ]);

  return (
    <ShellPublic>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOffre) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFil) }} />

      <article style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 20px" }}>
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 18 }}>
          <Link href="/offres" style={{ color: "var(--text-3)", textDecoration: "none" }}>Offres</Link>
          {cat && (
            <>
              <span>›</span>
              <Link href={`/offres/categorie/${cat.slug}`} style={{ color: "var(--text-3)", textDecoration: "none" }}>{cat.labelPluriel}</Link>
            </>
          )}
        </nav>

        {expiree && (
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", marginBottom: 18 }}>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#dc2626", margin: 0 }}>
              Cette offre est expirée — la date limite de candidature est dépassée.
            </p>
          </div>
        )}

        <span style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7c3aed", background: "rgba(124,58,237,0.1)", padding: "4px 11px", borderRadius: 7, marginBottom: 14 }}>
          {LABEL_TYPE[opp.type] ?? opp.type}
        </span>

        <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 8 }}>
          {opp.intitule}
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--text-2)", marginBottom: 20 }}>{opp.organisme}</p>

        {/* Méta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {dateLimite && (
            <span style={{ fontSize: "0.82rem", color: "var(--text-2)", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: 9 }}>
              Date limite : <strong style={{ color: "var(--text)" }}>{dateLimite}</strong>
            </span>
          )}
          {opp.exigenceLangue && (
            <span style={{ fontSize: "0.82rem", color: "var(--text-2)", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: 9 }}>
              Langue : {opp.exigenceLangue}
            </span>
          )}
        </div>

        {/* Description */}
        <div style={{ fontSize: "0.95rem", color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 26 }}>
          {opp.description}
        </div>

        {opp.conditions && (
          <section style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Conditions d&apos;éligibilité</h2>
            <div style={{ fontSize: "0.92rem", color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{opp.conditions}</div>
          </section>
        )}

        {pieces.length > 0 && (
          <section style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Pièces à fournir</h2>
            <ul style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 18 }}>
              {pieces.map((p, i) => (
                <li key={i} style={{ fontSize: "0.9rem", color: "var(--text-2)", lineHeight: 1.5 }}>{p.nom}</li>
              ))}
            </ul>
          </section>
        )}

        {expiree && similaires.length > 0 && (
          <section style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
              Offres similaires encore ouvertes
            </h2>
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", padding: 0 }}>
              {similaires.map((s) => {
                const dl = formatDate(s.dateLimite);
                return (
                  <li key={s.id}>
                    <Link
                      href={`/offres/${s.slug}`}
                      style={{ display: "block", padding: "13px 16px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none" }}
                    >
                      <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginBottom: 3 }}>{s.organisme}</p>
                      <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.35 }}>{s.intitule}</p>
                      {dl && <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 4 }}>Date limite : {dl}</p>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* CTA conversion */}
        <div style={{ marginTop: 30, padding: "24px 22px", borderRadius: 16, background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.03))", border: "1px solid rgba(124,58,237,0.25)", textAlign: "center" }}>
          {expiree ? (
            <>
              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Ne manquez pas la prochaine offre
              </p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
                Créez un compte gratuit pour être alerté dès qu&apos;une offre correspondant à votre profil est publiée, et générer votre dossier avec l&apos;IA en quelques minutes.
              </p>
              <Link
                href={`/inscription?ref=offre:${opp.slug}`}
                style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.92rem", textDecoration: "none", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}
              >
                Créer mon compte gratuitement
              </Link>
            </>
          ) : (
            <>
              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Candidatez à cette offre avec un dossier généré par l&apos;IA
              </p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
                Matchwork rédige votre CV et votre lettre de motivation personnalisés pour cette offre en quelques minutes.
              </p>
              <Link
                href={`/inscription?ref=offre:${opp.slug}`}
                style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.92rem", textDecoration: "none", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}
              >
                Créer mon dossier gratuitement
              </Link>
            </>
          )}
        </div>
      </article>
    </ShellPublic>
  );
}
