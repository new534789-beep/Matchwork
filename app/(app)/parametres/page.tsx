"use client";

import { signOut } from "next-auth/react";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { Carte } from "@/components/ui/carte";

export default function Parametres() {
  return (
    <>
      <EnteteApp titre="Paramètres" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          <Carte className="hover-border">
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Confidentialité</h2>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
              Vos données personnelles et vos documents sont stockés de façon chiffrée et ne sont
              accessibles qu&apos;à vous. Aucune donnée n&apos;est partagée avec des tiers sans votre accord.
            </p>
          </Carte>

          <Carte>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Préférences</h2>
            <p className="text-xs leading-relaxed mb-1" style={{ color: "var(--text-2)" }}>
              Le thème clair / sombre se règle depuis la barre latérale.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
              L&apos;interface s&apos;adapte automatiquement à votre choix.
            </p>
          </Carte>

          <Carte className="md:col-span-2">
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Compte</h2>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                padding: "10px 22px", borderRadius: 11,
                background: "#0a0a0a", color: "#fff",
                border: "1px solid var(--border-strong)",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
              }}
            >
              Se déconnecter
            </button>
          </Carte>

        </div>
      </main>
    </>
  );
}
