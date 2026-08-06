import type { CSSProperties, ReactNode } from "react";

/**
 * Primitives de squelette partagées par tous les loading.tsx de l'espace
 * connecté. Un squelette utilise des blocs gris aux dimensions réelles du
 * contenu final : quand le contenu remplace le squelette, la mise en page ne
 * saute pas (les cartes ont déjà leur taille définitive).
 *
 * Ces composants sont des Server Components (aucune directive "use client") :
 * ils sont rendus côté serveur et coûtent zéro octet de JavaScript au client.
 */

export function Bloc({ style }: { style?: CSSProperties }) {
  return <div className="squelette-bloc" style={style} aria-hidden />;
}

/** Ligne de texte : hauteur ~0.8em, largeur en % ou en px. */
export function Ligne({ w = "100%", h = 14, style }: { w?: number | string; h?: number; style?: CSSProperties }) {
  return <Bloc style={{ height: h, width: w, borderRadius: 6, ...style }} />;
}

/**
 * Barre d'en-tête collante qui reproduit la géométrie d'EnteteApp.
 *
 * Quand le titre de la page est connu d'avance (les catégories d'opportunités,
 * par exemple), on l'affiche pour de vrai plutôt qu'en bloc gris : l'utilisateur
 * sait immédiatement où il vient d'arriver, au lieu de regarder un squelette
 * anonyme. Les classes reprennent exactement celles d'EnteteApp pour qu'aucun
 * décalage ne se produise au remplacement.
 */
export function BarreEntete({ largeur = 150, titre }: { largeur?: number | string; titre?: string }) {
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
      {titre ? (
        <h1 className="text-base font-semibold truncate" style={{ color: "var(--text)" }}>
          {titre}
        </h1>
      ) : (
        <Ligne w={largeur} h={20} />
      )}
    </header>
  );
}

/** Carte générique aux dimensions d'une carte de contenu. */
export function Carte({
  style,
  children,
  hauteur,
}: {
  style?: CSSProperties;
  children?: ReactNode;
  hauteur?: number | string;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        padding: 20,
        height: hauteur,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Rangée de type liste (carte de dossier, ligne de document...). */
export function Rangée({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "11px 12px",
        borderRadius: 12,
        background: "var(--bg)",
        border: "1px solid var(--border)",
        ...style,
      }}
      aria-hidden
    >
      <Bloc style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <Ligne w="78%" h={13} />
        <Ligne w="45%" h={11} />
      </div>
      <Bloc style={{ width: 56, height: 22, borderRadius: 6, flexShrink: 0 }} />
    </div>
  );
}

/** Grille de cartes de statistiques, même gabarit que les cartes stats du tableau de bord. */
export function GrilleStatsSquelette({ nb = 5 }: { nb?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
      {Array.from({ length: nb }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 18,
            padding: "16px 18px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Bloc style={{ width: 36, height: 36, borderRadius: 11 }} />
            <Bloc style={{ width: 26, height: 26, borderRadius: "50%" }} />
          </div>
          <Ligne w="55%" h={12} />
          <Bloc style={{ width: 64, height: 30, borderRadius: 8, marginTop: 6 }} />
          <Ligne w="70%" h={10} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/** Squelette complet d'un fil de swipe (catégorie d'opportunités). */
export function ChargementFil({ titre }: { titre: string }) {
  return (
    <>
      <BarreEntete titre={titre} />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full" aria-busy="true">
        <div className="mb-6">
          <Ligne w={150} h={24} />
          <Ligne w="75%" h={13} style={{ marginTop: 8 }} />
        </div>

        <Bloc style={{ height: 44, borderRadius: 12, marginBottom: 14 }} />

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Ligne w={110} h={12} />
        </div>

        <CarteSwipeSquelette />
      </main>
    </>
  );
}

/** Carte de fil de swipe : couverture 184px, titre, corps, boutons d'action. */
export function CarteSwipeSquelette() {
  return (
    <div
      style={{
        position: "relative",
        height: 520,
        borderRadius: 20,
        background: "var(--bg-card)",
        border: "1px solid var(--border-strong)",
        overflow: "hidden",
      }}
      aria-hidden
    >
      <Bloc style={{ height: 184, borderRadius: 0 }} />
      <div style={{ padding: "16px 24px 0" }}>
        <Ligne w="40%" h={12} />
        <Bloc style={{ width: "88%", height: 20, borderRadius: 6, marginTop: 8 }} />
        <Bloc style={{ width: "60%", height: 20, borderRadius: 6, marginTop: 6 }} />
      </div>
      <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Ligne w="100%" h={12} />
        <Ligne w="96%" h={12} />
        <Ligne w="70%" h={12} />
        <Ligne w="48%" h={12} />
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Bloc style={{ width: 56, height: 56, borderRadius: "50%" }} />
        <Bloc style={{ width: 64, height: 64, borderRadius: "50%" }} />
        <Bloc style={{ width: 56, height: 56, borderRadius: "50%" }} />
      </div>
    </div>
  );
}

/** Squelette du panneau « Activité » du tableau de bord (2 cartes de stats). */
export function SqueletteActivite() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-busy="true">
      {[0, 1].map((c) => (
        <Carte key={c} hauteur={240}>
          <Ligne w={140} h={16} style={{ marginBottom: 16 }} />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: "14px 12px", borderRadius: 14, background: "var(--bg)", border: "1px solid var(--border)" }}>
                <Bloc style={{ width: 20, height: 20, borderRadius: 6, marginBottom: 10 }} />
                <Ligne w="70%" h={11} />
              </div>
            ))}
          </div>
        </Carte>
      ))}
    </div>
  );
}

/** Squelette des suggestions de l'onglet « Découvrir » (4 rangées). */
export function SqueletteDecouvrir() {
  return (
    <div aria-busy="true">
      <Ligne w={150} h={11} style={{ marginBottom: 8 }} />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Rangée key={i} />
        ))}
      </div>
    </div>
  );
}

/** Squelette d'un onglet de conversation (messagerie). */
export function FilMessagesSquelette() {
  return (
    <div
      style={{
        height: "calc(100vh - 150px)",
        minHeight: 460,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        display: "flex",
      }}
      aria-hidden
    >
      <div className="hidden lg:flex flex-col" style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--border)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 16px" }}>
            <Bloc style={{ width: 40, height: 40, borderRadius: "50%" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Ligne w="70%" h={12} />
              <Ligne w="45%" h={10} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 11 }}>
          <Bloc style={{ width: 38, height: 38, borderRadius: "50%" }} />
          <Ligne w={130} h={15} />
        </div>
        <div className="flex-1" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
          <div style={{ alignSelf: "flex-start", maxWidth: "72%" }}>
            <Bloc style={{ height: 44, borderRadius: 13, width: 220 }} />
          </div>
          <div style={{ alignSelf: "flex-end", maxWidth: "72%" }}>
            <Bloc style={{ height: 32, borderRadius: 13, width: 150 }} />
          </div>
          <div style={{ alignSelf: "flex-start", maxWidth: "72%" }}>
            <Bloc style={{ height: 56, borderRadius: 13, width: 260 }} />
          </div>
          <div style={{ alignSelf: "flex-end", maxWidth: "72%" }}>
            <Bloc style={{ height: 32, borderRadius: 13, width: 180 }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 9, padding: "8px 10px 8px 14px", borderRadius: 14, background: "var(--input-bg)", border: "1px solid var(--input-border)", margin: "0 18px 18px" }}>
          <Bloc style={{ flex: 1, height: 20, borderRadius: 6 }} />
          <Bloc style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
