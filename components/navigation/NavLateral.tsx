"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { LogoAnime } from "./LogoAnime";

type Lien = { href: string; label: string; icone: (a: boolean) => React.ReactNode };

const SECTIONS: { titre: string; liens: Lien[] }[] = [
  {
    titre: "Menu",
    liens: [
      {
        href: "/opportunites",
        label: "Accueil",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        ),
      },
      {
        href: "/tableau-de-bord",
        label: "Tableau de bord",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        href: "/candidatures",
        label: "Dossiers",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        href: "/coffre-fort",
        label: "Documents",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        ),
      },
      {
        href: "/messages",
        label: "Messages",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    titre: "Mon espace",
    liens: [
      {
        href: "/profil",
        label: "Profil",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        href: "/compte",
        label: "Compte & abonnement",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        ),
      },
      {
        href: "/parrainage",
        label: "Parrainage",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        href: "/portail",
        label: "Portail organismes",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
      },
      {
        href: "/parametres",
        label: "Paramètres",
        icone: (a) => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

function estActif(pathname: string, href: string) {
  if (href === "/tableau-de-bord") return pathname === href;
  if (href === "/opportunites") return pathname === href || pathname.startsWith("/opportunites/");
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLateral({ userEmail = "", role }: { userEmail?: string; role?: string }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  const initiale = (userEmail.trim()[0] || "U").toUpperCase();
  const nom = userEmail.split("@")[0] || "Mon compte";

  return (
    <>
      {/* Header mobile avec hamburger */}
      <header
        className="mobile-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 60,
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/opportunites" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <LogoAnime size={32} />
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>Matchwork</span>
        </Link>
        <button
          onClick={() => setOuvert(!ouvert)}
          style={{ background: "transparent", cursor: "pointer", padding: 8, borderRadius: 8, color: "var(--text)" }}
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {ouvert ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Backdrop mobile */}
      {ouvert && (
        <div
          className="mobile-backdrop"
          onClick={() => setOuvert(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 69,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`nav-sidebar ${ouvert ? "nav-sidebar-open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 70,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: "var(--sidebar-w, 280px)",
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border)",
          transition: "transform 0.25s ease, width 0.2s ease",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3.5 py-4" style={{ minHeight: 64 }}>
          <Link href="/opportunites" className="flex items-center gap-2.5 min-w-0" style={{ textDecoration: "none" }} onClick={() => setOuvert(false)}>
            <LogoAnime size={36} />
            <span className="font-bold text-base tracking-tight sidebar-label" style={{ color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden" }}>
              Matchwork
            </span>
          </Link>
        </div>

        {/* Navigation par sections */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2">
          {SECTIONS.map((section) => (
            <div key={section.titre} className="mb-4">
              <p
                className="sidebar-label px-2.5 mb-1.5"
                style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}
              >
                {section.titre}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.liens.map((l) => {
                  const actif = estActif(pathname, l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOuvert(false)}
                      className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all sidebar-item"
                      style={{
                        color: actif ? "#fff" : "var(--text)",
                        background: actif ? "#7c3aed" : undefined,
                        fontWeight: actif ? 600 : 500,
                        textDecoration: "none",
                        boxShadow: actif ? "0 6px 18px rgba(124,58,237,0.38)" : undefined,
                      }}
                      title={l.label}
                    >
                      <span style={{ flexShrink: 0, display: "flex", color: actif ? "#fff" : "#7c3aed" }}>{l.icone(actif)}</span>
                      <span className="text-sm sidebar-label" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {l.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {role === "admin" && (
            <div className="mb-4">
              <p
                className="sidebar-label px-2.5 mb-1.5"
                style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}
              >
                Administration
              </p>
              <Link
                href="/admin"
                onClick={() => setOuvert(false)}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all sidebar-item"
                style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}
                title="Espace admin"
              >
                <span style={{ flexShrink: 0, display: "flex", color: "#7c3aed" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <span className="text-sm sidebar-label" style={{ whiteSpace: "nowrap" }}>Espace admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Bas : toggle theme + profil */}
        <div className="px-2.5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors w-full sidebar-item"
            style={{ color: "var(--text-2)", cursor: "pointer" }}
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" style={{ flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="w-5 h-5" style={{ flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
            <span className="text-sm font-medium sidebar-label" style={{ whiteSpace: "nowrap" }}>
              {theme === "dark" ? "Mode clair" : "Mode sombre"}
            </span>
          </button>

          <div
            className="flex items-center gap-2.5 mt-2 px-2 py-2 rounded-xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div
              style={{
                width: 34, height: 34, flexShrink: 0, borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "0.85rem",
              }}
            >
              {initiale}
            </div>
            <div className="sidebar-label" style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nom}</p>
              <p style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>Candidat</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="sidebar-label"
              style={{ flexShrink: 0, color: "var(--text-3)", background: "transparent", cursor: "pointer", padding: 4, borderRadius: 8 }}
              title="Déconnexion"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* CSS responsive */}
      <style jsx global>{`
        /* Mobile : sidebar cachée, header visible */
        :root { --sidebar-w: 280px; }
        .nav-sidebar { transform: translateX(-100%); }
        .nav-sidebar-open { transform: translateX(0); box-shadow: 4px 0 30px rgba(0,0,0,0.6); }
        .mobile-header { display: flex !important; }
        .mobile-backdrop { display: block; }
        .sidebar-label { display: block; }
        .sidebar-content-offset { margin-left: 0; padding-top: 56px; position: relative; z-index: 1; }

        /* Tablette : sidebar icônes, pas de header mobile */
        @media (min-width: 768px) {
          :root { --sidebar-w: 64px; }
          .nav-sidebar { transform: translateX(0); }
          .mobile-header { display: none !important; }
          .mobile-backdrop { display: none !important; }
          .sidebar-label { display: none; }
          .sidebar-content-offset { margin-left: 64px; padding-top: 0; }
        }

        /* Desktop : sidebar etendue */
        @media (min-width: 1024px) {
          :root { --sidebar-w: 250px; }
          .sidebar-label { display: block; }
          .sidebar-content-offset { margin-left: 250px; }
        }

        .sidebar-item:hover { background: var(--bg-card-hover); }
      `}</style>
    </>
  );
}
