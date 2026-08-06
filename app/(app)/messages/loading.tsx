import { BarreEntete, FilMessagesSquelette } from "@/components/chargement/Squelette";

/** Squelette de la messagerie : liste de conversations + fil ouvert. */
export default function Chargement() {
  return (
    <>
      <BarreEntete />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full" aria-busy="true">
        <FilMessagesSquelette />
      </main>
    </>
  );
}
