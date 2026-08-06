"use client";

/**
 * Popup affiché pendant le court instant de chargement d'une page après un
 * clic dans le menu. Carte blanche centrée avec le logo Matchwork réel
 * (logo-silhouette.png — logo-glossy.png détouré, halo retiré — utilisé
 * comme masque CSS, pas une forme redessinée) qui se remplit d'un liquide
 * violet en boucle, et le mot "Chargement" en dessous.
 *
 * Le flou du contenu en arrière-plan n'est PAS fait ici via backdrop-filter
 * (support inégal sur Android/WebView, notamment sur position:fixed) — c'est
 * l'appelant (AppShell) qui applique un filter:blur() directement sur le
 * contenu de la page, une propriété beaucoup plus universellement fiable.
 */
export function ChargementNavigation({ actif }: { actif: boolean }) {
  if (!actif) return null;

  const masque = {
    WebkitMaskImage: "url(/logo-silhouette.png)",
    maskImage: "url(/logo-silhouette.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as const;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(10,6,20,0.4)",
        animation: "mw-nav-overlay-in 0.15s ease",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "32px 40px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          boxShadow: "0 30px 70px -15px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ position: "relative", width: 72, height: 72 }}>
          {/* Silhouette du logo, faiblement visible même avant le remplissage */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(124,58,237,0.18)", ...masque }} />
          {/* Zone de remplissage, découpée à la silhouette exacte du logo */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...masque }}>
            <div
              className="chargement-liquide"
              style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "100%", background: "linear-gradient(180deg,#a78bfa,#7c3aed)" }}
            />
          </div>
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Chargement</span>
      </div>
      <style jsx>{`
        @keyframes mw-nav-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .chargement-liquide {
          transform-origin: bottom;
          animation: mw-nav-remplissage 1.3s ease-in-out infinite;
        }
        @keyframes mw-nav-remplissage {
          0% { transform: scaleY(0); }
          50% { transform: scaleY(1); }
          100% { transform: scaleY(0); }
        }
      `}</style>
    </div>
  );
}
