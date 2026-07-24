import { ShellPublic } from "@/components/public/ShellPublic";

/** Enveloppe commune aux pages légales (cookies, confidentialité, mentions légales…). */
export function LegalLayout({ titre, majAJour, children }: { titre: string; majAJour: string; children: React.ReactNode }) {
  return (
    <ShellPublic>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 60px" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.22, letterSpacing: "-0.02em", marginBottom: 10 }}>
          {titre}
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
          Dernière mise à jour : {majAJour}
        </p>
        <div className="legal-content" style={{ fontSize: "0.95rem", color: "var(--text)", lineHeight: 1.7 }}>
          {children}
        </div>
      </article>
      <style>{`
        .legal-content h2 { font-size: 1.2rem; font-weight: 700; color: var(--text); margin: 30px 0 12px; letter-spacing: -0.01em; }
        .legal-content h3 { font-size: 1.02rem; font-weight: 700; color: var(--text); margin: 22px 0 8px; }
        .legal-content p { margin-bottom: 14px; color: var(--text-2); }
        .legal-content ul, .legal-content ol { margin: 0 0 14px; padding-left: 22px; color: var(--text-2); }
        .legal-content li { margin-bottom: 6px; line-height: 1.6; }
        .legal-content strong { color: var(--text); font-weight: 700; }
        .legal-content a { color: #7c3aed; text-decoration: underline; }
      `}</style>
    </ShellPublic>
  );
}
