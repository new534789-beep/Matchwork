import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnteteApp } from "@/components/navigation/EnteteApp";

const CATEGORIES = [
  {
    type: "BOURSE" as const,
    label: "Bourses",
    tag: "Bourses d’études",
    desc: "Canada, France, Allemagne, Belgique, Luxembourg et plus.",
    href: "/opportunites/bourses",
    gradient: "linear-gradient(140deg,#8b5cf6 0%,#6d28d9 55%,#5b21b6 100%)",
    shadow: "rgba(91,33,182,0.3)",
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute" as const, top: 16, right: 16 }}>
        <circle cx="12" cy="8" r="6" />
        <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
      </svg>
    ),
  },
  {
    type: "EMPLOI" as const,
    label: "Emplois",
    tag: "Offres d’emploi",
    desc: "Postes en Afrique de l’Ouest et à l’international.",
    href: "/opportunites/emplois",
    gradient: "linear-gradient(140deg,#f97316 0%,#ea580c 55%,#c2410c 100%)",
    shadow: "rgba(194,65,12,0.3)",
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute" as const, top: 16, right: 16 }}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    type: "STAGE" as const,
    label: "Stages",
    tag: "Stages & alternances",
    desc: "Stages professionnels et programmes d’apprentissage.",
    href: "/opportunites/stages",
    gradient: "linear-gradient(140deg,#06b6d4 0%,#0891b2 55%,#0e7490 100%)",
    shadow: "rgba(14,116,144,0.3)",
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute" as const, top: 16, right: 16 }}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    type: "FORMATION" as const,
    label: "Formations",
    tag: "Formations & programmes",
    desc: "MOOC, certifications, programmes de développement.",
    href: "/opportunites/formations",
    gradient: "linear-gradient(140deg,#10b981 0%,#059669 55%,#047857 100%)",
    shadow: "rgba(4,120,87,0.3)",
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute" as const, top: 16, right: 16 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    type: "ADMISSION" as const,
    label: "Admissions",
    tag: "Admissions & inscriptions",
    desc: "Formulaires d’admission, UTME, programmes universitaires.",
    href: "/opportunites/admissions",
    gradient: "linear-gradient(140deg,#6366f1 0%,#4f46e5 55%,#4338ca 100%)",
    shadow: "rgba(67,56,202,0.3)",
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute" as const, top: 16, right: 16 }}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    type: "RECOMPENSE" as const,
    label: "Récompenses",
    tag: "Prix & récompenses",
    desc: "Awards, prix d’excellence et compétitions.",
    href: "/opportunites/recompenses",
    gradient: "linear-gradient(140deg,#eab308 0%,#ca8a04 55%,#a16207 100%)",
    shadow: "rgba(161,98,7,0.3)",
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute" as const, top: 16, right: 16 }}>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    type: "APPEL_PROJET" as const,
    label: "Appels à projets",
    tag: "Financement & projets",
    desc: "Appels à propositions, fonds d'innovation, subventions de recherche.",
    href: "/opportunites/appels-projets",
    gradient: "linear-gradient(140deg,#ec4899 0%,#db2777 55%,#be185d 100%)",
    shadow: "rgba(190,24,93,0.3)",
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute" as const, top: 16, right: 16 }}>
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        <path d="M12 2v16" />
      </svg>
    ),
  },
];

export default async function Opportunites() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const userId = session.user.id;

  const counts = await Promise.all(
    CATEGORIES.map((cat) =>
      prisma.opportunite.count({
        where: {
          type: cat.type,
          actif: true,
          statut: "publiee",
          interactions: { none: { userId } },
        },
      })
    )
  );

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
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.type} href={cat.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: cat.gradient,
                  padding: "28px 24px",
                  minHeight: 170,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  cursor: "pointer",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  boxShadow: `0 8px 32px ${cat.shadow}`,
                }}
              >
                {cat.icon}
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
                  {cat.tag}
                </span>
                <h3 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
                  {cat.label}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 12 }}>
                  {cat.desc}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
                    {counts[i]} disponible{counts[i] !== 1 ? "s" : ""}
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
