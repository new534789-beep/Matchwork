"use client";

import { cn } from "@/lib/utils";
import type { Option } from "@/lib/orientation/questionnaire";

/** Grille de cartes à choisir. Aucun champ de saisie : on clique. */
export function GrilleChoix<T extends string>({
  options,
  valeurs,
  onChoisir,
  multiple = false,
  colonnes = 2,
}: {
  options: Option<T>[];
  valeurs: T[];
  onChoisir: (v: T) => void;
  multiple?: boolean;
  colonnes?: 1 | 2 | 3;
}) {
  const grille =
    colonnes === 1
      ? "grid-cols-1"
      : colonnes === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={cn("grid gap-2.5", grille)} role={multiple ? "group" : "radiogroup"}>
      {options.map((o) => {
        const actif = valeurs.includes(o.valeur);
        return (
          <button
            key={o.valeur}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={actif}
            onClick={() => onChoisir(o.valeur)}
            className="text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
            style={{
              background: actif ? "rgba(124,58,237,0.10)" : "var(--bg-card)",
              border: `1px solid ${actif ? "var(--purple)" : "var(--border)"}`,
              boxShadow: actif ? "0 0 0 1px var(--purple)" : undefined,
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  border: `1.5px solid ${actif ? "var(--purple)" : "var(--border-strong)"}`,
                  borderRadius: multiple ? 5 : 999,
                  background: actif ? "var(--purple)" : "transparent",
                }}
              >
                {actif && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {o.titre}
                </span>
                {o.detail && (
                  <span className="block text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                    {o.detail}
                  </span>
                )}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Fil d'avancement du parcours. */
export function Progression({ etape, total }: { etape: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Étape ${etape} sur ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-1 flex-1 rounded-full transition-all"
          style={{
            background: i < etape ? "var(--purple)" : "var(--border-strong)",
            opacity: i < etape ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
