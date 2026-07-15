import Link from "next/link";
import Image from "next/image";
import { NavMobile } from "@/components/ui/NavMobile";
import { SectionTarifs } from "@/components/landing/SectionTarifs";
import { buildFaqJsonLd } from "@/lib/jsonld";

const FAQ_ITEMS = [
  {
    q: "Matchwork est-il vraiment gratuit ?",
    r: "Oui. Le plan gratuit vous offre 3 dossiers complets par mois, sans carte bancaire ni engagement. Vous ne payez que si vous voulez aller plus loin.",
  },
  {
    q: "L'IA invente-t-elle des informations sur moi ?",
    r: "Non. Chaque CV et chaque lettre est rédigé uniquement à partir de votre profil réel et des documents que vous fournissez. Rien n'est inventé.",
  },
  {
    q: "Mes lettres se ressemblent-elles d'une candidature à l'autre ?",
    r: "Jamais. Notre système anti-répétition garantit que chaque dossier est unique et ciblé sur l'opportunité visée — même si vous candidatez à dix bourses le même jour.",
  },
  {
    q: "Comment payer si je n'ai pas de carte bancaire ?",
    r: "Par Mobile Money : MTN MoMo, Moov et BjPay. Aucune carte internationale n'est requise, et aucune donnée de paiement n'est conservée chez nous.",
  },
  {
    q: "Mes documents sont-ils en sécurité ?",
    r: "Oui. Vos documents sont stockés dans un coffre-fort chiffré, accessibles à vous seul. Vos données ne sont jamais revendues ni utilisées pour entraîner une IA.",
  },
  {
    q: "Dans quels pays Matchwork fonctionne-t-il ?",
    r: "Matchwork est pensé pour l'Afrique de l'Ouest, mais fonctionne partout : il suffit d'une opportunité et de votre profil pour générer un dossier.",
  },
] as const;

