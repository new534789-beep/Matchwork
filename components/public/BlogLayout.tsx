import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShellPublic } from "@/components/public/ShellPublic";

const LABEL_CATEGORIE: Record<string, string> = {
  actualite: "Actualité",
  bourses: "Bourses",
  candidature: "Candidature",
  emploi: "Emploi",
  projets: "Appels à projets",
};

type ArticleAffichage = {
  titre: string;
  contenu: string;
  categorie: string | null;
  publieLe: Date;
  opportunite?: { slug: string | null; intitule: string } | null;
};

export function BlogLayout({ article }: { article: ArticleAffichage }) {
  const categorie = article.categorie ?? "actualite";

  return (
    <ShellPublic>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 60px" }}>
        <nav aria-label="Fil d'Ariane" style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 18 }}>
          <Link href="/blog" style={{ color: "var(--text-3)", textDecoration: "none" }}>Blog</Link>
        </nav>

        <span style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7c3aed", background: "rgba(124,58,237,0.1)", padding: "4px 11px", borderRadius: 7, marginBottom: 14 }}>
          {LABEL_CATEGORIE[categorie] ?? categorie}
        </span>

        <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", fontWeight: 800, color: "var(--text)", lineHeight: 1.22, letterSpacing: "-0.02em", marginBottom: 12 }}>
          {article.titre}
        </h1>

        <div style={{ display: "flex", gap: 14, fontSize: "0.82rem", color: "var(--text-3)", marginBottom: 30, paddingBottom: 22, borderBottom: "1px solid var(--border)" }}>
          <span>{article.publieLe.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        <div className="blog-content" style={{ fontSize: "1rem", color: "var(--text)", lineHeight: 1.75 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.contenu}</ReactMarkdown>
        </div>

        {article.opportunite?.slug && (
          <div style={{ marginTop: 40, padding: "26px 22px", borderRadius: 16, background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.03))", border: "1px solid rgba(124,58,237,0.25)", textAlign: "center" }}>
            <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
              Voir l&apos;offre : {article.opportunite.intitule}
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
              Consultez les conditions complètes et générez votre dossier de candidature avec Matchwork.
            </p>
            <Link
              href={`/offres/${article.opportunite.slug}`}
              style={{ display: "inline-flex", alignItems: "center", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.92rem", textDecoration: "none", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}
            >
              Voir l&apos;offre
            </Link>
          </div>
        )}
      </article>

      <style>{`
        .blog-content h2 { font-size: 1.3rem; font-weight: 700; color: var(--text); margin: 32px 0 12px; letter-spacing: -0.01em; }
        .blog-content h3 { font-size: 1.08rem; font-weight: 700; color: var(--text); margin: 24px 0 10px; }
        .blog-content p { margin-bottom: 16px; color: var(--text-2); }
        .blog-content ul, .blog-content ol { margin: 0 0 16px; padding-left: 22px; color: var(--text-2); }
        .blog-content li { margin-bottom: 8px; line-height: 1.65; }
        .blog-content strong { color: var(--text); font-weight: 700; }
        .blog-content a { color: #7c3aed; }
        .blog-content blockquote { margin: 20px 0; padding: 14px 18px; border-left: 3px solid #7c3aed; background: rgba(124,58,237,0.05); border-radius: 0 10px 10px 0; font-style: italic; color: var(--text-2); }
        .blog-content table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; }
        .blog-content th, .blog-content td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
      `}</style>
    </ShellPublic>
  );
}
