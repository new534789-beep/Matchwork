"use client";

import { useState, useEffect, useRef } from "react";

type Conversation = {
  userId: string;
  email: string;
  nonLus: number;
  totalMessages: number;
  dernierMessage: string;
  dernierAt: string;
};

type Msg = {
  id: string;
  auteur: string;
  nomAuteur: string;
  contenu: string;
  createdAt: string;
};

const V = "#7c3aed";
const VL = "#a78bfa";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export function SupportAdmin({ initial }: { initial: Conversation[] }) {
  const [conversations, setConversations] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [userInfo, setUserInfo] = useState<{ email: string; plan: string; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reponse, setReponse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function chargerConversation(userId: string) {
    setSelected(userId);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/support/${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
      setUserInfo(data.user);
      setConversations((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, nonLus: 0 } : c)),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function envoyer() {
    if (!selected || !reponse.trim() || envoi) return;
    setEnvoi(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected, contenu: reponse.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setReponse("");
      }
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 16, minHeight: 500 }}>
      {/* Liste des conversations */}
      <div style={{ width: 320, flexShrink: 0, overflowY: "auto", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {conversations.length === 0 && (
          <p style={{ padding: 20, fontSize: "0.83rem", color: "var(--text-3)", textAlign: "center" }}>Aucun message</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.userId}
            onClick={() => chargerConversation(c.userId)}
            style={{
              display: "block", width: "100%", textAlign: "left", padding: "14px 16px",
              background: selected === c.userId ? "rgba(124,58,237,0.1)" : "transparent",
              border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{c.email.split("@")[0]}</p>
              {c.nonLus > 0 && (
                <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "rgba(124,58,237,0.2)", color: VL }}>{c.nonLus}</span>
              )}
            </div>
            <p style={{ fontSize: "0.73rem", color: "var(--text-3)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.dernierMessage}</p>
            <p style={{ fontSize: "0.66rem", color: "var(--text-3)", marginTop: 2 }}>{fmt(c.dernierAt)}</p>
          </button>
        ))}
      </div>

      {/* Detail de la conversation */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)", overflow: "hidden" }}>
        {!selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>Selectionnez une conversation</p>
          </div>
        ) : loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>Chargement...</p>
          </div>
        ) : (
          <>
            {/* En-tete */}
            {userInfo && (
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${V},${VL})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.78rem" }}>
                  {userInfo.email[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{userInfo.email}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>Plan {userInfo.plan} — inscrit le {fmt(userInfo.createdAt)}</p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m) => {
                const estAdmin = m.auteur === "systeme" || m.auteur === "organisme";
                return (
                  <div key={m.id} style={{ alignSelf: estAdmin ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                    <div style={{
                      padding: "10px 14px", borderRadius: 14, fontSize: "0.83rem", lineHeight: 1.5,
                      background: estAdmin ? "rgba(124,58,237,0.15)" : "var(--bg-card-hover)",
                      color: "var(--text)",
                      border: `1px solid ${estAdmin ? "rgba(124,58,237,0.3)" : "var(--border)"}`,
                    }}>
                      {m.contenu}
                    </div>
                    <p style={{ fontSize: "0.64rem", color: "var(--text-3)", marginTop: 3, textAlign: estAdmin ? "right" : "left" }}>
                      {m.nomAuteur} — {fmt(m.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Champ de reponse */}
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
              <input
                type="text"
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
                placeholder="Repondre..."
                style={{
                  flex: 1, padding: "9px 13px", borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--input-bg)", color: "var(--text)", fontSize: "0.83rem", outline: "none",
                }}
              />
              <button
                onClick={envoyer}
                disabled={envoi || !reponse.trim()}
                style={{
                  padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${V},#5b21b6)`, color: "#fff",
                  fontWeight: 700, fontSize: "0.82rem", opacity: envoi || !reponse.trim() ? 0.5 : 1,
                }}
              >
                Envoyer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