export default function Landing() {
  return (
    <main style={{ background: "#fff", color: "#0a0a0a", overflowX: "hidden", maxWidth: "100vw" }}>

      {/* ── Navigation — pilule noir glacé ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-3 md:px-4" style={{ paddingTop: "10px" }}>
        <div
          className="max-w-5xl mx-auto flex items-center justify-between"
          style={{
            background: "rgba(20,20,28,0.85)",
            backdropFilter: "saturate(180%) blur(24px)",
            WebkitBackdropFilter: "saturate(180%) blur(24px)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: "14px",
            padding: "10px 12px 10px 14px",
            boxShadow: "0 4px 30px rgba(124,58,237,0.12), 0 10px 34px rgba(0,0,0,0.5)",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0, minWidth: 0 }}>
            <Image src="/logo.png" alt="Matchwork" width={32} height={32} className="w-8 h-8 md:w-9 md:h-9" priority />
            <span className="font-bold text-base md:text-lg tracking-tight" style={{ color: "#fff" }}>Matchwork</span>
          </Link>

          <div className="nav-links-row hidden md:flex items-center gap-8">
            {[
              { l: "Comment ça marche", href: "#comment" },
              { l: "Fonctionnalités", href: "#fonctionnalites" },
              { l: "Tarifs", href: "#tarifs" },
              { l: "FAQ", href: "#faq" },
            ].map((item) => (
              <a key={item.href} href={item.href} className="nav-link text-sm" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", whiteSpace: "nowrap" }}>
                {item.l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/connexion" className="nav-connexion-link hidden md:inline-flex text-sm px-3 py-2 nav-link" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", whiteSpace: "nowrap" }}>
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="nav-cta-btn hidden md:inline-flex px-4 py-2 text-sm font-semibold rounded-xl hover-glow"
              style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", textDecoration: "none", boxShadow: "0 0 24px rgba(124,58,237,0.35)", whiteSpace: "nowrap" }}
            >
              <span className="nav-cta-long">Commencer gratuitement</span>
              <span className="nav-cta-short">Commencer</span>
            </Link>
            <NavMobile />
          </div>
        </div>
      </nav>

      {/* ── Hero — Matchwork ── */}
      <section
        className="hero-section"
        style={{
          minHeight: "100vh",
          background: "#fff",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 20px 40px",
        }}
      >
        {/* ── Left: Text (lower-left like NexLayer) ── */}
        <div style={{ maxWidth: "520px", margin: "0 auto", width: "100%" }}>
          <h1
            style={{
              fontSize: "clamp(1.9rem, 3vw, 3.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              color: "#0a0a0a",
              marginBottom: "20px",
            }}
          >
            <span className="hero-title-long">
              Décrochez la bourse.{" "}
              <br className="hidden lg:block" />
              L&apos;IA rédige le dossier.
            </span>
            <span className="hero-title-short">
              Décrochez la bourse.<br />
              L&apos;IA rédige le dossier.
            </span>
          </h1>

          <p
            style={{
              color: "rgba(10,10,10,0.55)",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              maxWidth: "420px",
              marginBottom: "36px",
            }}
          >
            <span className="hero-sub-long">
              Matchwork repère les bourses, emplois et concours faits pour votre
              profil, puis rédige un CV et une lettre de motivation personnalisés
              pour chacun. Jamais génériques, jamais recopiés.
            </span>
            <span className="hero-sub-short">
              L&apos;IA qui trouve vos opportunités et rédige vos dossiers personnalisés. Jamais génériques.
            </span>
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link
              href="/inscription"
              className="hover-glow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 28px",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderRadius: "10px",
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(124,58,237,0.4)",
                textDecoration: "none",
              }}
            >
              Créer mon profil gratuitement
            </Link>
            <Link
              href="/connexion"
              className="nav-link"
              style={{
                fontSize: "0.85rem",
                color: "rgba(10,10,10,0.5)",
                textDecoration: "none",
              }}
            >
              Se connecter
            </Link>
          </div>

          {/* Signaux de confiance */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap", marginTop: "22px" }}>
            {[
              { t: "Sans carte bancaire", d: "M2 7h20M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" },
              { t: "Sans engagement", d: "M9 12l2 2 4-4 M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              { t: "Coffre-fort chiffré", d: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" },
            ].map((b) => (
              <span key={b.t} style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "0.78rem", color: "rgba(10,10,10,0.55)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.d} />
                </svg>
                {b.t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right: NexLayer isometric chip grid ── */}
        <div
          className="hero-visual-col hidden md:flex"
          style={{
            position: "relative",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          {/* Glow behind the grid */}
          <div
            className="pulse-slow"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Isometric chip arrangement */}
          <div
            className="iso-grid"
            style={{
              position: "relative",
              width: "520px",
              height: "420px",
              transform: "perspective(900px) rotateX(18deg) rotateY(-12deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* ── Main center panel (like NexLayer's central chip) ── */}
            <div
              className="card-fan-item"
              style={{
                position: "absolute",
                top: "90px",
                left: "140px",
                width: "240px",
                height: "175px",
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.35)",
                borderRadius: "16px",
                padding: "22px",
                boxShadow: "0 0 50px rgba(124,58,237,0.15), 0 20px 60px rgba(124,58,237,0.12)",
                transform: "translateZ(25px)",
                zIndex: 10,
              }}
            >
              {/* Purple asterisk glyph — NexLayer's central icon */}
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                  boxShadow: "0 0 20px rgba(124,58,237,0.2)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ color: "#0a0a0a", fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.3 }}>
                Bourse d&apos;Excellence Eiffel
              </p>
              <p style={{ color: "rgba(124,58,237,0.75)", fontSize: "0.7rem", marginTop: "4px" }}>
                Campus France · Master
              </p>
            </div>

            {/* ── Chip: top-right (TALENT TEST equivalent) ── */}
            <div
              className="card-fan-item"
              style={{
                position: "absolute",
                top: "18px",
                right: "50px",
                width: "140px",
                height: "82px",
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.18)",
                borderRadius: "12px",
                padding: "14px 16px",
                boxShadow: "0 10px 30px rgba(124,58,237,0.08)",
                transform: "translateZ(10px)",
                zIndex: 6,
              }}
            >
              <p style={{ color: "rgba(124,58,237,0.55)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
                Analyse IA
              </p>
              <p style={{ color: "#0a0a0a", fontSize: "0.78rem", fontWeight: 600 }}>
                Profil candidat
              </p>
            </div>

            {/* ── Chip: right side (DOCUMENT equivalent) ── */}
            <div
              className="card-fan-item"
              style={{
                position: "absolute",
                top: "165px",
                right: "20px",
                width: "125px",
                height: "95px",
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.18)",
                borderRadius: "12px",
                padding: "14px 16px",
                boxShadow: "0 10px 30px rgba(124,58,237,0.08)",
                transform: "translateZ(8px)",
                zIndex: 6,
              }}
            >
              <p style={{ color: "rgba(124,58,237,0.55)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
                Document
              </p>
              <p style={{ color: "#0a0a0a", fontSize: "0.78rem", fontWeight: 600 }}>
                Lettre de motivation
              </p>
            </div>

            {/* ── Chip: bottom-right (ANALYZE equivalent) ── */}
            <div
              className="card-fan-item"
              style={{
                position: "absolute",
                bottom: "40px",
                right: "70px",
                width: "155px",
                height: "78px",
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: "12px",
                padding: "14px 16px",
                boxShadow: "0 10px 30px rgba(124,58,237,0.06)",
                transform: "translateZ(5px)",
                zIndex: 5,
              }}
            >
              <p style={{ color: "rgba(124,58,237,0.5)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
                Checklist
              </p>
              <p style={{ color: "#0a0a0a", fontSize: "0.78rem", fontWeight: 600 }}>
                Pièces exigées
              </p>
            </div>

            {/* ── Chip: top-left (partially visible, like NexLayer) ── */}
            <div
              className="card-fan-item"
              style={{
                position: "absolute",
                top: "30px",
                left: "20px",
                width: "130px",
                height: "78px",
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: "12px",
                padding: "14px 16px",
                boxShadow: "0 10px 30px rgba(124,58,237,0.06)",
                transform: "translateZ(6px)",
                zIndex: 5,
              }}
            >
              <p style={{ color: "rgba(124,58,237,0.5)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
                Profil
              </p>
              <p style={{ color: "#0a0a0a", fontSize: "0.78rem", fontWeight: 600 }}>
                Formation &amp; langues
              </p>
            </div>

            {/* ── Chip: bottom-left ── */}
            <div
              className="card-fan-item"
              style={{
                position: "absolute",
                bottom: "50px",
                left: "40px",
                width: "120px",
                height: "72px",
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: "12px",
                padding: "14px 16px",
                boxShadow: "0 10px 30px rgba(124,58,237,0.06)",
                transform: "translateZ(4px)",
                zIndex: 4,
              }}
            >
              <p style={{ color: "rgba(124,58,237,0.5)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
                CV
              </p>
              <p style={{ color: "#0a0a0a", fontSize: "0.78rem", fontWeight: 600 }}>
                Généré par IA
              </p>
            </div>

            {/* Connecting dots (NexLayer decorative dots on edges of chips) */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}
              viewBox="0 0 520 420"
            >
              {/* Lines connecting chips to main */}
              <line x1="260" y1="177" x2="380" y2="59" stroke="rgba(124,58,237,0.2)" strokeWidth="1" strokeDasharray="4 4"/>
              <line x1="380" y1="177" x2="445" y2="207" stroke="rgba(124,58,237,0.12)" strokeWidth="1" strokeDasharray="4 4"/>
              <line x1="260" y1="265" x2="300" y2="340" stroke="rgba(124,58,237,0.12)" strokeWidth="1" strokeDasharray="4 4"/>
              <line x1="140" y1="177" x2="85" y2="205" stroke="rgba(124,58,237,0.12)" strokeWidth="1" strokeDasharray="4 4"/>
              {/* Corner dots */}
              <circle cx="380" cy="59" r="2.5" fill="rgba(124,58,237,0.4)"/>
              <circle cx="445" cy="207" r="2.5" fill="rgba(124,58,237,0.25)"/>
              <circle cx="300" cy="340" r="2.5" fill="rgba(124,58,237,0.25)"/>
              <circle cx="85" cy="205" r="2.5" fill="rgba(124,58,237,0.25)"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Bénéfices : ce que Matchwork change pour vous ── */}
      <section className="py-28 px-8" style={{ background: "#fff", borderTop: "1px solid rgba(10,10,10,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(124,58,237,0.9)" }}>
            Ce que ça change
          </p>
          <h2 className="text-center font-extrabold mb-5" style={{ fontSize: "clamp(2rem,3.6vw,3.1rem)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0a0a0a" }}>
            Et si candidater devenait<br />enfin simple ?
          </h2>
          <p className="text-center mx-auto mb-16" style={{ color: "rgba(10,10,10,0.5)", fontSize: "1rem", maxWidth: 540, lineHeight: 1.65 }}>
            Fini la page blanche et les dossiers bâclés à la dernière minute. Matchwork s&apos;occupe du plus dur, vous gardez le contrôle.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              {
                t: "Trouve vos opportunités",
                d: "Bourses, emplois, concours et résidences triés pour votre profil. Vous swipez, c'est tout.",
                path: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
              },
              {
                t: "Rédige vos dossiers",
                d: "CV et lettre de motivation générés en quelques minutes, personnalisés pour chaque opportunité.",
                path: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8",
              },
              {
                t: "Traduit pour vous",
                d: "Les offres en anglais, allemand ou espagnol sont traduites avant que vous ne décidiez.",
                path: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z",
              },
              {
                t: "Ne rate aucune deadline",
                d: "Des alertes claires avant chaque date limite. Vous candidatez toujours à temps.",
                path: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
              },
            ].map((b) => (
              <div key={b.t} className="hover-border" style={{ padding: "26px 22px", borderRadius: "18px", background: "rgba(10,10,10,0.025)", border: "1px solid rgba(10,10,10,0.08)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "13px", background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={b.path} />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ fontSize: "1.02rem", color: "#0a0a0a" }}>{b.t}</h3>
                <p style={{ fontSize: "0.86rem", color: "rgba(10,10,10,0.5)", lineHeight: 1.6 }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          ── Section Aura : fan de cartes produits ──
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          background: "linear-gradient(160deg,#0e0420 0%,#1e0845 45%,#2a1060 60%,#1a0840 100%)",
          overflow: "visible",
          paddingTop: "52px",
          paddingBottom: "0",
        }}
      >
        {/* Glow radial au fond */}
        <div
          className="pulse-slow absolute"
          style={{
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse,rgba(124,58,237,0.2) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header label */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div style={{ width: "28px", height: "16px", borderRadius: "8px", background: "rgba(124,58,237,0.6)", border: "1px solid rgba(167,139,250,0.4)", display: "flex", alignItems: "center", padding: "0 3px", gap: "2px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} />
            <div style={{ width: "6px", height: "8px", borderRadius: "3px", background: "rgba(167,139,250,0.3)" }} />
          </div>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", fontWeight: 500 }}>Matchwork.</span>
        </div>

        {/* Title */}
        <h2
          className="text-center font-extrabold px-6"
          style={{
            fontSize: "clamp(2.2rem,5vw,5rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.06,
            color: "#fff",
            marginBottom: "14px",
          }}
        >
          Toutes vos opportunités,
          <br />
          en un seul endroit.
        </h2>

        {/* Subtitle */}
        <p
          className="text-center mx-auto px-6"
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "clamp(0.85rem,1.4vw,0.98rem)",
            maxWidth: "480px",
            lineHeight: 1.6,
            marginBottom: "36px",
          }}
        >
          Bourses, emplois, concours, résidences — swipez, sélectionnez
          et laissez l&apos;IA générer votre dossier complet en un clic.
        </p>

        {/* ── Fan de cartes (style Aura) ── */}
        <div
          className="fan-container"
          style={{
            position: "relative",
            height: "320px",
            maxWidth: "1000px",
            margin: "0 auto",
            overflow: "visible",
          }}
        >
          {/* ── Carte 1 : FORMATION ── */}
          <div
            className="fan-card fan-c1"
            style={{
              width: "165px", height: "230px", borderRadius: "20px", padding: "20px",
              background: "linear-gradient(160deg,#0d3d80,#1a6bc9)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)", overflow: "hidden",
            }}
          >
            <div style={{ width: "28px", height: "2px", background: "rgba(255,255,255,0.5)", marginBottom: "14px" }} />
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "7px" }}>Formation</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Bootcamp<br />Développement</p>
            <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginTop: "7px" }}>En ligne · 6 sem.</p>
            <div style={{ position: "absolute", bottom: "-28px", right: "-28px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          </div>

          {/* ── Carte 2 : APPEL À PROJETS ── */}
          <div
            className="fan-card fan-c2"
            style={{
              width: "165px", height: "250px", borderRadius: "20px", padding: "20px",
              background: "#f0edf8",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)", overflow: "hidden",
            }}
          >
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(30,10,60,0.35)", marginBottom: "8px" }}>Appel à projets</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1a0840", lineHeight: 1.15 }}>Fonds<br />Jeunesse<br />Innovante</p>
            <p style={{ fontSize: "0.65rem", color: "rgba(30,10,60,0.4)", marginTop: "8px" }}>Afrique de l&apos;Ouest · 2026</p>
            <div style={{ position: "absolute", bottom: "14px", left: "20px", right: "20px", height: "2px", borderRadius: "2px", background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
          </div>

          {/* ── Carte 3 : BOURSE D'ÉTUDE (centrale, focus) ── */}
          <div
            className="fan-card fan-c3"
            style={{
              width: "190px", height: "300px", borderRadius: "22px", padding: "22px",
              background: "linear-gradient(160deg,#0c0118,#18052e)",
              border: "1px solid rgba(124,58,237,0.3)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.15)",
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(167,139,250,0.45)", marginBottom: "14px" }}>Bourse d&apos;étude</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: "4px" }}>
              Bourse<br />d&apos;Excellence<br />Eiffel
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "14px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(124,58,237,0.8)", boxShadow: "0 0 10px rgba(124,58,237,0.5)" }} />
              <p style={{ fontSize: "0.68rem", color: "rgba(167,139,250,0.6)" }}>Campus France</p>
            </div>
            <div style={{ position: "absolute", bottom: "-30px", left: "50%", transform: "translateX(-50%)", width: "120px", height: "60px", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(124,58,237,0.2),transparent)" }} />
          </div>

          {/* ── Carte 4 : STAGE ── */}
          <div
            className="fan-card fan-c4"
            style={{
              width: "165px", height: "250px", borderRadius: "20px", padding: "18px",
              background: "linear-gradient(160deg,#ddf0fb,#b8dff5)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)", overflow: "hidden",
            }}
          >
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(5,60,100,0.4)", marginBottom: "8px" }}>Stage</p>
            <div style={{ background: "rgba(255,255,255,0.75)", borderRadius: "6px", padding: "7px 9px", marginBottom: "5px" }}>
              <div style={{ width: "60%", height: "5px", background: "rgba(5,60,100,0.2)", borderRadius: "3px", marginBottom: "3px" }} />
              <div style={{ width: "80%", height: "3px", background: "rgba(5,60,100,0.12)", borderRadius: "3px" }} />
            </div>
            <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: "6px", padding: "7px 9px" }}>
              <div style={{ width: "40%", height: "5px", background: "rgba(5,60,100,0.15)", borderRadius: "3px", marginBottom: "3px" }} />
              <div style={{ width: "70%", height: "3px", background: "rgba(5,60,100,0.1)", borderRadius: "3px" }} />
            </div>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#063b64", marginTop: "10px", lineHeight: 1.3 }}>ONG<br />TechAfrica</p>
            <p style={{ fontSize: "0.65rem", color: "rgba(5,60,100,0.45)", marginTop: "3px" }}>3 mois · Cotonou</p>
          </div>

          {/* ── Carte 5 : ADMISSION ── */}
          <div
            className="fan-card fan-c5"
            style={{
              width: "165px", height: "230px", borderRadius: "20px", padding: "20px",
              background: "linear-gradient(160deg,#1a0808,#3a0e0e)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)", overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e05050" }} />
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(224,80,80,0.6)" }}>Admission</p>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Master IA<br />Polytechnique</p>
            <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "7px" }}>Lomé · Rentrée 2026</p>
            <div style={{ position: "absolute", bottom: "16px", right: "14px", fontSize: "0.6rem", color: "rgba(224,80,80,0.3)", letterSpacing: "0.06em" }}>RÉF 26</div>
            <div style={{ position: "absolute", top: "-16px", right: "-16px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(224,80,80,0.07)" }} />
          </div>

          {/* Ligne de sol / shadow */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "600px",
              height: "1px",
              background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.2),rgba(255,255,255,0.08),rgba(124,58,237,0.2),transparent)",
            }}
          />
        </div>
      </section>

      {/* ── Comment ça marche — étapes + captures ── */}
      <section id="comment" className="py-28 px-8" style={{ borderTop: "1px solid rgba(10,10,10,0.08)", background: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(124,58,237,0.9)" }}>
            Comment ça marche
          </p>
          <h2 className="text-center font-extrabold mb-6" style={{ fontSize: "clamp(2rem,3.6vw,3.1rem)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0a0a0a" }}>
            De l&apos;opportunité au dossier,<br />en 4 étapes
          </h2>
          <p className="text-center mx-auto mb-20" style={{ color: "rgba(10,10,10,0.5)", fontSize: "1rem", maxWidth: 540, lineHeight: 1.65 }}>
            Pas de paperasse, pas de blocage. Vous avancez, Matchwork fait le reste.
          </p>

          <div className="flex flex-col gap-16 max-w-4xl mx-auto">
            {[
              { n: "01", t: "Créez votre profil avec Amara", d: "Notre assistante IA vous interviewe naturellement et construit votre profil : formations, expériences, langues — sans formulaire fastidieux.", path: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100-8 4 4 0 000 8z" },
              { n: "02", t: "Swipez les opportunités faites pour vous", d: "Bourses, emplois, concours, résidences — triés selon votre profil. Glissez à droite celles qui vous intéressent.", path: "M2 7h20 M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" },
              { n: "03", t: "Générez votre dossier en un clic", d: "CV et lettre de motivation personnalisés, rédigés par l'IA pour chaque opportunité — dans la bonne langue, jamais recopiés.", path: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 13l2 2 4-4" },
              { n: "04", t: "Suivez vos candidatures et deadlines", d: "Tableau de bord clair, checklist des pièces exigées et alertes avant chaque date limite. Vous candidatez toujours à temps.", path: "M3 3v18h18 M7 14l4-4 3 3 5-6" },
            ].map((step, i) => (
              <div key={step.n} className={`flex flex-col gap-8 items-center md:gap-12 ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                {/* Texte */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <span style={{ fontSize: "2.4rem", fontWeight: 900, color: "rgba(124,58,237,0.35)", letterSpacing: "-0.04em", lineHeight: 1 }}>{step.n}</span>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={step.path} /></svg>
                    </div>
                  </div>
                  <h3 className="font-bold mb-3" style={{ fontSize: "1.45rem", letterSpacing: "-0.02em", color: "#0a0a0a" }}>{step.t}</h3>
                  <p style={{ fontSize: "0.95rem", color: "rgba(10,10,10,0.5)", lineHeight: 1.7, maxWidth: 420 }}>{step.d}</p>
                </div>

                {/* Capture / illustration de l'étape */}
                <div className="flex-1 w-full">
                  {step.n === "01" ? (
                    <div style={{ aspectRatio: "16 / 10", width: "100%", maxWidth: 420, margin: "0 auto", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
                      <Image src="/apercu-amara.png" alt="Création de profil avec Amara, l'assistante IA" width={900} height={563} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{
                      aspectRatio: "16 / 10", width: "100%", maxWidth: 420, margin: "0 auto", borderRadius: 18,
                      background: "linear-gradient(135deg, rgba(124,58,237,0.07), rgba(124,58,237,0.02))",
                      border: "1px dashed rgba(124,58,237,0.4)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                    }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(124,58,237,0.8)" }}>Capture à venir</span>
                      <span style={{ fontSize: "0.72rem", color: "rgba(10,10,10,0.3)" }}>Étape {step.n}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités principales + simulation téléphone (fond violet Aura) ── */}
      <section id="fonctionnalites" className="py-28 px-8" style={{ background: "linear-gradient(160deg,#0e0420 0%,#1e0845 45%,#2a1060 60%,#1a0840 100%)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          {/* En-tête centré */}
          <p className="text-center text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#c4b5fd" }}>
            Fonctionnalités principales
          </p>
          <h2 className="text-center font-extrabold text-white mb-5" style={{ fontSize: "clamp(2rem,3.4vw,3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Une candidature complète,<br />portée par l&apos;IA
          </h2>
          <p className="text-center mx-auto mb-16" style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", lineHeight: 1.65, maxWidth: 520 }}>
            Tout ce qu&apos;il faut pour candidater vite et bien, depuis votre téléphone.
          </p>

          {/* Fonctionnalités · Téléphone · Fonctionnalités */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-12 lg:gap-10 items-center">

            {/* Gauche (miroir : icône à droite, texte aligné à droite) */}
            <div className="order-2 lg:order-1 flex flex-col gap-10">
              {[
                { t: "Amara, votre assistante IA", d: "Elle vous interviewe et construit votre profil en conversation — sans formulaire à remplir.", path: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
                { t: "Dossiers personnalisés", d: "CV et lettre générés pour chaque opportunité. Jamais génériques, jamais recopiés.", path: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8" },
              ].map((f) => (
                <div key={f.t} className="flex gap-4 lg:flex-row-reverse lg:text-right">
                  <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 13, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={f.path} /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1" style={{ fontSize: "1.05rem" }}>{f.t}</h3>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Téléphone (au centre) */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="float-anim" style={{
                width: 268, flexShrink: 0, borderRadius: 42, padding: 10,
                background: "linear-gradient(160deg,#1a1a1d,#050505)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 70px rgba(124,58,237,0.25)",
              }}>
                <div style={{ position: "relative", borderRadius: 33, overflow: "hidden", background: "#0a0a0a", height: 530 }}>
                  {/* Dynamic island */}
                  <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 84, height: 23, borderRadius: 999, background: "#000", zIndex: 20 }} />

                  {/* Barre de statut */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px 0" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>9:41</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="15" height="10" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4"/></svg>
                      <svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="#fff" strokeWidth="1.4"><path d="M1 4.5a10 10 0 0114 0M3.5 7a6.5 6.5 0 019 0M8 9.5h.01"/></svg>
                      <svg width="21" height="10" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="#fff" opacity="0.5"/><rect x="2" y="2" width="15" height="8" rx="1.5" fill="#fff"/><rect x="21.5" y="4" width="2" height="4" rx="1" fill="#fff" opacity="0.5"/></svg>
                    </div>
                  </div>

                  {/* En-tête conversation */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 16px 13px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff" }}>A</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.83rem", fontWeight: 700, color: "#fff" }}>Amara</p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.66rem", color: "rgba(255,255,255,0.45)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                        En ligne
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
                    <div className="msg-in" style={{ animationDelay: "0.2s", alignSelf: "flex-start", maxWidth: "84%", padding: "8px 12px", borderRadius: "4px 13px 13px 13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p style={{ fontSize: "0.77rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Bonjour ! Quel est votre niveau d&apos;études ?</p>
                    </div>
                    <div className="msg-in" style={{ animationDelay: "0.7s", alignSelf: "flex-end", maxWidth: "84%", padding: "8px 12px", borderRadius: "13px 4px 13px 13px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 2px 14px rgba(124,58,237,0.3)" }}>
                      <p style={{ fontSize: "0.77rem", color: "#fff", lineHeight: 1.5 }}>Master 1 en informatique</p>
                    </div>
                    <div className="msg-in" style={{ animationDelay: "1.2s", alignSelf: "flex-start", maxWidth: "84%", padding: "8px 12px", borderRadius: "4px 13px 13px 13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p style={{ fontSize: "0.77rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Parfait. J&apos;ai trouvé 3 bourses pour vous.</p>
                    </div>
                    <div className="msg-in" style={{ animationDelay: "1.7s", alignSelf: "flex-end", maxWidth: "84%", padding: "8px 12px", borderRadius: "13px 4px 13px 13px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 2px 14px rgba(124,58,237,0.3)" }}>
                      <p style={{ fontSize: "0.77rem", color: "#fff", lineHeight: 1.5 }}>Génère mon dossier pour la première</p>
                    </div>
                    <div className="msg-in" style={{ animationDelay: "2.2s", alignSelf: "flex-start", maxWidth: "84%", padding: "8px 12px", borderRadius: "4px 13px 13px 13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p style={{ fontSize: "0.77rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>C&apos;est parti — CV et lettre en préparation…</p>
                    </div>
                  </div>

                  {/* Barre de saisie */}
                  <div style={{ position: "absolute", bottom: 13, left: 12, right: 12, display: "flex", alignItems: "center", gap: 8, padding: "7px 7px 7px 13px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ flex: 1, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Répondez à Amara…</span>
                    <div style={{ width: 29, height: 29, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Droite (normal : icône à gauche) */}
            <div className="order-3 flex flex-col gap-10">
              {[
                { t: "Traduction intégrée", d: "Les offres en anglais, allemand ou espagnol traduites en un clic, avant de candidater.", path: "M12 2a10 10 0 100 20 10 10 0 000-20z M2 12h20 M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" },
                { t: "Alertes deadline", d: "Des rappels clairs avant chaque date limite. Vous ne ratez plus jamais une candidature.", path: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0" },
              ].map((f) => (
                <div key={f.t} className="flex gap-4">
                  <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 13, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={f.path} /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1" style={{ fontSize: "1.05rem" }}>{f.t}</h3>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Sécurité & conformité ── */}
      <section className="py-28 px-8" style={{ background: "#fff", borderTop: "1px solid rgba(10,10,10,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 mb-5" style={{ padding: "5px 14px", borderRadius: "999px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#7c3aed" }}>Sécurité &amp; confidentialité</span>
            </span>
            <h2 className="font-extrabold mb-5" style={{ fontSize: "clamp(2rem,3.6vw,3.1rem)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0a0a0a" }}>
              Vos documents les plus sensibles,<br />entre de bonnes mains.
            </h2>
            <p className="mx-auto" style={{ color: "rgba(10,10,10,0.5)", fontSize: "1rem", maxWidth: 540, lineHeight: 1.65 }}>
              Diplômes, relevés, pièces d&apos;identité : tout ce que vous confiez à Matchwork est protégé. Vos données ne servent qu&apos;à vous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                t: "Coffre-fort chiffré",
                d: "Vos documents sont chiffrés et accessibles à vous seul. Personne d'autre n'y accède.",
                path: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
              },
              {
                t: "Vos données restent les vôtres",
                d: "Jamais revendues, jamais utilisées pour entraîner une IA. Vous pouvez tout supprimer à tout moment.",
                path: "M12 2l8 3v7c0 6-8 10-8 10S4 18 4 12V5l8-3z",
              },
              {
                t: "Paiement Mobile Money",
                d: "MTN MoMo, Moov, BjPay. Aucune carte bancaire requise, aucune donnée de paiement stockée chez nous.",
                path: "M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2zM2 10h20M6 15h4",
              },
            ].map((p, i) => (
              <div
                key={p.t}
                className="feature-card float-anim"
                style={{ padding: "26px 22px", borderRadius: "18px", background: "rgba(10,10,10,0.025)", border: "1px solid rgba(10,10,10,0.08)", animationDelay: `${i * 0.6}s` }}
              >
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.path} />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ fontSize: "1rem", color: "#0a0a0a" }}>{p.t}</h3>
                <p style={{ fontSize: "0.86rem", color: "rgba(10,10,10,0.5)", lineHeight: 1.6 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages — défilement automatique ── */}
      <section style={{ background: "#fff", borderTop: "1px solid rgba(10,10,10,0.06)", paddingTop: "80px", paddingBottom: "80px", overflow: "hidden" }}>
        <p className="text-center text-xs font-semibold tracking-widest uppercase mb-4 px-8" style={{ color: "rgba(124,58,237,0.7)" }}>
          Témoignages
        </p>
        <h2 className="text-center font-extrabold mb-14 px-8" style={{ fontSize: "clamp(2rem,3.5vw,3rem)", letterSpacing: "-0.025em", color: "#0a0a0a" }}>
          Ils ont décroché leur opportunité
        </h2>
        <div style={{ overflow: "hidden", width: "100%" }}>
          <div className="testimonials-track" style={{ padding: "6px 0 20px" }}>
            {[...temoignages, ...temoignages].map((t, i) => (
              <div
                key={i}
                style={{
                  minWidth: "300px", maxWidth: "320px", borderRadius: "20px", padding: "22px",
                  background: "rgba(10,10,10,0.03)", border: "1px solid rgba(10,10,10,0.08)",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
                  {Array.from({ length: t.etoiles }).map((_, s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(10,10,10,0.62)" }}>
                  &ldquo;{t.texte}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                      background: t.couleur,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 700, color: "#fff",
                    }}
                  >
                    {t.initiales}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0a0a0a" }}>{t.nom}</p>
                    <p className="text-xs" style={{ color: "rgba(10,10,10,0.4)" }}>{t.ville}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 px-8" style={{ background: "#fff", borderTop: "1px solid rgba(10,10,10,0.08)" }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(FAQ_ITEMS as unknown as { q: string; r: string }[])) }} />
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(124,58,237,0.9)" }}>
            FAQ
          </p>
          <h2 className="text-center font-extrabold mb-14" style={{ fontSize: "clamp(2rem,3.5vw,3rem)", letterSpacing: "-0.03em", color: "#0a0a0a" }}>
            Vos questions, nos réponses
          </h2>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((f) => (
              <details key={f.q} className="faq-item" style={{ borderRadius: "14px", background: "rgba(10,10,10,0.025)", border: "1px solid rgba(10,10,10,0.08)", overflow: "hidden" }}>
                <summary className="faq-summary" style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", cursor: "pointer" }}>
                  <span className="font-semibold" style={{ fontSize: "0.95rem", color: "#0a0a0a" }}>{f.q}</span>
                  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <p style={{ padding: "0 20px 20px", fontSize: "0.88rem", color: "rgba(10,10,10,0.55)", lineHeight: 1.65 }}>
                  {f.r}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tarifs (composant client avec toggle mensuel/annuel) ── */}
      <SectionTarifs />

      {/* ── CTA final ── */}
      <section
        className="py-16 px-8 text-center relative overflow-hidden"
        style={{ background: "#fff", borderTop: "1px solid rgba(10,10,10,0.06)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 100%,rgba(124,58,237,0.08),transparent)" }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2
            className="font-extrabold mb-3"
            style={{ fontSize: "clamp(1.6rem,3.6vw,2.4rem)", letterSpacing: "-0.03em", color: "#0a0a0a" }}
          >
            Votre prochaine opportunité <br />commence ici.
          </h2>
          <p className="mb-8 text-base" style={{ color: "rgba(10,10,10,0.45)" }}>
            Rejoignez des centaines de candidats qui ont déjà généré leur dossier avec Matchwork.
          </p>
          <Link
            href="/inscription"
            className="hover-glow inline-flex items-center justify-center px-10 py-3.5 text-base font-semibold rounded-xl"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 0 50px rgba(124,58,237,0.3)" }}
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 32px 32px" }}>

          {/* Grid principal */}
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>

            {/* Marque */}
            <div className="footer-brand">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 0 }}>
                <Image src="/logo.png" alt="Matchwork" width={34} height={34} />
                <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.025em" }}>Matchwork</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginTop: "14px", maxWidth: "270px" }}>
                La plateforme IA qui trouve vos opportunités et génère vos dossiers de candidature. Bourses, emplois, concours, résidences.
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
                {["MTN MoMo", "Moov", "BjPay"].map(m => (
                  <span key={m} style={{ fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>{m}</span>
                ))}
              </div>
            </div>

            {/* Produit */}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "18px" }}>Produit</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                {["Bourses", "Emplois", "Concours", "Résidences", "Tarifs"].map(l => (
                  <li key={l}>
                    <Link href="/inscription" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.18s ease" }}>
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "18px" }}>Support</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                {["Contact", "FAQ", "Documentation", "Statut"].map(l => (
                  <li key={l}>
                    <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Légal */}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "18px" }}>Légal</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                {["Conditions d'utilisation", "Confidentialité", "Cookies"].map(l => (
                  <li key={l}>
                    <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Barre inférieure */}
          <div className="footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
              © 2026 Matchwork · Conçu pour les candidats d&apos;Afrique de l&apos;Ouest francophone
            </p>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
              Cotonou, Bénin 🇧🇯
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}

const temoignages = [
  { nom: "Aïcha K.", ville: "Étudiante en master · Cotonou", texte: "J'ai obtenu ma bourse Campus France en 3 semaines. Matchwork a généré ma lettre en moins de 2 minutes, et elle était parfaite.", etoiles: 5, initiales: "AK", couleur: "linear-gradient(135deg,#7c3aed,#a78bfa)" },
  { nom: "Moussa D.", ville: "Ingénieur junior · Dakar", texte: "Grâce au swipe, j'ai découvert des emplois que je n'aurais jamais trouvés seul. Le CV généré m'a décroché 3 entretiens en un mois.", etoiles: 5, initiales: "MD", couleur: "linear-gradient(135deg,#0d3d80,#1a6bc9)" },
  { nom: "Fatou B.", ville: "Artiste visuelle · Abidjan", texte: "La résidence artistique à Paris, c'était mon rêve. Matchwork a tout géré : traduction, dossier, checklist. Je suis partie 6 mois.", etoiles: 5, initiales: "FB", couleur: "linear-gradient(135deg,#be185d,#ec4899)" },
  { nom: "Ibrahim C.", ville: "Doctorant · Lomé", texte: "La checklist intelligente m'a évité d'oublier 3 documents obligatoires. Sans Matchwork, j'aurais raté la deadline.", etoiles: 4, initiales: "IC", couleur: "linear-gradient(135deg,#0d9488,#2dd4bf)" },
  { nom: "Mariama S.", ville: "Architecte · Porto-Novo", texte: "Le paiement via MTN MoMo c'est une révolution. Enfin une SaaS africaine pensée pour nous, pas pour l'Europe.", etoiles: 5, initiales: "MS", couleur: "linear-gradient(135deg,#d97706,#fbbf24)" },
  { nom: "Kofi A.", ville: "Développeur · Accra", texte: "J'ai postulé à 8 offres en 2 jours. Chaque lettre était unique et ciblée. Un gain de temps incroyable.", etoiles: 5, initiales: "KA", couleur: "linear-gradient(135deg,#1d4ed8,#60a5fa)" },
  { nom: "Aminata T.", ville: "Sage-femme · Bamako", texte: "Je cherchais une formation en santé publique à l'étranger. L'IA m'a trouvé 12 offres correspondant exactement à mon profil en moins d'une heure.", etoiles: 5, initiales: "AT", couleur: "linear-gradient(135deg,#059669,#34d399)" },
  { nom: "Yao P.", ville: "Comptable · Ouagadougou", texte: "L'interface est intuitive même pour quelqu'un qui n'est pas très tech. J'ai envoyé mon premier dossier complet le jour même de mon inscription.", etoiles: 4, initiales: "YP", couleur: "linear-gradient(135deg,#7c2d12,#ea580c)" },
  { nom: "Blessing O.", ville: "Étudiante en droit · Lagos", texte: "En tant qu'anglophone, la traduction automatique des offres francophones m'a permis de postuler à des bourses que je n'aurais jamais vues autrement.", etoiles: 5, initiales: "BO", couleur: "linear-gradient(135deg,#6d28d9,#c084fc)" },
  { nom: "Seydou N.", ville: "Agronome · Niamey", texte: "3 candidatures le premier jour, une réponse positive en 10 jours. Le dossier généré était plus professionnel que ce que j'aurais pu faire seul.", etoiles: 5, initiales: "SN", couleur: "linear-gradient(135deg,#0369a1,#38bdf8)" },
];

