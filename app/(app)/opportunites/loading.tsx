import { BarreEntete, Bloc, Ligne } from "@/components/chargement/Squelette";

/** Squelette de l'accueil des opportunités : les 7 grandes cartes catégorie. */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full" aria-busy="true">
        <div className="mb-8">
          <Ligne w="55%" h={24} />
          <Ligne w="75%" h={13} style={{ marginTop: 8 }} />
        </div>

        <div className="flex flex-col gap-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                padding: "28px 24px",
                minHeight: 170,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <Bloc style={{ width: 96, height: 18, borderRadius: 7 }} />
              <Bloc style={{ width: "45%", height: 22, borderRadius: 7 }} />
              <Bloc style={{ width: "80%", height: 12, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
