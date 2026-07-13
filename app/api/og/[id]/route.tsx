import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CatMeta = { label: string; sousTitre: (org: string) => string; iconePath: string };

const CATEGORIES: Record<string, CatMeta> = {
  BOURSE: { label: "Bourse", sousTitre: (o) => `Bourse — ${o}`, iconePath: "M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM8.5 13.5 7 22l5-3 5 3-1.5-8.5" },
  BOURSE_ETUDE: { label: "Bourse d'études", sousTitre: (o) => `Bourse d'études — ${o}`, iconePath: "M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM8.5 13.5 7 22l5-3 5 3-1.5-8.5" },
  FORMATION: { label: "Formation", sousTitre: (o) => `Formation initiée par ${o}`, iconePath: "M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5" },
  EMPLOI: { label: "Emploi", sousTitre: (o) => `Offre d'emploi — ${o}`, iconePath: "M2 7h20v14H2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" },
  STAGE: { label: "Stage", sousTitre: (o) => `Stage proposé par ${o}`, iconePath: "M2 7h20v14H2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" },
  CONCOURS: { label: "Concours", sousTitre: (o) => `Concours organisé par ${o}`, iconePath: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2Z" },
  RESIDENCE: { label: "Résidence", sousTitre: (o) => `Résidence proposée par ${o}`, iconePath: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5zM9 21V12h6v9" },
};

function isEmploi(type: string) {
  const t = type.toUpperCase();
  return t === "EMPLOI" || t === "STAGE";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await prisma.opportunite.findUnique({
    where: { id },
    select: { intitule: true, organisme: true, type: true },
  });

  if (!opp) {
    return new Response("Not found", { status: 404 });
  }

  const typeNorm = (opp.type ?? "BOURSE").toUpperCase();
  const cat = CATEGORIES[typeNorm] ?? CATEGORIES.BOURSE;
  const emploi = isEmploi(typeNorm);

  const fond = emploi
    ? "linear-gradient(140deg, #f97316 0%, #ea580c 55%, #c2410c 100%)"
    : "linear-gradient(140deg, #8b5cf6 0%, #6d28d9 55%, #5b21b6 100%)";
  const cadre = emploi ? "#fdba74" : "#c4b5fd";
  const iconeColor = emploi ? "#ea580c" : "#7c3aed";
  const badgeBg = emploi
    ? "linear-gradient(135deg, #ea580c, #c2410c)"
    : "linear-gradient(135deg, #7c3aed, #5b21b6)";
  const sousTitreColor = emploi ? "#c2410c" : "#6d28d9";

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
        {/* Megaphone haut-gauche */}
        <svg
          width="240"
          height="240"
          viewBox="0 0 24 24"
          style={{ position: "absolute", top: -44, left: -36, transform: "rotate(-18deg)", opacity: 0.95 }}
        >
          <path d="M3 11 L18 6 V18 L3 13 Z" fill="rgba(255,255,255,0.92)" />
          <rect x="17" y="6.5" width="3.4" height="11" rx="1.4" fill="rgba(255,255,255,0.7)" />
          <path d="M6.5 13.2 V16 a2 2 0 0 0 4 0 v-1.6" fill="rgba(255,255,255,0.92)" />
          <path d="M21.5 9 Q23.2 12 21.5 15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" />
        </svg>

        {/* Megaphone bas-droite */}
        <svg
          width="240"
          height="240"
          viewBox="0 0 24 24"
          style={{ position: "absolute", bottom: -48, right: -32, transform: "rotate(162deg)", opacity: 0.95 }}
        >
          <path d="M3 11 L18 6 V18 L3 13 Z" fill="rgba(255,255,255,0.92)" />
          <rect x="17" y="6.5" width="3.4" height="11" rx="1.4" fill="rgba(255,255,255,0.7)" />
          <path d="M6.5 13.2 V16 a2 2 0 0 0 4 0 v-1.6" fill="rgba(255,255,255,0.92)" />
          <path d="M21.5 9 Q23.2 12 21.5 15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" />
        </svg>

        {/* Carte centrale */}
        <div
          style={{
            display: "flex",
            borderRadius: 44,
            background: cadre,
            padding: 12,
            boxShadow: `0 28px 72px ${emploi ? "rgba(120,40,4,0.35)" : "rgba(45,16,96,0.35)"}`,
            width: "62%",
            maxWidth: 520,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 34,
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 18,
              width: "100%",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={iconeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={cat.iconePath} />
            </svg>

            <span
              style={{
                display: "flex",
                background: badgeBg,
                color: "#fff",
                fontWeight: 800,
                fontSize: "28px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "10px 36px",
                borderRadius: 18,
              }}
            >
              {cat.label}
            </span>

            <p style={{ fontSize: "20px", fontWeight: 600, color: sousTitreColor, lineHeight: 1.4, margin: 0 }}>
              {cat.sousTitre(opp.organisme)}
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
