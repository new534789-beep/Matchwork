"use client";

import Image from "next/image";
import { useGeneration } from "@/lib/generation/GenerationContext";

/**
 * Logo Matchwork inchangé (logo-glossy.png). Pendant une génération de
 * dossier en fond (voir GenerationContext), un anneau violet pulse autour —
 * signal additif, ne remplace jamais l'image du logo.
 */
export function LogoAnime({ size = 36 }: { size?: number }) {
  const { enGeneration } = useGeneration();

  return (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <Image src="/logo-glossy.png" alt="Matchwork" width={size} height={size} priority style={{ flexShrink: 0, position: "relative", zIndex: 1 }} />
      {enGeneration && (
        <span
          className="logo-anime-halo"
          style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            border: "2px solid #7c3aed", pointerEvents: "none",
          }}
        />
      )}
      {enGeneration && (
        <style jsx>{`
          .logo-anime-halo {
            animation: mw-halo 1.4s ease-in-out infinite;
          }
          @keyframes mw-halo {
            0% { opacity: 0.9; transform: scale(0.9); box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
            70% { opacity: 0; transform: scale(1.25); box-shadow: 0 0 0 6px rgba(124,58,237,0); }
            100% { opacity: 0; transform: scale(1.25); }
          }
        `}</style>
      )}
    </span>
  );
}
