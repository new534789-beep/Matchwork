// Couverture visuelle d'une offre — reprise du schéma "annonce" (mégaphones + carte
// encadrée + badge catégorie + sous-titre), décliné dans la palette violette.
// Le badge et le sous-titre s'adaptent au type d'offre.

type CatMeta = { label: string; sousTitre: (org: string) => string; icone: React.ReactNode };

const ICONES = {
  bourse: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
    </>
  ),
  formation: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
    </>
  ),
  emploi: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  concours: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
  residence: (
    <>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </>
  ),
};

const CATEGORIES: Record<string, CatMeta> = {
  BOURSE: { label: "Bourse", sousTitre: (o) => `Bourse — ${o}`, icone: ICONES.bourse },
  BOURSE_ETUDE: { label: "Bourse d'études", sousTitre: (o) => `Bourse d'études — ${o}`, icone: ICONES.bourse },
  FORMATION: { label: "Formation", sousTitre: (o) => `Formation initiée par ${o}`, icone: ICONES.formation },
  EMPLOI: { label: "Emploi", sousTitre: (o) => `Offre d'emploi — ${o}`, icone: ICONES.emploi },
  CONCOURS: { label: "Concours", sousTitre: (o) => `Concours organisé par ${o}`, icone: ICONES.concours },
  STAGE: { label: "Stage", sousTitre: (o) => `Stage proposé par ${o}`, icone: ICONES.emploi },
  RESIDENCE: { label: "Résidence", sousTitre: (o) => `Résidence proposée par ${o}`, icone: ICONES.residence },
};

function Megaphone({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" style={style} aria-hidden>
      {/* cône */}
      <path d="M3 11 L18 6 V18 L3 13 Z" fill="rgba(255,255,255,0.92)" />
      {/* corps / sortie */}
      <rect x="17" y="6.5" width="3.4" height="11" rx="1.4" fill="rgba(255,255,255,0.7)" />
      {/* poignée */}
      <path d="M6.5 13.2 V16 a2 2 0 0 0 4 0 v-1.6" fill="rgba(255,255,255,0.92)" />
      {/* ondes */}
      <path d="M21.5 9 Q23.2 12 21.5 15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

type ThemeCouleur = {
  fond: string;
  cadre: string;
  icone: string;
  badge: string;
  sousTitre: string;
  ombre: string;
};

const THEME_VIOLET: ThemeCouleur = {
  fond: "linear-gradient(140deg,#8b5cf6 0%,#6d28d9 55%,#5b21b6 100%)",
  cadre: "#c4b5fd",
  icone: "#7c3aed",
  badge: "linear-gradient(135deg,#7c3aed,#5b21b6)",
  sousTitre: "#6d28d9",
  ombre: "rgba(45,16,96,0.35)",
};

const THEME_ORANGE: ThemeCouleur = {
  fond: "linear-gradient(140deg,#f97316 0%,#ea580c 55%,#c2410c 100%)",
  cadre: "#fdba74",
  icone: "#ea580c",
  badge: "linear-gradient(135deg,#ea580c,#c2410c)",
  sousTitre: "#c2410c",
  ombre: "rgba(120,40,4,0.35)",
};

function themeParType(type: string): ThemeCouleur {
  const t = type.toUpperCase();
  if (t === "EMPLOI" || t === "STAGE") return THEME_ORANGE;
  return THEME_VIOLET;
}

export function CouvertureOffre({
  type,
  organisme,
  height = 196,
}: {
  type: string | null | undefined;
  organisme: string;
  height?: number;
}) {
  const typeNorm = (type ?? "BOURSE").toUpperCase();
  const cat = CATEGORIES[typeNorm] ?? CATEGORIES.BOURSE;
  const theme = themeParType(typeNorm);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.fond,
      }}
    >
      <Megaphone style={{ position: "absolute", top: -22, left: -18, transform: "rotate(-18deg)", opacity: 0.95 }} />
      <Megaphone style={{ position: "absolute", bottom: -24, right: -16, transform: "rotate(162deg)", opacity: 0.95 }} />

      <div style={{ position: "relative", borderRadius: 22, background: theme.cadre, padding: 6, boxShadow: `0 14px 36px ${theme.ombre}`, width: "62%", maxWidth: 260 }}>
        <div style={{ background: "#ffffff", colorScheme: "light", borderRadius: 17, padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 9 }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={theme.icone} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {cat.icone}
          </svg>
          <span
            style={{
              display: "inline-block",
              background: theme.badge,
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.95rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "5px 18px",
              borderRadius: 9,
            }}
          >
            {cat.label}
          </span>
          <p style={{ fontSize: "0.74rem", fontWeight: 600, color: theme.sousTitre, lineHeight: 1.4 }}>
            {cat.sousTitre(organisme)}
          </p>
        </div>
      </div>
    </div>
  );
}
