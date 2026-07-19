"use client";

import { createContext, useContext, useRef, useState } from "react";

interface GenerationContextType {
  enGeneration: boolean;
  demarrer: () => void;
  terminer: () => void;
}

const GenerationContext = createContext<GenerationContextType>({
  enGeneration: false,
  demarrer: () => {},
  terminer: () => {},
});

/**
 * Compteur partagé (pas un simple booléen) : plusieurs générations peuvent
 * se chevaucher (ex. plusieurs offres swipées coup sur coup). Le logo ne
 * doit s'arrêter d'animer que quand la dernière se termine.
 */
export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [enGeneration, setEnGeneration] = useState(false);
  const compteur = useRef(0);

  const demarrer = () => {
    compteur.current += 1;
    setEnGeneration(true);
  };

  const terminer = () => {
    compteur.current = Math.max(0, compteur.current - 1);
    if (compteur.current === 0) setEnGeneration(false);
  };

  return (
    <GenerationContext.Provider value={{ enGeneration, demarrer, terminer }}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  return useContext(GenerationContext);
}
