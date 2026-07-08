"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };

const V = "#7c3aed";
const VL = "#ede9fe";

export function ChatProjet({ dossierId }: { dossierId: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [termine, setTermine] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questionNum, setQuestionNum] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setLoading(true);
    fetch(`/api/dossiers/${dossierId}/chat-projet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Bonjour, je souhaite soumettre un projet.", historique: [] }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.reponse) {
          setMessages([{ role: "assistant", content: data.reponse }]);
          setQuestionNum(1);
        }
      })
      .finally(() => {
        setLoading(false);
        scrollToBottom();
      });
  }, [dossierId, scrollToBottom]);

  async function envoyer() {
    const texte = input.trim();
    if (!texte || loading || termine) return;

    const newMessages: Message[] = [...messages, { role: "user", content: texte }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`/api/dossiers/${dossierId}/chat-projet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texte, historique: newMessages }),
      });
      const data = await res.json();

      if (data.reponse) {
        setMessages([...newMessages, { role: "assistant", content: data.reponse }]);
        setQuestionNum((n) => n + 1);
      }
      if (data.termine) {
        setTermine(true);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Une erreur est survenue. Réessayez." }]);
    } finally {
      setLoading(false);
      scrollToBottom();
      inputRef.current?.focus();
    }
  }

  async function genererDossier() {
    setGenerating(true);
    try {
      const res = await fetch("/api/dossiers/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportuniteId: null, dossierId }),
      });
      const data = await res.json();
      if (data.dossierId) {
        router.push(`/dossiers/${data.dossierId}`);
      }
    } catch {
      setGenerating(false);
    }
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {questionNum > 0 && !termine && (
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--text-3)",
                background: "var(--bg-card)",
                padding: "3px 10px",
                borderRadius: 8,
              }}
            >
              Question {questionNum}/7
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user" ? V : "var(--theme)" === "dark" ? "rgba(124,58,237,0.15)" : VL,
                color: msg.role === "user" ? "#fff" : "var(--text)",
                fontSize: "0.88rem",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "16px 16px 16px 4px",
                background: VL,
                color: "var(--text-3)",
                fontSize: "0.88rem",
              }}
            >
              <span className="animate-pulse">En train de réfléchir...</span>
            </div>
          </div>
        )}

        {termine && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={genererDossier}
              disabled={generating}
              style={{
                background: V,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 28px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: generating ? "wait" : "pointer",
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? "Génération en cours..." : "Générer mon dossier"}
            </button>
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 8 }}>
              L'IA va rédiger vos documents de projet.
            </p>
          </div>
        )}
      </div>

      {!termine && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 8,
            background: "var(--bg)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                envoyer();
              }
            }}
            placeholder="Décrivez votre projet..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text)",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
          <button
            onClick={envoyer}
            disabled={loading || !input.trim()}
            style={{
              background: V,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
