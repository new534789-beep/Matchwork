import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { ShellPublic } from "@/components/public/ShellPublic";

export const revalidate = 3600;

const LABEL_CATEGORIE: Record<string, string> = {
  actualite: "Actualité",
  bourses: "Bourses",
  candidature: "Candidature",
  emploi: "Emploi",
  projets: "Appels à projets",
};

export function generateMetadata(): Metadata {
  const url = `${getSiteUrl()}/blog`;
  const title = "Blog : actualités bourses, emploi et candidatures en Afrique de l'Ouest | Matchwork";
  const description =
    "Actualités et conseils sur les bourses, opportunités d'emploi et candidatures en Afrique de l'Ouest, mis à jour au fil des nouvelles offres publiées sur Matchwork.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Matchwork", locale: "fr_FR", type: "website" },
  };
}

export default async function ListeBlog() {
  const articles = await prisma.article
    .findMany({
      where: { statut: "publie" },
      orderBy: { publieLe: "desc" },
      select: { slug: true, titre: true, extrait: true, categorie: true, publieLe: true, imageCouverture: true },
      take: 60,
    })
    .catch(() => []);

  return (
    <ShellPublic>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 20px" }}>
        <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 12, maxWidth: 640 }}>
          Le blog Matchwork
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 580, marginBottom: 34 }}>
          Actualités, bourses et opportunités commentées pour l&apos;Afrique de l&apos;Ouest.
        </p>

        {articles.length === 0 ? (
          <p style={{ color: "var(--text-3)", fontSize: "0.9rem" }}>Aucun article publié pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                style={{ display: "flex", gap: 18, alignItems: "stretch", padding: 14, borderRadius: 15, background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none" }}
              >
                <div className="blog-thumb" style={{ flex: "0 0 160px", borderRadius: 10, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.imageCouverture || `/api/og/blog/${a.slug}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "8px 6px", flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 8 }}>
                    {LABEL_CATEGORIE[a.categorie ?? "actualite"] ?? a.categorie} · {a.publieLe.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.35, marginBottom: 8 }}>
                    {a.titre}
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-3)", lineHeight: 1.55 }}>
                    {a.extrait}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .blog-thumb { display: none; }
        @media (min-width: 640px) {
          .blog-thumb { display: block; }
        }
      `}</style>
    </ShellPublic>
  );
}
