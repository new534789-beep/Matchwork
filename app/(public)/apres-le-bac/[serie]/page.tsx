import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShellPublic } from "@/components/public/ShellPublic";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { ANNEE_UNIVERSITAIRE, PLATEFORME_OFFICIELLE } from "@/lib/orientation/donnees";
import {
  SERIES_SEO,
  filieresPourSerie,
  getSerieSeoBySlug,
  statsPourSerie,
} from "@/lib/orientation/seo";
import type { FilierePublique } from "@/lib/orientation/types";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ serie: string }> };

export const revalidate = 86400;

// Aucune requête base : les 14 pages sont générées entièrement à partir du
// jeu de données du guide.
export function generateStaticParams() {
  return SERIES_SEO.map((s) => ({ serie: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serie } = await params;
  const s = getSerieSeoBySlug(serie);
  if (!s) return { title: "Série introuvable — Matchwork", robots: { index: false } };

  const st = statsPourSerie(s.serie);
  const titre = `Que faire après un ${s.libelleCourt} au Bénin ? ${st.ouvertes} filières et ${st.totalBourses} bourses | Matchwork`;
  const description =
    `Toutes les filières ouvertes au ${s.libelleCourt} (${s.intitule}) dans les universités ` +
    `publiques du Bénin en ${ANNEE_UNIVERSITAIRE} : quotas de bourses, établissements et ` +
    `matières retenues pour la moyenne de classement.`;
  const url = `${getSiteUrl()}/apres-le-bac/${s.slug}`;

  return {
    title: { absolute: titre },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: titre,
      description,
      url,
      siteName: "Matchwork",
      locale: "fr_FR",
      type: "website",
    },
  };
}

function LigneFiliere({ f }: { f: FilierePublique }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {f.filiere}
        </h3>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full shrink-0"
          style={{
            background:
              f.modeEntree === "concours"
                ? "rgba(234,179,8,0.12)"
                : "rgba(124,58,237,0.10)",
            color: f.modeEntree === "concours" ? "#a16207" : "var(--purple)",
          }}
        >
          {f.modeEntree === "concours"
            ? "Concours"
            : f.modeEntree === "classement"
              ? "Classement"
              : "Non précisé"}
        </span>
      </div>
      <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
        {f.etablissement}
      </p>
      <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>
        Bourses <strong style={{ color: "var(--text)" }}>{f.quotaBourse ?? 0}</strong> · Aide /
        partiellement payant <strong style={{ color: "var(--text)" }}>{f.quotaAideFpp ?? 0}</strong>
      </p>
      {f.debouches.length > 0 && (
        <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>
          Débouchés : {f.debouches.slice(0, 3).join(" · ")}
        </p>
      )}
    </div>
  );
}

export default async function SerieApresLeBac({ params }: Props) {
  const { serie } = await params;
  const s = getSerieSeoBySlug(serie);
  if (!s) notFound();

  const base = getSiteUrl();
  const st = statsPourSerie(s.serie);
  const filieres = filieresPourSerie(s.serie);

  // Regroupement par université : c'est la façon dont un candidat lit la liste.
  const parUniversite = new Map<string, FilierePublique[]>();
  for (const f of filieres) {
    const l = parUniversite.get(f.universite) ?? [];
    l.push(f);
    parUniversite.set(f.universite, l);
  }

  const jsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: base },
    { name: "Après le bac au Bénin", url: `${base}/apres-le-bac` },
    { name: s.libelleCourt, url: `${base}/apres-le-bac/${s.slug}` },
  ]);

  return (
    <ShellPublic>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-10 space-y-9">
        <nav className="text-xs" style={{ color: "var(--text-3)" }}>
          <Link href="/apres-le-bac" style={{ color: "var(--purple)" }}>
            Après le bac au Bénin
          </Link>{" "}
          / {s.libelleCourt}
        </nav>

        <header>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--text)" }}>
            Que faire après un {s.libelleCourt} au Bénin ?
          </h1>
          <p className="text-base mt-3" style={{ color: "var(--text-2)" }}>
            Série {s.serie} — {s.intitule}. Le guide du MESRS {ANNEE_UNIVERSITAIRE} t&apos;ouvre{" "}
            <strong style={{ color: "var(--text)" }}>{st.ouvertes} filières</strong> dans{" "}
            {st.universites.length} universités, pour{" "}
            <strong style={{ color: "var(--text)" }}>{st.totalBourses} bourses</strong> et{" "}
            {st.totalAides} aides.
          </p>
        </header>

        <section
          className="rounded-2xl p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            Les matières qui décident de ton classement
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>
            En série {s.serie}, seules ces matières entrent dans les formules du guide :
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {st.matieres.map((m) => (
              <span
                key={m}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(124,58,237,0.10)", color: "var(--purple)" }}
              >
                {m}
              </span>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-3)" }}>
            Chaque filière n&apos;en retient que trois, et pas les mêmes. C&apos;est pourquoi ta
            moyenne de classement change d&apos;une filière à l&apos;autre, alors que ton relevé,
            lui, ne change pas.
          </p>
        </section>

        {st.surConcours > 0 && (
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Attention : {st.surConcours} de ces filières recrutent{" "}
            <strong style={{ color: "var(--text)" }}>sur concours</strong>. Pour celles-là, la
            moyenne de classement ne décide de rien — l&apos;admission dépend des épreuves.
          </p>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
            Les {st.ouvertes} filières ouvertes au {s.libelleCourt}
          </h2>
          <div className="space-y-6">
            {[...parUniversite.entries()].map(([universite, liste]) => (
              <div key={universite}>
                <h3
                  className="text-sm font-semibold mb-2.5"
                  style={{ color: "var(--purple)" }}
                >
                  {universite}{" "}
                  <span style={{ color: "var(--text-4)", fontWeight: 400 }}>
                    ({liste.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {liste.map((f) => (
                    <LigneFiliere key={f.id} f={f} />
                  ))}
                </div>
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
            Où serais-tu le mieux classé ?
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>
            Photographie ton relevé : Matchwork calcule ta moyenne pour chacune de ces{" "}
            {st.ouvertes} filières et te les classe, de la plus haute à la plus basse.
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
            Calculer mes moyennes
          </Link>
        </section>

        <div className="flex flex-wrap gap-2">
          {SERIES_SEO.filter((x) => x.slug !== s.slug).map((x) => (
            <Link
              key={x.slug}
              href={`/apres-le-bac/${x.slug}`}
              className="text-xs px-3 py-1.5 rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                textDecoration: "none",
              }}
            >
              {x.libelleCourt}
            </Link>
          ))}
        </div>

        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Source : guide d&apos;information du MESRS {ANNEE_UNIVERSITAIRE}. Les choix se font sur{" "}
          <a
            href={PLATEFORME_OFFICIELLE}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--purple)" }}
          >
            apresmonbac.bj
          </a>
          .
        </p>
      </div>
    </ShellPublic>
  );
}
