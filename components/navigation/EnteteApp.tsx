"use client";

import Link from "next/link";

interface EnteteAppProps {
  titre?: string;
  retour?: string;
}

export function EnteteApp({ titre, retour }: EnteteAppProps) {
  return (
    <header
      className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
      style={{
        background: "var(--header-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {retour && (
        <Link href={retour} className="p-1.5 rounded-lg -ml-1" style={{ color: "var(--text-2)" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      )}
      <h1 className="text-base font-semibold truncate" style={{ color: "var(--text)" }}>
        {titre ?? "Matchwork"}
      </h1>
    </header>
  );
}
