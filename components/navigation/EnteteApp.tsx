"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bouton } from "@/components/ui/bouton";

interface EnteteAppProps {
  titre?: string;
  retour?: string;
}

export function EnteteApp({ titre, retour }: EnteteAppProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      {retour && (
        <Link href={retour} className="text-gray-500 hover:text-gray-700 p-1 -ml-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      )}
      <div className="flex-1 min-w-0">
        {titre ? (
          <h1 className="text-base font-semibold text-gray-900 truncate">{titre}</h1>
        ) : (
          <Link href="/" className="text-indigo-600 font-bold text-lg tracking-tight">
            Matchwork
          </Link>
        )}
      </div>
      <Bouton
        variante="fantome"
        taille="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-gray-500 text-xs"
      >
        Déconnexion
      </Bouton>
    </header>
  );
}
