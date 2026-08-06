import type { Metadata } from "next";
import Link from "next/link";

import { ShellPublic } from "@/components/public/ShellPublic";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/jsonld";
import { ANNEE_UNIVERSITAIRE, PLATEFORME_OFFICIELLE } from "@/lib/orientation/donnees";
import { SERIES_SEO, statsGlobales, statsPourSerie } from "@/lib/orientation/seo";
import { getSiteUrl } from "@/lib/site-url";

// Données statiques issues du guide : rien à revalider en cours d'année.
export const revalidate = 86400;

const TITRE =
  "Après le bac au Bénin : filières, bourses et moyenne de classement | Matchwork";
const DESCRIPTION =
  "Les 210 filières des universités publiques du Bénin pour 2026-2027 : quotas de bourses, " +
  "matières retenues par filière et calcul de la moyenne de classement, série par série.";

export function generateMetadata(): Metadata {
  const url = `${getSiteUrl()}/apres-le-bac`;
  return {
    title: { absolute: TITRE },
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: TITRE,
      description: DESCRIPTION,
      url,
      siteName: "Matchwork",
      locale: "fr_FR",
      type: "website",
    },
  };
}

const FAQ = [
  {
    q: "Comment se calcule la moyenne de classement au Bénin ?",
    r:
      "Elle vaut (m1×x + m2×y + m3×z) ÷ (x+y+z), où m est la note obtenue dans chacune des " +
      "trois matières retenues par la filière visée, et x, y, z les coefficients de ces " +
      "matières dans la série du candidat.",
  },
  {
    q: "Pourquoi ma moyenne change-t-elle d'une filière à l'autre ?",
    r:
      "Parce que le trio de matières dépend de la filière, pas du candidat. Médecine retient " +
      "SVT, Mathématiques et PCT ; une licence d'Anglais retient Français, Histoire-Géographie " +
      "et Anglais. Un même relevé donne donc des dizaines de moyennes différentes.",
  },
  {
    q: "La moyenne générale du bac sert-elle au classement ?",
    r:
      "Non. Seules les trois matières retenues par la filière entrent dans le calcul. La " +
      "moyenne générale détermine la mention, pas le rang.",
  },
  {
    q: "Toutes les filières se jouent-elles à la moyenne ?",
    r:
      `Non : ${statsGlobales().surConcours} filières recrutent sur concours. Pour celles-là, ` +
      "l'admission dépend des épreuves, pas d'une moyenne de classement.",
  },
];

export default function ApresLeBac() {
  const base = getSiteUrl();
  const g = statsGlobales();

  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Accueil", url: base },
      { name: "Après le bac au Bénin", url: `${base}/apres-le-bac` },
    ]),
    buildFaqJsonLd(FAQ),
  ];

  return (
    <ShellPublic>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-10 space-y-10">
        <header>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
            Guide MESRS {ANNEE_UNIVERSITAIRE}
          </p>
          <h1
            className="text-3xl font-bold mt-2 leading-tight"
            style={{ color: "var(--text)" }}
          >
            Après le bac au Bénin : quelles filières, quelles bourses ?
          </h1>
          <p className="text-base mt-3" style={{ color: "var(--text-2)" }}>
            {g.filieres} filières réparties dans {g.etablissements} établissements et{" "}
            {g.universites} universités publiques, avec {g.totalBourses.toLocaleString("fr-FR")}{" "}
            bourses et {g.totalAides.toLocaleString("fr-FR")} aides. Choisis ta série pour voir
            ce qui t&apos;est ouvert.
          </p>
        </header>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>
            Ta série
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {SERIES_SEO.map((s) => {
              const st = statsPourSerie(s.serie);
              return (
                <Link
                  key={s.slug}
                  href={`/apres-le-bac/${s.slug}`}
                  className="rounded-2xl p-4 block"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                  }}
                >
                  <span
                    className="block text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {s.libelleCourt} — {s.intitule}
                  </span>
                  <span className="block text-xs mt-1" style={{ color: "var(--text-3)" }}>
                    {st.ouvertes} filières ouvertes · {st.totalBourses} bourses
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>
            Comment se calcule la moyenne de classement
          </h2>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Le guide du MESRS applique une formule unique :
          </p>
          <p
            className="text-sm font-mono rounded-xl px-4 py-3 mt-3"
            style={{ background: "var(--input-bg)", color: "var(--text)" }}
          >
            M = (m1×x + m2×y + m3×z) ÷ (x + y + z)
          </p>
          <p className="text-sm mt-3" style={{ color: "var(--text-2)" }}>
            <strong style={{ color: "var(--text)" }}>m</strong> est la note obtenue dans une
            matière, <strong style={{ color: "var(--text)" }}>x, y, z</strong> les coefficients
            de cette matière dans ta série. Le point que la plupart des candidats découvrent
            trop tard : les trois matières retenues{" "}
            <strong style={{ color: "var(--text)" }}>changent selon la filière visée</strong>.
            Un même relevé produit donc des dizaines de moyennes différentes, et la filière où
            tu es le mieux classé n&apos;est pas toujours celle à laquelle tu pensais.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl p-4"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {f.q}
                </h3>
                <p className="text-sm mt-1.5" style={{ color: "var(--text-2)" }}>
                  {f.r}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(150deg,rgba(124,58,237,0.14),rgba(91,33,182,0.06))",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
            Calcule tes moyennes automatiquement
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>
            Photographie ton relevé de notes : Matchwork lit tes notes et tes coefficients, puis
            calcule ta moyenne pour chacune des filières qui te sont ouvertes, classées de la
            plus haute à la plus basse. Rien à saisir.
          </p>
          <Link
            href="/orientation"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Ouvrir le simulateur
          </Link>
        </section>

        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Informations reprises du guide d&apos;information du MESRS {ANNEE_UNIVERSITAIRE}. Les
          choix se font sur{" "}
          <a
            href={PLATEFORME_OFFICIELLE}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--purple)" }}
          >
            apresmonbac.bj
          </a>
          , seule plateforme officielle.
        </p>
      </div>
    </ShellPublic>
  );
}
