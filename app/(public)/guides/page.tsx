import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";
import { GUIDES } from "@/lib/guides";
import { ShellPublic } from "@/components/public/ShellPublic";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const url = `${getSiteUrl()}/guides`;
  const title = "Guides : bourses, candidatures et emploi en Afrique de l'Ouest | Matchwork";
  const description =
    "Conseils pratiques pour candidater à une bourse, rédiger un CV ou une lettre de motivation, et monter un dossier de financement en Afrique de l'Ouest.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Matchwork", locale: "fr_FR", type: "website" },
  };
}

export default function ListeGuides() {
  return (
    <ShellPublic>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 20px" }}>
        <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 12, maxWidth: 640 }}>
          Guides pour candidater sans stress
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 580, marginBottom: 34 }}>
          Des conseils concrets pour vos bourses, CV, lettres de motivation et dossiers de financement — écrits pour l&apos;Afrique de l&apos;Ouest.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              style={{ display: "block", padding: "22px 20px", borderRadius: 15, background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none" }}
            >
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 8 }}>
                {g.dureeLecture} de lecture
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.35, marginBottom: 8 }}>
                {g.titre}
              </p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-3)", lineHeight: 1.55 }}>
                {g.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ShellPublic>
  );
}
