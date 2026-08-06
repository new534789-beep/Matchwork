import { BarreEntete, Rangée } from "@/components/chargement/Squelette";

/** Squelette des candidatures : grille de cartes de dossier. */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full" aria-busy="true">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Rangée key={i} />
          ))}
        </div>
      </main>
    </>
  );
}
