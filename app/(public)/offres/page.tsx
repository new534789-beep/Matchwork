import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { CATEGORIES_SEO } from "@/lib/categories-seo";
import { PAYS_SEO } from "@/lib/pays";
import { ShellPublic } from "@/components/public/ShellPublic";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const url = `${getSiteUrl()}/offres`;
  const title = "Bourses, emplois et opportunités en Afrique de l'Ouest | Matchwork";
  const description =
    "Parcourez toutes les opportunités pour l'Afrique de l'Ouest : bourses d'études, offres d'emploi, stages, formations et appels à projets. Mises à jour et vérifiées.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Matchwork", locale: "fr_FR", type: "website" },
  };
}

export default async function HubOffres() {
  // Compte les offres par catégorie pour afficher des volumes réels.
  const counts = await prisma.opportunite.groupBy({
    by: ["type"],
    where: { actif: true, statut: "publiee" },
    _count: true,
  });
  const parType = new Map(counts.map((c) => [c.type, c._count]));
  const compter = (types: string[]) => types.reduce((n, t) => n + (parType.get(t) ?? 0), 0);

  return (
    <ShellPublic>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 20px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: 12, maxWidth: 700 }}>
          Toutes vos opportunités en Afrique de l&apos;Ouest
        </h1>
        <p style={{ fontSize: "1.02rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 620, marginBottom: 34 }}>
          Bourses d&apos;études, offres d&apos;emploi, stages, formations et appels à projets — vérifiés et mis à jour, avec dates limites et conditions. Générez ensuite votre dossier avec l&apos;IA.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {CATEGORIES_SEO.map((c) => {
            const n = compter(c.types);
            return (
              <Link
                key={c.slug}
                href={`/offres/categorie/${c.slug}`}
                style={{ display: "block", padding: "20px 18px", borderRadius: 15, background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none" }}
              >
                <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>{c.labelPluriel}</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)", lineHeight: 1.5, marginBottom: 10 }}>
                  {c.introduction.split(".")[0]}.
                </p>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#7c3aed" }}>
                  {n > 0 ? `${n} offre${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""}` : "Bientôt disponible"} →
                </span>
              </Link>
            );
          })}
        </div>

        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", marginTop: 40, marginBottom: 14 }}>
          Parcourir par pays
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PAYS_SEO.map((p) => (
            <Link
              key={p.slug}
              href={`/offres/pays/${p.slug}`}
              style={{ fontSize: "0.82rem", fontWeight: 600, padding: "7px 15px", borderRadius: 20, textDecoration: "none", background: "var(--bg-card)", color: "var(--text-2)", border: "1px solid var(--border)" }}
            >
              {p.nom}
            </Link>
          ))}
        </div>
      </div>
    </ShellPublic>
  );
}
