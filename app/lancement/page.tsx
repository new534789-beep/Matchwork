import type { Metadata } from "next";
import { BarreEntete, Bloc, Carte, Ligne } from "@/components/chargement/Squelette";
import { Redirection } from "./Redirection";

/**
 * Page de démarrage de l'application installée (`start_url` du manifeste).
 *
 * Le problème qu'elle résout : `start_url` pointait vers /opportunites, une
 * page protégée qui résout la session puis interroge la base à Francfort. Un
 * appui sur l'icône déclenchait donc toute cette chaîne AVANT le moindre pixel
 * — plusieurs secondes sur une connexion lente, davantage si la base dormait.
 *
 * Cette page-ci ne lit ni session ni base. Elle est donc entièrement statique,
 * préchargée par le service worker, et s'affiche depuis le téléphone sans
 * réseau. L'utilisateur voit l'interface immédiatement ; la vraie page se
 * charge derrière et prend le relais.
 *
 * Le squelette reprend volontairement celui de l'espace connecté : au moment du
 * relais, la mise en page ne saute pas.
 */

export const metadata: Metadata = {
  title: "Matchwork",
  // Page technique, sans contenu propre : elle n'a rien à faire dans l'index.
  robots: { index: false, follow: false },
};

// Aucune donnée dynamique : Next peut la pré-rendre à la construction.
export const dynamic = "force-static";

export default function Lancement() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Redirection vers="/opportunites" />
      <BarreEntete />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full" aria-busy="true">
        <p className="sr-only">Ouverture de Matchwork…</p>

        <div className="mb-7">
          <Ligne w="45%" h={26} />
          <Ligne w="65%" h={13} style={{ marginTop: 10 }} />
        </div>

        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Carte key={i} hauteur={150}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Bloc style={{ width: 88, height: 16, borderRadius: 6 }} />
                <Ligne w="80%" h={16} />
                <Ligne w="55%" h={13} />
              </div>
            </Carte>
          ))}
        </div>
      </main>
    </div>
  );
}
