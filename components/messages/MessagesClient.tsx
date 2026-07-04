"use client";

import { useMemo, useRef, useState, useEffect } from "react";

type Message = {
  id: string;
  auteur: string; // candidat | organisme | systeme
  nomAuteur: string;
  contenu: string;
  createdAt: string;
};

function heure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function MessagesClient({ initial }: { initial: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  // Conversations groupées par interlocuteur
  const conversations = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const m of messages) {
      if (!map.has(m.nomAuteur)) map.set(m.nomAuteur, []);
      map.get(m.nomAuteur)!.push(m);
    }
    return [...map.entries()].map(([nom, msgs]) => ({ nom, msgs, dernier: msgs[msgs.length - 1] }));
  }, [messages]);

  const [actif, setActif] = useState<string>(conversations[0]?.nom ?? "Matchwork");
  const conversationActive = conversations.find((c) => c.nom === actif) ?? conversations[0];

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, actif]);

  async function envoyer() {
    if (!saisie.trim() || envoi || !conversationActive) return;
    const contenu = saisie.trim();
    setSaisie("");
    setEnvoi(true);
    // Optimiste
    const temp: Message = { id: `tmp-${messages.length}`, auteur: "candidat", nomAuteur: conversationActive.nom, contenu, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, temp]);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenu, nomAuteur: conversationActive.nom }),
      });
      if (res.ok) {
        const vrai = await res.json() as Message;
        setMessages((prev) => prev.map((m) => (m.id === temp.id ? vrai : m)));
      }
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[300px_1fr]"
      style={{ height: "calc(100vh - 150px)", minHeight: 460, borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      {/* Liste des conversations */}
      <div className="hidden lg:flex flex-col" style={{ borderRight: "1px solid var(--border)" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => {
            const sel = c.nom === actif;
            return (
              <button
                key={c.nom}
                onClick={() => setActif(c.nom)}
                className="w-full text-left"
                style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", background: sel ? "rgba(124,58,237,0.1)" : "transparent", borderLeft: `3px solid ${sel ? "#7c3aed" : "transparent"}`, cursor: "pointer" }}
              >
                <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                  {c.nom.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nom}</p>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.dernier.contenu}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fil de discussion */}
      <div className="flex flex-col" style={{ minWidth: 0 }}>
        {/* En-tête conversation */}
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 11, background: "var(--header-bg)" }}>
          <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
            {(conversationActive?.nom ?? "M").charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{conversationActive?.nom}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>Organisme · Matchwork</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {conversationActive?.msgs.map((m) => {
            const moi = m.auteur === "candidat";
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: moi ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "78%" }}>
                  <div
                    style={{
                      padding: "10px 14px", borderRadius: moi ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      fontSize: "0.86rem", lineHeight: 1.55, whiteSpace: "pre-wrap",
                      ...(moi
                        ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff" }
                        : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }),
                    }}
                  >
                    {m.contenu}
                  </div>
                  <p style={{ fontSize: "0.66rem", color: "var(--text-3)", marginTop: 4, textAlign: moi ? "right" : "left" }}>
                    {moi ? "Vous" : m.nomAuteur} · {heure(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={finRef} />
        </div>

        {/* Composeur */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--header-bg)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, padding: "8px 10px 8px 14px", borderRadius: 14, background: "var(--input-bg)", border: "1px solid var(--input-border)" }}>
            <textarea
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void envoyer(); } }}
              rows={1}
              placeholder="Écrivez votre message…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.5, resize: "none", maxHeight: 120 }}
            />
            <button
              onClick={() => void envoyer()}
              disabled={!saisie.trim() || envoi}
              style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, border: "none", background: saisie.trim() ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "var(--bg-card)", cursor: saisie.trim() && !envoi ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={saisie.trim() ? "#fff" : "var(--text-3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
