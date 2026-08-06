import { BarreEntete, Bloc, Carte, Ligne } from "@/components/chargement/Squelette";

/**
 * Squelette générique de l'espace connecté : menu latéral et en-tête déjà
 * visibles (rendus par le layout), contenu en blocs gris aux dimensions
 * réelles. Les routes qui ont un squelette spécifique le remplacent.
 */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full" aria-busy="true">
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
    </>
  );
}
