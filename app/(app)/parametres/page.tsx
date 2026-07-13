"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { Carte } from "@/components/ui/carte";
import { useTheme } from "@/lib/theme/ThemeContext";
import { BoutonNotifications } from "@/components/notifications/BoutonNotifications";

export default function Parametres() {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [exportLoading, setExportLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const exporterDonnees = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/profil");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "matchwork-mes-donnees.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setExportLoading(false);
  };

  return (
    <>
      <EnteteApp titre="Paramètres" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* Apparence */}
          <Carte>
            <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Apparence</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Thème</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                  {theme === "dark" ? "Mode sombre actif" : "Mode clair actif"}
                </p>
              </div>
              <button
                onClick={toggle}
                style={{
                  width: 52, height: 28, borderRadius: 14, cursor: "pointer",
                  background: theme === "dark" ? "#7c3aed" : "var(--border)",
                  border: "none", position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3,
                  left: theme === "dark" ? 27 : 3,
                  transition: "left 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {theme === "dark" ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                  )}
                </div>
              </button>
            </div>
          </Carte>

          {/* Notifications */}
          <Carte>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Notifications</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>
              Recevez des alertes pour les deadlines proches et les nouvelles opportunités.
            </p>
            <BoutonNotifications />
          </Carte>

          {/* Confidentialité */}
          <Carte>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Confidentialité</h2>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
              Vos données personnelles et vos documents sont stockés de façon chiffrée et ne sont
              accessibles qu&apos;à vous. Aucune donnée n&apos;est partagée avec des tiers sans votre accord.
            </p>
          </Carte>

          {/* Mes données */}
          <Carte>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Mes données</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>
              Téléchargez toutes vos données personnelles (profil, formations, expériences) au format JSON.
            </p>
            <button
              onClick={exporterDonnees}
              disabled={exportLoading}
              style={{
                padding: "9px 18px", borderRadius: 11,
                background: "rgba(124,58,237,0.1)", color: "#a78bfa",
                border: "1px solid rgba(124,58,237,0.25)",
                fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              {exportLoading ? "Export en cours…" : "Exporter mes données"}
            </button>
          </Carte>

          {/* Compte */}
          <Carte>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Compte</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  padding: "9px 18px", borderRadius: 11, width: "fit-content",
                  background: "var(--bg-card)", color: "var(--text)",
                  border: "1px solid var(--border)",
                  fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Se déconnecter
              </button>

              {!showConfirmDelete ? (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  style={{
                    padding: "9px 18px", borderRadius: 11, width: "fit-content",
                    background: "rgba(239,68,68,0.08)", color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.2)",
                    fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                  }}
                >
                  Supprimer mon compte
                </button>
              ) : (
                <div style={{ padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p className="text-xs mb-3" style={{ color: "#ef4444", fontWeight: 600 }}>
                    Cette action est irréversible. Toutes vos données seront supprimées.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      style={{
                        padding: "7px 14px", borderRadius: 9,
                        background: "var(--bg-card)", color: "var(--text-2)",
                        border: "1px solid var(--border)",
                        fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={async () => {
                        await fetch("/api/profil", { method: "DELETE" });
                        signOut({ callbackUrl: "/" });
                      }}
                      style={{
                        padding: "7px 14px", borderRadius: 9,
                        background: "#ef4444", color: "#fff",
                        border: "none",
                        fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Confirmer la suppression
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Carte>

        </div>
      </main>
    </>
  );
}
