"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface Props {
  sessionOnboarding: unknown[];
}

const SECTIONS = [
  {
    id: "identite",
    label: "Identité",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="8" cy="12" r="2" />
        <path d="M14 10h4M14 14h3" />
      </svg>
    ),
  },
  {
    id: "presentation",
    label: "Présentation",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "formations",
    label: "Formations",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: "experiences",
    label: "Expériences",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    id: "competences",
    label: "Compétences",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: "langues",
    label: "Langues",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    id: "objectifs",
    label: "Objectifs",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "ton",
    label: "Style de lettre",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
  },
] as const;

const MESSAGE_INITIAL: Message = {
  role: "assistant",
  content: "Bonjour ! Je suis Amara, votre assistante Matchwork.\n\nJe vais construire votre profil avec vous pour vous aider à trouver les bourses qui vous correspondent et générer des dossiers de candidature personnalisés.\n\nCommençons par votre identité officielle : quel est votre prénom et NOM COMPLET, tels qu'ils apparaissent sur votre pièce d'identité ou passeport ?",
};

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function InterfaceOnboarding({ sessionOnboarding }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (sessionOnboarding && sessionOnboarding.length > 0) return sessionOnboarding as Message[];
    return [MESSAGE_INITIAL];
  });
  const [saisie, setSaisie] = useState("");
  const [chargement, setChargement] = useState(false);
  const [historique, setHistorique] = useState<unknown[]>([]);
  const [sectionActuelle, setSectionActuelle] = useState<string>("identite");
  const [sectionsVues, setSectionsVues] = useState<Set<string>>(new Set(["identite"]));
  const [termine, setTermine] = useState(false);
  const [sidebarOuverte, setSidebarOuverte] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function ajusterTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  async function envoyer(e?: React.FormEvent) {
    e?.preventDefault();
    if (!saisie.trim() || chargement) return;

    const texteUtilisateur = saisie.trim();
    setSaisie("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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
        const msgErreur = data.erreur
          ? `Erreur : ${data.erreur}`
          : "Désolé, une erreur est survenue. Veuillez réessayer.";
        setMessages((prev) => [...prev, { role: "assistant", content: msgErreur }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setHistorique(data.historiqueMAJ ?? []);

      if (data.section_en_cours) {
        setSectionActuelle(data.section_en_cours);
        setSectionsVues((prev) => new Set([...prev, data.section_en_cours]));
      }

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

      if (data.onboardingTermine) setTermine(true);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Une erreur est survenue. Veuillez réessayer." }]);
    } finally {
      setChargement(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void envoyer();
    }
  }

  const sectionIndex = SECTIONS.findIndex((s) => s.id === sectionActuelle);
  const progression = Math.round((sectionsVues.size / SECTIONS.length) * 100);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>

      {/* Overlay mobile */}
      {sidebarOuverte && (
        <div
          onClick={() => setSidebarOuverte(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
        />
      )}

      {/* ── Sidebar gauche ── */}
      <aside style={{
        width: 260,
        flexShrink: 0,
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="Matchwork" width={40} height={40} priority />
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)", letterSpacing: "-0.025em" }}>Matchwork</span>
        </div>

        {/* Titre + progression */}
        <div style={{ padding: "16px 20px 10px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>
            Création de profil
          </p>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-2)" }}>Progression</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a78bfa" }}>{progression}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4, transition: "width 0.5s ease",
                width: `${progression}%`,
                background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
              }} />
            </div>
          </div>

          {/* Sections */}
          <ul style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {SECTIONS.map((s, i) => {
              const vue = sectionsVues.has(s.id) || i < sectionIndex;
              const active = s.id === sectionActuelle;
              const terminee = vue && !active;
              return (
                <li key={s.id} style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: active ? "rgba(124,58,237,0.15)" : "transparent",
                  border: active ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}>
                  <span style={{
                    color: terminee ? "#a78bfa" : active ? "#a78bfa" : "var(--text-3)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}>
                    {terminee ? <IconCheck /> : s.icon}
                  </span>
                  <span style={{
                    fontSize: "0.8rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "#e9d5ff" : terminee ? "var(--text-2)" : "var(--text-3)",
                    flex: 1,
                  }}>
                    {s.label}
                  </span>
                  {active && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bas sidebar */}
        <div style={{ marginTop: "auto", padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}>
            <p style={{ fontSize: "0.72rem", color: "rgba(167,139,250,0.7)", lineHeight: 1.5 }}>
              Amara construit votre profil en toute confidentialité. Vos données ne sont jamais partagées sans votre accord.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Zone principale ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--header-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          {/* Bouton hamburger mobile */}
          <button
            onClick={() => setSidebarOuverte(v => !v)}
            style={{ padding: "6px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer" }}
            className="md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Avatar Amara */}
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", border: "2px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fff" }}>A</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>Amara</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
              Assistante Matchwork · {SECTIONS.find(s => s.id === sectionActuelle)?.label ?? "Profil"}
            </p>
          </div>

          <span style={{ fontSize: "0.72rem", color: "#a78bfa", fontWeight: 700 }}>{progression}%</span>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Se déconnecter"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 12, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>

                {msg.role === "assistant" && (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", border: "2px solid rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fff" }}>A</span>
                  </div>
                )}

                <div style={{
                  maxWidth: "75%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  fontSize: "0.875rem",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  ...(msg.role === "user"
                    ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 2px 16px rgba(124,58,237,0.25)" }
                    : { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }),
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {chargement && (
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fff" }}>A</span>
                </div>
                <div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 150, 300].map((d) => (
                    <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(167,139,250,0.6)", display: "inline-block", animation: "bounce 1s infinite", animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Profil terminé */}
            {termine && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <div style={{ padding: "20px 24px", borderRadius: 18, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", textAlign: "center", maxWidth: 360 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#86efac", marginBottom: 4 }}>Profil complété !</p>
                  <p style={{ fontSize: "0.82rem", color: "rgba(134,239,172,0.65)", marginBottom: 16 }}>
                    Déposez maintenant vos pièces dans le coffre-fort pour finaliser votre dossier.
                  </p>
                  <button
                    onClick={() => router.push("/coffre-fort")}
                    style={{ padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", border: "none" }}
                  >
                    Accéder au coffre-fort
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", marginLeft: 6, verticalAlign: "middle" }}>
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div ref={finRef} />
          </div>
        </div>

        {/* Zone de saisie */}
        {!termine && (
          <div style={{
            padding: "12px 20px 16px",
            background: "var(--header-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border)",
          }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <div style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 16,
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                transition: "border-color 0.2s ease",
              }}>
                <textarea
                  ref={textareaRef}
                  value={saisie}
                  onChange={(e) => { setSaisie(e.target.value); ajusterTextarea(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Répondez à Amara… (Entrée pour envoyer)"
                  disabled={chargement}
                  rows={1}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    resize: "none",
                    overflowY: "hidden",
                    padding: "2px 0",
                    minHeight: 24,
                    maxHeight: 160,
                  }}
                  onFocus={(e) => {
                    const parent = e.target.closest("div") as HTMLElement;
                    if (parent) { parent.style.borderColor = "rgba(124,58,237,0.5)"; parent.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }
                  }}
                  onBlur={(e) => {
                    const parent = e.target.closest("div") as HTMLElement;
                    if (parent) { parent.style.borderColor = "var(--input-border)"; parent.style.boxShadow = "none"; }
                  }}
                />
                <button
                  onClick={() => void envoyer()}
                  disabled={!saisie.trim() || chargement}
                  style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: saisie.trim() ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "var(--bg-card)",
                    border: "none",
                    cursor: saisie.trim() && !chargement ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={saisie.trim() ? "#fff" : "var(--text-3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p style={{ fontSize: "0.68rem", color: "var(--text-4)", textAlign: "center", marginTop: 8 }}>
                Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
