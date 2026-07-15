import Link from "next/link";
import { ShellPublic } from "@/components/public/ShellPublic";
import type { Guide } from "@/lib/guides";

const LABEL_CATEGORIE: Record<Guide["categorie"], string> = {
  bourses: "Bourses",
  candidature: "Candidature",
  emploi: "Emploi",
  projets: "Appels à projets",
};

export function GuideLayout({ guide, children }: { guide: Guide; children: React.ReactNode }) {
  return (
    <ShellPublic>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 60px" }}>
        <nav aria-label="Fil d'Ariane" style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 18 }}>
          <Link href="/guides" style={{ color: "var(--text-3)", textDecoration: "none" }}>Guides</Link>
        </nav>

        <span style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7c3aed", background: "rgba(124,58,237,0.1)", padding: "4px 11px", borderRadius: 7, marginBottom: 14 }}>
          {LABEL_CATEGORIE[guide.categorie]}
        </span>

        <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.22, letterSpacing: "-0.02em", marginBottom: 12 }}>
          {guide.titre}
        </h1>

        <div style={{ display: "flex", gap: 14, fontSize: "0.82rem", color: "var(--text-3)", marginBottom: 30, paddingBottom: 22, borderBottom: "1px solid var(--border)" }}>
          <span>{new Date(guide.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span>·</span>
          <span>{guide.dureeLecture} de lecture</span>
        </div>

        {/* Contenu de l'article — typographie soignée pour la lecture longue */}
        <div className="guide-content" style={{ fontSize: "1rem", color: "var(--text)", lineHeight: 1.75 }}>
          {children}
        </div>

        {/* CTA conversion */}
        <div style={{ marginTop: 40, padding: "26px 22px", borderRadius: 16, background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.03))", border: "1px solid rgba(124,58,237,0.25)", textAlign: "center" }}>
          <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            Laissez l&apos;IA rédiger ce document pour vous
          </p>
          <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
            Matchwork génère un dossier personnalisé (CV, lettre, note conceptuelle) adapté à chaque offre réelle, en quelques minutes.
          </p>
          <Link
            href="/inscription"
            style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.92rem", textDecoration: "none", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}
          >
            Essayer gratuitement
          </Link>
        </div>
      </article>

      <style>{`
        .guide-content h2 { font-size: 1.3rem; font-weight: 700; color: var(--text); margin: 32px 0 12px; letter-spacing: -0.01em; }
        .guide-content h3 { font-size: 1.08rem; font-weight: 700; color: var(--text); margin: 24px 0 10px; }
        .guide-content p { margin-bottom: 16px; color: var(--text-2); }
        .guide-content ul, .guide-content ol { margin: 0 0 16px; padding-left: 22px; color: var(--text-2); }
        .guide-content li { margin-bottom: 8px; line-height: 1.65; }
        .guide-content strong { color: var(--text); font-weight: 700; }
        .guide-content blockquote { margin: 20px 0; padding: 14px 18px; border-left: 3px solid #7c3aed; background: rgba(124,58,237,0.05); border-radius: 0 10px 10px 0; font-style: italic; color: var(--text-2); }
        .guide-content .exemple { margin: 18px 0; padding: 18px 20px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border); font-size: 0.92rem; line-height: 1.7; white-space: pre-wrap; color: var(--text-2); }
      `}</style>
    </ShellPublic>
  );
}
