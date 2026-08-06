import { BarreEntete, Bloc, Ligne } from "@/components/chargement/Squelette";

/** Squelette du détail d'un dossier généré. */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full" aria-busy="true">
        <div className="flex flex-col gap-4">
          <div style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)", padding: 20 }}>
            <Ligne w={130} h={12} style={{ marginBottom: 10 }} />
            <Bloc style={{ width: "88%", height: 18, borderRadius: 6, marginBottom: 8 }} />
            <Bloc style={{ width: "55%", height: 12, borderRadius: 6 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Bloc style={{ width: 110, height: 26, borderRadius: 8 }} />
              <Bloc style={{ width: 90, height: 26, borderRadius: 8 }} />
            </div>
          </div>

          <div style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)", padding: 20 }}>
            <Ligne w={150} h={12} style={{ marginBottom: 14 }} />
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Bloc style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <Ligne w="75%" h={12} />
                  </div>
                  <Bloc style={{ width: 44, height: 22, borderRadius: 6, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)", padding: 20 }}>
            <Ligne w={110} h={12} style={{ marginBottom: 12 }} />
            <Bloc style={{ width: "100%", height: 96, borderRadius: 12 }} />
          </div>

          <Bloc style={{ height: 48, borderRadius: 12 }} />
        </div>
      </main>
    </>
  );
}
