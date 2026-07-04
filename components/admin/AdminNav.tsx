"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Item = { href: string; label: string; badge?: number; icone: React.ReactNode };

export function AdminNav({ email = "", aValiderCount = 0 }: { email?: string; aValiderCount?: number }) {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/admin", label: "Suivi & santé", icone: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>) },
    { href: "/admin/robot", label: "Robot de collecte", icone: (<><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4" /><circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" /><path d="M2 14h1M21 14h1" /></>) },
    { href: "/admin/validation", label: "File de validation", badge: aValiderCount, icone: (<><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>) },
    { href: "/admin/opportunites", label: "Opportunités", icone: (<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>) },
    { href: "/admin/sources", label: "Sources de flux", icone: (<><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></>) },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icone: (<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>) },
    { href: "/admin/paiements", label: "Paiements & quotas", icone: (<><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>) },
    { href: "/admin/parametres", label: "Paramètres", icone: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>) },
  ];

  const actif = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <aside
        className="fixed top-0 left-0 z-50 h-full flex flex-col"
        style={{
          width: "var(--admin-w, 64px)", background: "var(--nav-bg)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border)", transition: "width 0.2s ease",
        }}
      >
        {/* Logo + badge Admin */}
        <div className="flex items-center gap-2.5 px-3.5 py-4" style={{ minHeight: 64 }}>
          <Image src="/logo.png" alt="Matchwork" width={34} height={34} priority style={{ flexShrink: 0 }} />
          <div className="admin-label" style={{ minWidth: 0 }}>
            <p className="font-bold text-sm" style={{ color: "var(--text)", lineHeight: 1.1 }}>Matchwork</p>
            <p style={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a78bfa" }}>Admin</p>
          </div>
        </div>

        {/* Sections */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2 flex flex-col gap-0.5">
          {items.map((it) => {
            const a = actif(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                title={it.label}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all sidebar-item"
                style={{
                  color: a ? "#fff" : "var(--text)",
                  background: a ? "#7c3aed" : undefined,
                  fontWeight: a ? 600 : 500,
                  textDecoration: "none",
                  boxShadow: a ? "0 6px 18px rgba(124,58,237,0.38)" : undefined,
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", color: a ? "#fff" : "#7c3aed" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{it.icone}</svg>
                </span>
                <span className="text-sm admin-label" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{it.label}</span>
                {it.badge ? (
                  <span className="admin-label" style={{ fontSize: "0.68rem", fontWeight: 700, minWidth: 18, textAlign: "center", padding: "1px 6px", borderRadius: 999, background: a ? "rgba(255,255,255,0.25)" : "rgba(124,58,237,0.16)", color: a ? "#fff" : "#a78bfa" }}>{it.badge}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bas : retour app + profil + déconnexion */}
        <div className="px-2.5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/tableau-de-bord" className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors sidebar-item" style={{ color: "var(--text-2)", textDecoration: "none" }} title="Retour à l'app">
            <svg className="w-5 h-5" style={{ flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            <span className="text-sm admin-label" style={{ whiteSpace: "nowrap" }}>Retour à l&apos;app</span>
          </Link>
          <div className="flex items-center gap-2.5 mt-2 px-2 py-2 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{(email.trim()[0] || "A").toUpperCase()}</div>
            <div className="admin-label" style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.split("@")[0] || "Admin"}</p>
              <p style={{ fontSize: "0.66rem", color: "#a78bfa" }}>Administrateur</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="admin-label" style={{ flexShrink: 0, color: "var(--text-3)", background: "transparent", cursor: "pointer", padding: 4, borderRadius: 8 }} title="Déconnexion">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        :root { --admin-w: 64px; }
        .admin-label { display: none; }
        .admin-content-offset { margin-left: 64px; }
        @media (min-width: 768px) {
          :root { --admin-w: 250px; }
          .admin-label { display: block; }
          .admin-content-offset { margin-left: 250px; }
        }
        .sidebar-item:hover { background: var(--bg-card-hover); }
      `}</style>
    </>
  );
}
