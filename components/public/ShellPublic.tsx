import Link from "next/link";
import Image from "next/image";

/**
 * Enveloppe légère (en-tête + pied) pour les pages publiques indexables
 * (offres, catégories) — hors du shell applicatif réservé aux membres.
 * Utilise les tokens de thème pour rester lisible en clair comme en sombre.
 */
export function ShellPublic({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--header-bg)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <Image src="/logo.png" alt="Matchwork" width={30} height={30} priority />
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>Matchwork</span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/offres" className="lien-public" style={{ fontSize: "0.85rem", color: "var(--text-2)", textDecoration: "none" }}>
              Toutes les offres
            </Link>
            <Link href="/guides" className="lien-public" style={{ fontSize: "0.85rem", color: "var(--text-2)", textDecoration: "none" }}>
              Guides
            </Link>
            <Link href="/blog" className="lien-public" style={{ fontSize: "0.85rem", color: "var(--text-2)", textDecoration: "none" }}>
              Blog
            </Link>
            <Link
              href="/inscription"
              style={{ fontSize: "0.85rem", fontWeight: 600, padding: "8px 16px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", textDecoration: "none" }}
            >
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, width: "100%" }}>{children}</main>

      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)", marginTop: 48 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 20px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", maxWidth: 420, lineHeight: 1.6 }}>
            Matchwork — la plateforme qui trouve vos opportunités (bourses, emplois, concours) et génère vos dossiers de candidature pour l&apos;Afrique de l&apos;Ouest.
          </p>
          <nav style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Link href="/offres/categorie/bourses" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Bourses</Link>
            <Link href="/offres/categorie/emplois" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Emplois</Link>
            <Link href="/offres/categorie/stages" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Stages</Link>
            <Link href="/guides" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Guides</Link>
            <Link href="/blog" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Blog</Link>
            <Link href="/inscription" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Créer un compte</Link>
            <Link href="/legal/confidentialite" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Confidentialité</Link>
            <Link href="/legal/cookies" className="lien-public" style={{ fontSize: "0.82rem", color: "var(--text-2)", textDecoration: "none" }}>Cookies</Link>
          </nav>
        </div>

        {/* Carte Product Hunt — soutient le lancement, à retirer si besoin après. */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              maxWidth: 460,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
            }}
          >
            <img
              src="https://ph-files.imgix.net/b99f4a0e-dcf2-4f41-9b40-462e34defc27.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80"
              alt="Matchwork sur Product Hunt"
              width={48}
              height={48}
              style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>Matchwork</p>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--text-3)", lineHeight: 1.4 }}>
                Bourses, emplois et dossiers de candidature générés par IA
              </p>
            </div>
            <a
              href="https://www.producthunt.com/products/matchwork?embed=true&utm_source=embed&utm_medium=post_embed"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flexShrink: 0,
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "8px 12px",
                borderRadius: 8,
                background: "#FF6154",
                color: "#fff",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Voir sur Product Hunt →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
