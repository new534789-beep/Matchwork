import { BarreEntete, Bloc, Carte, GrilleStatsSquelette, Ligne } from "@/components/chargement/Squelette";

/** Squelette du tableau de bord : grille de stats + onglets + cartes de contenu. */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main
        style={{ flex: 1, padding: "24px clamp(16px,3vw,30px) 56px", maxWidth: 1200, margin: "0 auto", width: "100%" }}
        aria-busy="true"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <Ligne w={260} h={30} />
            <Ligne w={340} h={13} style={{ marginTop: 8 }} />
          </div>
          <Bloc style={{ width: 190, height: 44, borderRadius: 12 }} />
        </div>

        <GrilleStatsSquelette nb={5} />

        <div style={{ display: "flex", gap: 6, padding: 6, borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Bloc key={i} style={{ height: 36, width: 96, borderRadius: 10, flexShrink: 0 }} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Carte hauteur={300}>
              <Ligne w={110} h={16} style={{ marginBottom: 16 }} />
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 12, padding: "11px 13px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <Ligne w="65%" h={13} />
                    <Ligne w="40%" h={11} style={{ marginTop: 6 }} />
                  </div>
                ))}
              </div>
            </Carte>
          </div>
          <Carte hauteur={300}>
            <Ligne w={150} h={12} style={{ marginBottom: 12 }} />
            <Ligne w="90%" h={17} style={{ marginBottom: 8 }} />
            <Ligne w="55%" h={12} />
            <div style={{ flex: 1 }} />
            <Bloc style={{ height: 44, borderRadius: 12 }} />
          </Carte>
        </div>
      </main>
    </>
  );
}
