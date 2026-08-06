import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type StyleCategorie = {
  label: string;
  iconePath: string;
  c1: string;
  c2: string;
  c3: string;
  cadre: string;
  iconeColor: string;
  badgeBg: string;
  sousTitreColor: string;
};

// Icônes et couleurs identiques à celles utilisées dans l'app (fil de swipe par
// catégorie) — voir components/tableau. Priorité au type de l'offre source
// (plus précis) ; à défaut, retombe sur la catégorie de l'article.
const STYLES: Record<string, StyleCategorie> = {
  BOURSE_ETUDE: {
    label: "Bourse d'études",
    iconePath: "M12 8m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M15.477 12.89 17 22l-5-3-5 3 1.523-9.11",
    c1: "#8b5cf6", c2: "#6d28d9", c3: "#5b21b6", cadre: "#c4b5fd", iconeColor: "#7c3aed",
    badgeBg: "linear-gradient(135deg,#6d28d9,#5b21b6)", sousTitreColor: "#6d28d9",
  },
  FORMATION: {
    label: "Formation",
    iconePath: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    c1: "#10b981", c2: "#059669", c3: "#047857", cadre: "#6ee7b7", iconeColor: "#059669",
    badgeBg: "linear-gradient(135deg,#059669,#047857)", sousTitreColor: "#047857",
  },
  EMPLOI: {
    label: "Emploi",
    iconePath: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M2 6h20v14H2z",
    c1: "#f97316", c2: "#ea580c", c3: "#c2410c", cadre: "#fdba74", iconeColor: "#ea580c",
    badgeBg: "linear-gradient(135deg,#ea580c,#c2410c)", sousTitreColor: "#c2410c",
  },
  STAGE: {
    label: "Stage",
    iconePath: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z M22 10v6 M6 12.5V16a6 3 0 0 0 12 0v-3.5",
    c1: "#06b6d4", c2: "#0891b2", c3: "#0e7490", cadre: "#67e8f9", iconeColor: "#0891b2",
    badgeBg: "linear-gradient(135deg,#0891b2,#0e7490)", sousTitreColor: "#0e7490",
  },
  ADMISSION: {
    label: "Admission",
    iconePath: "M12 7v14 M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
    c1: "#6366f1", c2: "#4f46e5", c3: "#4338ca", cadre: "#a5b4fc", iconeColor: "#4f46e5",
    badgeBg: "linear-gradient(135deg,#4f46e5,#4338ca)", sousTitreColor: "#4338ca",
  },
  APPEL_PROJET: {
    label: "Appel à projets",
    iconePath: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z M21.854 2.147 10.914 13.086",
    c1: "#ec4899", c2: "#db2777", c3: "#be185d", cadre: "#f9a8d4", iconeColor: "#db2777",
    badgeBg: "linear-gradient(135deg,#db2777,#be185d)", sousTitreColor: "#be185d",
  },
};

// Catégorie d'article (générée par l'IA, plus large que le type d'offre) → style le plus proche.
const CATEGORIE_VERS_STYLE: Record<string, string> = {
  bourses: "BOURSE_ETUDE",
  emploi: "EMPLOI",
  candidature: "ADMISSION",
  projets: "APPEL_PROJET",
  actualite: "BOURSE_ETUDE",
};

function resolveStyle(typeOffre: string | null | undefined, categorieArticle: string | null): StyleCategorie {
  const typeNorm = (typeOffre ?? "").toUpperCase();
  if (STYLES[typeNorm]) return STYLES[typeNorm];
  const viaCategorie = CATEGORIE_VERS_STYLE[categorieArticle ?? "actualite"];
  return STYLES[viaCategorie] ?? STYLES.BOURSE_ETUDE;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { titre: true, categorie: true, opportunite: { select: { type: true } } },
  });

  if (!article) {
    return new Response("Not found", { status: 404 });
  }

  const style = resolveStyle(article.opportunite?.type, article.categorie);
  const fond = `linear-gradient(140deg, ${style.c1} 0%, ${style.c2} 55%, ${style.c3} 100%)`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: fond,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="240" height="240" viewBox="0 0 24 24" style={{ position: "absolute", top: -44, left: -36, transform: "rotate(-18deg)", opacity: 0.95 }}>
          <path d="M3 11 L18 6 V18 L3 13 Z" fill="rgba(255,255,255,0.92)" />
          <rect x="17" y="6.5" width="3.4" height="11" rx="1.4" fill="rgba(255,255,255,0.7)" />
          <path d="M6.5 13.2 V16 a2 2 0 0 0 4 0 v-1.6" fill="rgba(255,255,255,0.92)" />
          <path d="M21.5 9 Q23.2 12 21.5 15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
        <svg width="240" height="240" viewBox="0 0 24 24" style={{ position: "absolute", bottom: -48, right: -32, transform: "rotate(162deg)", opacity: 0.95 }}>
          <path d="M3 11 L18 6 V18 L3 13 Z" fill="rgba(255,255,255,0.92)" />
          <rect x="17" y="6.5" width="3.4" height="11" rx="1.4" fill="rgba(255,255,255,0.7)" />
          <path d="M6.5 13.2 V16 a2 2 0 0 0 4 0 v-1.6" fill="rgba(255,255,255,0.92)" />
          <path d="M21.5 9 Q23.2 12 21.5 15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" />
        </svg>

        <div
          style={{
            display: "flex",
            borderRadius: 44,
            background: style.cadre,
            padding: 12,
            boxShadow: "0 28px 72px rgba(20,10,40,0.35)",
            width: "72%",
            maxWidth: 620,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 34,
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 16,
              width: "100%",
            }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={style.iconeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={style.iconePath} />
            </svg>

            <span
              style={{
                display: "flex",
                background: style.badgeBg,
                color: "#fff",
                fontWeight: 800,
                fontSize: "24px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "9px 32px",
                borderRadius: 16,
              }}
            >
              {style.label}
            </span>

            <p style={{ fontSize: "22px", fontWeight: 700, color: style.sousTitreColor, lineHeight: 1.35, margin: 0 }}>
              {article.titre.length > 90 ? `${article.titre.slice(0, 90)}…` : article.titre}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1040,
      height: 392,
    }
  );
}
