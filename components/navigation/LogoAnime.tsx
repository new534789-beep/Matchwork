"use client";

import { useId } from "react";
import { useGeneration } from "@/lib/generation/GenerationContext";

/**
 * Logo "M" de Matchwork. Pendant une génération de dossier en fond (voir
 * GenerationContext), l'intérieur blanc du M se remplit et se vide en boucle
 * de violet — visible depuis n'importe quelle page, pas seulement celle où la
 * génération a été lancée.
 */
export function LogoAnime({ size = 36 }: { size?: number }) {
  const { enGeneration } = useGeneration();
  const clipId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path
        d="M 10 95 L 10 195 Q 10 215 30 215 L 170 215 Q 190 215 190 195 L 190 95 L 152 8 L 100 68 L 48 8 Z"
        fill="#7c3aed"
      />
      <clipPath id={clipId}>
        <path d="M 38 188 L 38 108 L 100 158 L 162 108 L 162 188 L 138 188 L 138 128 L 100 168 L 62 128 L 62 188 Z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x="38" y="108" width="124" height="80" fill="white" />
        {enGeneration && (
          <rect x="38" y="108" width="124" height="80" fill="#7c3aed" className="logo-anime-remplissage" />
        )}
      </g>
      {enGeneration && (
        <style jsx>{`
          .logo-anime-remplissage {
            transform-box: fill-box;
            transform-origin: bottom;
            animation: mw-remplissage 1.6s ease-in-out infinite;
          }
          @keyframes mw-remplissage {
            0% { transform: scaleY(0); }
            50% { transform: scaleY(1); }
            100% { transform: scaleY(0); }
          }
        `}</style>
      )}
    </svg>
  );
}
