"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastType = "succes" | "erreur";
type ToastItem = { id: number; type: ToastType; message: string };
type ModaleSucces = { titre: string; message?: string; boutonLabel?: string } | null;

type ToastContextValue = {
  succes: (message: string) => void;
  erreur: (message: string) => void;
  /** Popup centré + flou, pour les moments marquants (paiement, obtention...) qui méritent l'attention pleine de l'utilisateur. */
  succesModal: (params: { titre: string; message?: string; boutonLabel?: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>");
  return ctx;
}

const DUREE_MS = 3500;
const VERT = "#16a34a";
const ROUGE = "#dc2626";

function RondValidation({ couleur }: { couleur: string }) {
  return (
    <span style={{ width: 22, height: 22, borderRadius: "50%", background: couleur, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {couleur === VERT ? <polyline points="20 6 9 17 4 12" /> : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
      </svg>
    </span>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modale, setModale] = useState<ModaleSucces>(null);

  const ajouter = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), DUREE_MS);
  }, []);

  const value: ToastContextValue = {
    succes: (message: string) => ajouter("succes", message),
    erreur: (message: string) => ajouter("erreur", message),
    succesModal: (params) => setModale(params),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes modal-in { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }`}</style>

      {/* Toasts — bas d'écran, fins, ne bloquent jamais l'interaction en cours (ex. swipe). */}
      <div style={{ position: "fixed", bottom: 20, left: 0, right: 0, zIndex: 500, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              position: "relative", left: "50%", transform: "translateX(-50%)",
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12,
              background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)",
              fontSize: "0.83rem", fontWeight: 600,
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.35)", pointerEvents: "auto", maxWidth: 380,
              animation: "toast-in 0.25s ease",
            }}
          >
            <RondValidation couleur={t.type === "succes" ? VERT : ROUGE} />
            {t.message}
          </div>
        ))}
      </div>

      {/* Popup centré + flou — moments marquants nécessitant l'attention pleine (paiement, obtention...). */}
      {modale && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20,
              padding: "32px 28px", maxWidth: 360, width: "100%", textAlign: "center",
              boxShadow: "0 30px 70px -15px rgba(0,0,0,0.4)", animation: "modal-in 0.2s ease",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: VERT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text)", marginBottom: modale.message ? 8 : 20 }}>{modale.titre}</p>
            {modale.message && <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.5, marginBottom: 22 }}>{modale.message}</p>}
            <button
              onClick={() => setModale(null)}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}
            >
              {modale.boutonLabel ?? "Continuer"}
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
