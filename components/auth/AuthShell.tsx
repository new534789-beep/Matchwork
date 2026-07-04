import Link from "next/link";
import Image from "next/image";

const ATOUTS = [
  "Des bourses, emplois et concours triés pour votre profil",
  "CV et lettre de motivation générés par l'IA pour chaque dossier",
  "Alertes avant chaque date limite — vous candidatez toujours à temps",
];

export function AuthShell({
  titre,
  sousTitre,
  children,
  bas,
}: {
  titre: string;
  sousTitre: string;
  children: React.ReactNode;
  bas: React.ReactNode;
}) {
  return (
    <main style={{ minHeight: "100vh", display: "flex", background: "#07060d", color: "#fff" }}>

      {/* ── Panneau gauche (marque) — desktop ── */}
      <aside
        className="hidden lg:flex"
        style={{
          flex: "0 0 46%",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          background: "linear-gradient(160deg,#1c0a45 0%,#13052e 45%,#0a0118 100%)",
          borderRight: "1px solid rgba(124,58,237,0.18)",
        }}
      >
        <div aria-hidden style={{ position: "absolute", top: "-15%", left: "-10%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.35),transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "-20%", right: "-12%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(91,33,182,0.3),transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <Link href="/" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <Image src="/logo.png" alt="Matchwork" width={40} height={40} priority />
          <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.02em" }}>Matchwork</span>
        </Link>

        {/* Accroche + atouts */}
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,2.6vw,2.4rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 28 }}>
            Vos bourses, vos dossiers,<br />
            <span style={{ color: "#a78bfa" }}>en quelques minutes.</span>
          </h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ATOUTS.map((a) => (
              <li key={a} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: "50%", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                <span style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        <p style={{ position: "relative", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
          Plateforme dédiée aux candidats d&apos;Afrique de l&apos;Ouest.
        </p>
      </aside>

      {/* ── Panneau droit (formulaire) ── */}
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative" }}>
        <div aria-hidden className="lg:hidden" style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.18),transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", width: "100%", maxWidth: 396 }}>
          {/* Logo mobile */}
          <Link href="/" className="lg:hidden" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32, textDecoration: "none" }}>
            <Image src="/logo.png" alt="Matchwork" width={44} height={44} priority />
            <span style={{ fontWeight: 800, fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.02em" }}>Matchwork</span>
          </Link>

          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>{titre}</h1>
          <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>{sousTitre}</p>

          {children}

          <div style={{ marginTop: 26, textAlign: "center", fontSize: "0.88rem", color: "rgba(255,255,255,0.4)" }}>
            {bas}
          </div>
        </div>
      </section>
    </main>
  );
}
