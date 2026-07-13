"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primaire" | "secondaire" | "fantome" | "danger";
  taille?: "sm" | "md" | "lg";
  chargement?: boolean;
}

export const Bouton = forwardRef<HTMLButtonElement, BoutonProps>(
  ({ className, variante = "primaire", taille = "md", chargement, disabled, children, style, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const tailles = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };

    const styles: Record<string, React.CSSProperties> = {
      primaire: { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
      secondaire: { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" },
      fantome: { background: "transparent", color: "#a78bfa" },
      danger: { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || chargement}
        className={cn(base, tailles[taille], className)}
        style={{ ...styles[variante], ...style }}
        {...props}
      >
        {chargement && (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Bouton.displayName = "Bouton";
