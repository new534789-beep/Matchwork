"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface Props {
  sessionOnboarding: unknown[];
}

const MESSAGE_INITIAL: Message = {
  role: "assistant",
  content:
    '{"message":"Bonjour ! Je suis Amara, votre assistante Matchwork 🌟\\n\\nJe vais construire votre profil avec vous pour vous aider à trouver les bourses qui vous correspondent et générer des dossiers de candidature personnalisés.\\n\\nCommençons par le début : comment vous appelez-vous et quelle est votre situation actuelle (étudiant·e, diplômé·e, en poste…) ?","section_en_cours":"presentation","donnees_extraites":{},"onboarding_termine":false}',
};

export function InterfaceOnboarding({ sessionOnboarding }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => {
    // Reconstruire les messages à partir de la session sauvegardée
    if (sessionOnboarding && sessionOnboarding.length > 0) {
      return sessionOnboarding as Message[];
    }
    // Sinon, message d'accueil initial
    try {
      const parsed = JSON.parse(MESSAGE_INITIAL.content);
      return [{ role: "assistant", content: parsed.message }];
    } catch {
      return [{ role: "assistant", content: MESSAGE_INITIAL.content }];
    }
  });

  const [saisie, setSaisie] = useState("");
  const [chargement, setChargement] = useState(false);
  const [historique, setHistorique] = useState<unknown[]>([]);
  const [termine, setTermine] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!saisie.trim() || chargement) return;

    const texteUtilisateur = saisie.trim();
    setSaisie("");
    setMessages((prev) => [...prev, { role: "user", content: texteUtilisateur }]);
    setChargement(true);

    try {
      const res = await fetch("/api/ia/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texteUtilisateur, historique }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Désolé, une erreur est survenue. Veuillez réessayer.",
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setHistorique(data.historiqueMAJ ?? []);

      // Sauvegarder la session pour reprendre si interrompue
      await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionOnboarding: [
            ...messages,
            { role: "user", content: texteUtilisateur },
            { role: "assistant", content: data.message },
          ],
        }),
      });

      if (data.onboardingTermine) {
        setTermine(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Une erreur est survenue. Veuillez réessayer." },
      ]);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 max-w-lg mx-auto w-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mr-2 mt-0.5">
                A
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {chargement && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mr-2">
              A
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {termine && (
          <div className="flex justify-center mt-4">
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-5 py-4 text-center max-w-xs">
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-semibold text-sm">Profil complété !</p>
              <p className="text-xs text-green-600 mt-1 mb-3">
                Déposez maintenant vos pièces dans le coffre-fort pour finaliser votre dossier.
              </p>
              <Bouton taille="sm" onClick={() => router.push("/coffre-fort")}>
                Accéder au coffre-fort
              </Bouton>
            </div>
          </div>
        )}

        <div ref={finRef} />
      </div>

      {/* Saisie */}
      {!termine && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
          <form onSubmit={envoyer} className="flex gap-2">
            <input
              type="text"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Votre réponse…"
              disabled={chargement}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
            />
            <Bouton
              type="submit"
              disabled={!saisie.trim() || chargement}
              chargement={chargement}
              className="px-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Bouton>
          </form>
        </div>
      )}
    </div>
  );
}
