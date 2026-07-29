"use client";

import { useEffect, useRef, useState } from "react";

type Candidat = {
  userId: string;
  nom: string;
  offres: string[];
  statut: string;
  derniereActivite: string;
  messagesNonLus: number;
};

type Message = { id: string; auteur: string; nomAuteur: string; contenu: string; createdAt: string };

const LABEL_STATUT: Record<string, { label: string; color: string; bg: string }> = {
  obtenu: { label: "Obtenu", color: "#059669", bg: "rgba(5,150,105,0.1)" },
  utilise: { label: "Candidature envoyée", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  genere: { label: "Dossier généré", color: "#a78bfa", bg: "rgba(124,58,237,0.08)" },
  a_preparer: { label: "Dossier en préparation", color: "var(--text-2)", bg: "var(--bg)" },
  interesse: { label: "Intéressé", color: "var(--text-3)", bg: "var(--bg)" },
};

function heure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function CandidatsPanel({ onRetour }: { onRetour: () => void }) {
  const [candidats, setCandidats] = useState<Candidat[] | null>(null);
  const [actif, setActif] = useState<Candidat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chargementFil, setChargementFil] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/organisme/candidats")
      .then((r) => r.json())
      .then((data) => setCandidats(data.candidats ?? []));
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ouvrirConversation(c: Candidat) {
    setActif(c);
    setChargementFil(true);
    try {
      const res = await fetch(`/api/organisme/messages?candidatId=${c.userId}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      // Optimiste : marque comme lu localement, le backend le fait déjà côté serveur.
      setCandidats((prev) => prev?.map((x) => (x.userId === c.userId ? { ...x, messagesNonLus: 0 } : x)) ?? null);
    } finally {
      setChargementFil(false);
    }
  }

  async function envoyer() {
    if (!saisie.trim() || envoi || !actif) return;
    const contenu = saisie.trim();
    setSaisie("");
    setEnvoi(true);
    const temp: Message = { id: `tmp-${Date.now()}`, auteur: "organisme", nomAuteur: "", contenu, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, temp]);
    try {
      const res = await fetch("/api/organisme/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatId: actif.userId, contenu }),
      });
      if (res.ok) {
        const vrai = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === temp.id ? vrai : m)));
      }
    } finally {
      setEnvoi(false);
    }
  }

  if (candidats === null) {
    return <p style={{ color: "var(--text-2)", padding: 20 }}>Chargement...</p>;
  }

  // Vue conversation
  if (actif) {
    return (
      <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-card)", height: "calc(100vh - 220px)", minHeight: 460, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 11 }}>
          <button onClick={() => setActif(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", display: "flex" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
            {actif.nom.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{actif.nom}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{actif.offres.join(" · ")}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {chargementFil ? (
            <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>Chargement...</p>
          ) : messages.length === 0 ? (
            <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>Aucun message pour l&apos;instant — envoyez le premier.</p>
          ) : (
            messages.map((m) => {
              const moi = m.auteur === "organisme";
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: moi ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "78%" }}>
                    <div style={{
                      padding: "10px 14px", borderRadius: moi ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      fontSize: "0.86rem", lineHeight: 1.55, whiteSpace: "pre-wrap",
                      ...(moi ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff" } : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }),
                    }}>
                      {m.contenu}
                    </div>
                    <p style={{ fontSize: "0.66rem", color: "var(--text-3)", marginTop: 4, textAlign: moi ? "right" : "left" }}>
                      {moi ? "Vous" : actif.nom} · {heure(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={finRef} />
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, padding: "8px 10px 8px 14px", borderRadius: 14, background: "var(--input-bg)", border: "1px solid var(--input-border)" }}>
            <textarea
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void envoyer(); } }}
              rows={1}
              placeholder={`Écrire à ${actif.nom}…`}
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
    );
  }

  // Vue liste
  return (
    <div>
      <button onClick={onRetour} style={{ color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>
        &larr; Retour au tableau de bord
      </button>
      {candidats.length === 0 ? (
        <div style={{ borderRadius: 16, padding: 24, textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>Aucun candidat n&apos;a encore interagi avec vos offres.</p>
        </div>
      ) : (
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          {candidats.map((c, i) => {
            const s = LABEL_STATUT[c.statut] ?? LABEL_STATUT.interesse;
            return (
              <button
                key={c.userId}
                onClick={() => void ouvrirConversation(c)}
                className="w-full text-left"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid var(--border)", background: "transparent", cursor: "pointer" }}
              >
                <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                  {c.nom.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nom}</p>
                    {c.messagesNonLus > 0 && (
                      <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#7c3aed", color: "#fff", flexShrink: 0 }}>{c.messagesNonLus}</span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{c.offres.join(" · ")}</p>
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
