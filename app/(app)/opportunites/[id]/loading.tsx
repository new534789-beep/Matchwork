import { BarreEntete, Bloc, Ligne } from "@/components/chargement/Squelette";

/** Squelette de la page détail d'une opportunité. */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full" aria-busy="true">
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ borderRadius: 16, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ padding: "24px 20px 20px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <Bloc style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Ligne w={120} h={12} />
                  <Bloc style={{ width: "90%", height: 18, borderRadius: 6, marginTop: 8 }} />
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Bloc style={{ width: 110, height: 26, borderRadius: 8 }} />
                <Bloc style={{ width: 140, height: 26, borderRadius: 8 }} />
                <Bloc style={{ width: 130, height: 26, borderRadius: 8 }} />
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <Ligne w={100} h={11} style={{ marginBottom: 12 }} />
              <div className="flex flex-col gap-2.5">
                <Ligne w="100%" h={12} />
                <Ligne w="97%" h={12} />
                <Ligne w="90%" h={12} />
                <Ligne w="60%" h={12} />
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)", padding: 20 }}>
            <Ligne w={130} h={11} style={{ marginBottom: 12 }} />
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Bloc style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0 }} />
                  <Ligne w="70%" h={12} />
                </div>
              ))}
            </div>
          </div>

          <Bloc style={{ height: 48, borderRadius: 12, marginTop: 16 }} />
        </div>
      </main>
    </>
  );
}
