import { BarreEntete, Bloc, Carte, Ligne } from "@/components/chargement/Squelette";

/** Squelette du coffre-fort : panneau de stats à gauche, liste de documents à droite. */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full" aria-busy="true">
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
          <Ligne w="40%" h={12} />
          <Ligne w="65%" h={11} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-5 pb-8 items-start">
          <Carte>
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Bloc key={i} style={{ height: 76, borderRadius: 14 }} />
              ))}
            </div>
          </Carte>

          <Carte>
            <Ligne w={160} h={13} style={{ marginBottom: 16 }} />
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <Bloc style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <Ligne w="60%" h={12} />
                    <Ligne w="35%" h={10} />
                  </div>
                  <Bloc style={{ width: 30, height: 24, borderRadius: 6, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </Carte>
        </div>
      </main>
    </>
  );
}
