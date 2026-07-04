import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnteteApp } from "@/components/navigation/EnteteApp";

export default async function Opportunites() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const userId = session.user.id;

  const [nBourses, nEmplois] = await Promise.all([
    prisma.opportunite.count({
      where: {
        type: "BOURSE",
        actif: true,
        statut: "publiee",
        interactions: { none: { userId } },
      },
    }),
    prisma.opportunite.count({
      where: {
        type: { in: ["EMPLOI", "STAGE"] },
        actif: true,
        statut: "publiee",
        interactions: { none: { userId } },
      },
    }),
  ]);

  return (
    <>
      <EnteteApp titre="Opportunités" />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
            Découvrez vos opportunités
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            Choisissez une catégorie et swipez les offres faites pour vous.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Carte Bourses d'études — violet */}
          <Link href="/opportunites/bourses" style={{ textDecoration: "none" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                background: "linear-gradient(140deg,#8b5cf6 0%,#6d28d9 55%,#5b21b6 100%)",
                padding: "28px 24px",
                minHeight: 170,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                boxShadow: "0 8px 32px rgba(91,33,182,0.3)",
              }}
            >
              {/* Icône décorative */}
              <svg
                width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", top: 16, right: 16 }}
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
              </svg>

              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "4px 12px",
                  borderRadius: 7,
                  marginBottom: 12,
                  alignSelf: "flex-start",
                  backdropFilter: "blur(4px)",
                }}
              >
                Bourses d&apos;études
              </span>
              <h3 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
                Bourses
              </h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 12 }}>
                Canada, France, Allemagne, Belgique, Luxembourg et plus.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
                  {nBourses} {nBourses === 1 ? "bourse disponible" : "bourses disponibles"}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Carte Emplois — orange */}
          <Link href="/opportunites/emplois" style={{ textDecoration: "none" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                background: "linear-gradient(140deg,#f97316 0%,#ea580c 55%,#c2410c 100%)",
                padding: "28px 24px",
                minHeight: 170,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                boxShadow: "0 8px 32px rgba(194,65,12,0.3)",
              }}
            >
              {/* Icône décorative */}
              <svg
                width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", top: 16, right: 16 }}
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>

              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "4px 12px",
                  borderRadius: 7,
                  marginBottom: 12,
                  alignSelf: "flex-start",
                  backdropFilter: "blur(4px)",
                }}
              >
                Offres d&apos;emploi
              </span>
              <h3 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
                Emplois
              </h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 12 }}>
                Postes en Afrique de l&apos;Ouest et à l&apos;international.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
                  {nEmplois} {nEmplois === 1 ? "emploi disponible" : "emplois disponibles"}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
