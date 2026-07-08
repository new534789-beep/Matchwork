import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  BOURSE: { label: "BOURSE", emoji: "M8.5 13.5 7 22l5-3 5 3-1.5-8.5" },
  BOURSE_ETUDE: { label: "BOURSE D'ETUDES", emoji: "M8.5 13.5 7 22l5-3 5 3-1.5-8.5" },
  FORMATION: { label: "FORMATION", emoji: "" },
  EMPLOI: { label: "EMPLOI", emoji: "" },
  STAGE: { label: "STAGE", emoji: "" },
  CONCOURS: { label: "CONCOURS", emoji: "" },
  RESIDENCE: { label: "RESIDENCE", emoji: "" },
};

function isEmploi(type: string) {
  const t = type.toUpperCase();
  return t === "EMPLOI" || t === "STAGE";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await prisma.opportunite.findUnique({
    where: { id },
    select: { intitule: true, organisme: true, type: true, dateLimite: true, description: true },
  });

  if (!opp) {
    return new Response("Not found", { status: 404 });
  }

  const typeNorm = (opp.type ?? "BOURSE").toUpperCase();
  const cat = CATEGORIES[typeNorm] ?? CATEGORIES.BOURSE;
  const emploi = isEmploi(typeNorm);

  const gradientStart = emploi ? "#f97316" : "#8b5cf6";
  const gradientEnd = emploi ? "#c2410c" : "#5b21b6";
  const badgeBg = emploi ? "#ea580c" : "#7c3aed";

  const dateLimite = opp.dateLimite
    ? new Date(opp.dateLimite).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const descCourte = (opp.description ?? "").slice(0, 120) + (opp.description && opp.description.length > 120 ? "..." : "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(140deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
          padding: "0",
        }}
      >
        {/* Top bar with logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              M
            </div>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
              Matchwork
            </span>
          </div>
          {dateLimite && (
            <span
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.8)",
                background: "rgba(255,255,255,0.15)",
                padding: "8px 18px",
                borderRadius: "12px",
              }}
            >
              Date limite : {dateLimite}
            </span>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 48px",
            gap: "20px",
          }}
        >
          {/* Badge type */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                background: badgeBg,
                color: "#fff",
                fontWeight: 800,
                fontSize: "16px",
                letterSpacing: "0.1em",
                padding: "8px 22px",
                borderRadius: "10px",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              {cat.label}
            </span>
          </div>

          {/* Organisme */}
          <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
            {opp.organisme}
          </span>

          {/* Title */}
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "90%",
            }}
          >
            {opp.intitule.length > 80 ? opp.intitule.slice(0, 80) + "..." : opp.intitule}
          </h1>

          {/* Short description */}
          {descCourte && (
            <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: 0, maxWidth: "85%" }}>
              {descCourte}
            </p>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 48px 32px",
          }}
        >
          <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)" }}>
            Partagé depuis Matchwork
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "#fff",
              background: "rgba(255,255,255,0.2)",
              padding: "8px 20px",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            Voir l&apos;offre complète
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
