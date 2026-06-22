"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primaire" | "secondaire" | "fantome" | "danger";
  taille?: "sm" | "md" | "lg";
  chargement?: boolean;
}

export const Bouton = forwardRef<HTMLButtonElement, BoutonProps>(
  (
    { className, variante = "primaire", taille = "md", chargement, disabled, children, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variantes = {
      primaire: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      secondaire: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
      fantome: "text-indigo-600 hover:bg-indigo-50",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };

    const tailles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || chargement}
        className={cn(base, variantes[variante], tailles[taille], className)}
        {...props}
      >
        {chargement && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
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
