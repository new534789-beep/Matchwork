"use client";

import { useState } from "react";
import Link from "next/link";

type Stat = { key: string; label: string; valeur: string; sous: string; href: string };
type Alerte = { cle: string; couleur: "rouge" | "ambre" | "violet"; titre: string; sous: string; href: string; tag?: string };
type Retenue = { id: string; intitule: string; organisme: string; statut: "a_preparer" | "genere" | "soumis" | "utilise"; jours: number | null; confTotal: number; confCouvertes: number; confPct: number; href: string };
type Echeance = { intitule: string; organisme: string; jours: number; href: string; statut: string } | null;
type Sugg = { id: string; intitule: string; organisme: string; jours: number | null };
type Quota = { estGratuit: boolean; restant: number | null; max: number; utilisees: number };

type Props = {
  stats: Stat[];
  alertes: Alerte[];
  retenues: Retenue[];
  prochaineEcheance: Echeance;
  suggestions: Sugg[];
  profilPct: number;
  quota: Quota;
};

const carte: React.CSSProperties = { borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border)", padding: 20 };
const titreSection: React.CSSProperties = { fontSize: "1rem", fontWeight: 700, color: "var(--text)" };

const COULEURS = {
  rouge: { bg: "rgba(124,58,237,0.16)", border: "rgba(124,58,237,0.42)", txt: "#a78bfa" },
  ambre: { bg: "rgba(124,58,237,0.09)", border: "rgba(124,58,237,0.26)", txt: "#a78bfa" },
  violet: { bg: "rgba(124,58,237,0.05)", border: "rgba(124,58,237,0.18)", txt: "#a78bfa" },
};

// Icônes (violet) des cartes stats, par clé
const STAT_ICONS: Record<string, React.ReactNode> = {
  dossiers: (<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
  deadline: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  quota: (<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>),
  profil: (<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
};

function statutMeta(statut: Retenue["statut"]) {
  if (statut === "utilise") return { label: "Utilisé", color: "#fff", bg: "#7c3aed", border: "#7c3aed" };
  if (statut === "soumis") return { label: "Soumis", color: "#fff", bg: "#7c3aed", border: "#7c3aed" };
  if (statut === "genere") return { label: "Généré", color: "#a78bfa", bg: "rgba(124,58,237,0.14)", border: "rgba(124,58,237,0.32)" };
  return { label: "À préparer", color: "var(--text-2)", bg: "var(--bg-card)", border: "var(--border)" };
}

function CarteStat({ stat }: { stat: Stat }) {
  return (
    <Link href={stat.href} style={{ textDecoration: "none" }}>
      <div style={{ borderRadius: 18, padding: "16px 18px", height: "100%", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
          <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 11, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{STAT_ICONS[stat.key]}</svg>
          </span>
          <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
          </span>
        </div>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" }}>{stat.label}</span>
        <p style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text)" }}>{stat.valeur}</p>
        <p style={{ fontSize: "0.74rem", marginTop: 6, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stat.sous}</p>
      </div>
    </Link>
  );
}

function JaugeProfil({ pct }: { pct: number }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const off = C * (1 - pct / 100);
  return (
    <div style={{ position: "relative", width: 150, height: 150 }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={R} fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle cx="75" cy="75" r={R} fill="none" stroke="#7c3aed" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 75 75)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: 3 }}>complété</span>
      </div>
    </div>
  );
}

const TABS = [
  { id: "afaire", label: "À faire", icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
  { id: "dossiers", label: "Mes dossiers", icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></> },
  { id: "decouvrir", label: "Découvrir", icon: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></> },
  { id: "profil", label: "Profil", icon: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
];

export function TableauBordClient({ stats, alertes, retenues, prochaineEcheance, suggestions, profilPct, quota }: Props) {
  const [tab, setTab] = useState("afaire");
  const { estGratuit, restant, max, utilisees } = quota;

  return (
    <>
      {/* 4 cartes stats — neutres, icône violette */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {stats.map((s) => <CarteStat key={s.key} stat={s} />)}
      </div>

      {/* Menu d'onglets horizontal */}
      <div
        style={{ display: "flex", gap: 6, padding: 6, borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 20, overflowX: "auto" }}
      >
        {TABS.map((t) => {
          const actif = tab === t.id;
          const compteur = t.id === "afaire" ? alertes.length : t.id === "dossiers" ? retenues.length : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                fontSize: "0.86rem", fontWeight: 600,
                background: actif ? "#7c3aed" : "transparent",
                color: actif ? "#fff" : "var(--text-2)",
                boxShadow: actif ? "0 6px 18px rgba(124,58,237,0.38)" : undefined,
                transition: "all 0.15s ease",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={actif ? "#fff" : "#7c3aed"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
              {t.label}
              {compteur > 0 && (
                <span style={{ fontSize: "0.7rem", fontWeight: 700, minWidth: 18, textAlign: "center", padding: "1px 6px", borderRadius: 999, background: actif ? "rgba(255,255,255,0.25)" : "var(--bg)", color: actif ? "#fff" : "var(--text-3)", border: actif ? "1px solid rgba(255,255,255,0.35)" : "1px solid var(--border)" }}>{compteur}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Contenu de l'onglet ── */}

      {/* À FAIRE */}
      {tab === "afaire" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2" style={carte}>
            <p style={{ ...titreSection, marginBottom: 16 }}>À faire</p>
            {alertes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: "32px 12px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p style={{ fontWeight: 700, color: "#a78bfa", fontSize: "0.9rem" }}>Tout est à jour</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginTop: 3 }}>Aucune action urgente pour le moment.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {alertes.map((a) => {
                  const c = COULEURS[a.couleur];
                  return (
                    <Link key={a.cle} href={a.href} style={{ textDecoration: "none" }}>
                      <div style={{ borderRadius: 12, padding: "11px 13px", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titre}</p>
                          <p style={{ fontSize: "0.72rem", color: "var(--text-2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.sous}</p>
                        </div>
                        {a.tag && <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 9px", borderRadius: 7, whiteSpace: "nowrap", color: c.txt, background: c.bg, border: `1px solid ${c.border}` }}>{a.tag}</span>}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...carte, background: "linear-gradient(150deg,rgba(124,58,237,0.14),rgba(91,33,182,0.06))", border: "1px solid rgba(124,58,237,0.25)", display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12 }}>Prochaine échéance</p>
            {prochaineEcheance ? (
              <>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3, marginBottom: 6 }}>{prochaineEcheance.intitule}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-2)", marginBottom: 14 }}>{prochaineEcheance.organisme}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#a78bfa" }}>{prochaineEcheance.jours === 0 ? "Échéance aujourd'hui" : `Dans ${prochaineEcheance.jours} jour${prochaineEcheance.jours > 1 ? "s" : ""}`}</span>
                </div>
                <Link href={prochaineEcheance.href} style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                  {prochaineEcheance.statut === "a_preparer" ? "Préparer le dossier" : "Continuer"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontSize: "0.88rem", color: "var(--text-2)", lineHeight: 1.6, marginBottom: 16 }}>Aucune échéance pour l&apos;instant. Découvrez des bourses qui vous correspondent.</p>
                <Link href="/opportunites" style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                  Découvrir des bourses
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* MES DOSSIERS */}
      {tab === "dossiers" && (
        <div style={carte}>
          <div className="flex items-center justify-between mb-4">
            <p style={titreSection}>Mes dossiers en cours</p>
            <Link href="/candidatures" style={{ fontSize: "0.76rem", color: "#a78bfa", textDecoration: "none" }}>Tout voir</Link>
          </div>
          {retenues.length === 0 ? (
            <div className="text-center" style={{ padding: "28px 12px" }}>
              <p style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.9rem", marginBottom: 4 }}>Aucun dossier en cours</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: 16 }}>Swipez des bourses pour commencer.</p>
              <Link href="/opportunites" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontWeight: 600, fontSize: "0.82rem", textDecoration: "none" }}>Voir les bourses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {retenues.map((r) => {
                const sm = statutMeta(r.statut);
                return (
                  <Link key={r.id} href={r.href} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{r.organisme.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.intitule}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 1 }}>{r.confTotal > 0 ? `Conformité ${r.confPct}% · ` : ""}{r.jours === null ? "Sans échéance" : r.jours < 0 ? "Échéance dépassée" : r.jours === 0 ? "Aujourd'hui" : `J-${r.jours}`}</p>
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`, flexShrink: 0 }}>{sm.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DÉCOUVRIR */}
      {tab === "decouvrir" && (
        <div style={carte}>
          <p style={{ ...titreSection, marginBottom: 14 }}>Découvrir</p>
          <Link href="/opportunites" style={{ textDecoration: "none" }}>
            <div className="mb-4" style={{ borderRadius: 12, padding: "16px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>Parcourir les bourses</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 1 }}>Swipez les opportunités qui vous correspondent</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </Link>
          {suggestions.length > 0 ? (
            <>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Suggestions pour vous</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <Link key={s.id} href={`/opportunites/${s.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 11, background: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{s.organisme.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.intitule}</p>
                        <p style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{s.organisme}</p>
                      </div>
                      {s.jours !== null && s.jours >= 0 && <span style={{ fontSize: "0.68rem", color: s.jours <= 7 ? "#a78bfa" : "var(--text-3)", whiteSpace: "nowrap" }}>J-{s.jours}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Aucune nouvelle suggestion pour le moment.</p>
          )}
        </div>
      )}

      {/* PROFIL */}
      {tab === "profil" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{ ...carte, display: "flex", flexDirection: "column" }}>
            <p style={titreSection}>Profil complété</p>
            <div className="flex-1 flex items-center justify-center" style={{ padding: "16px 0" }}>
              <JaugeProfil pct={profilPct} />
            </div>
            <Link href="/profil" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 11, background: "var(--bg)", border: "1px solid var(--border)", color: "#a78bfa", fontWeight: 600, fontSize: "0.82rem", textDecoration: "none" }}>
              {profilPct === 100 ? "Profil complet" : "Compléter mon profil"}
            </Link>
          </div>

          <div style={{ borderRadius: 18, padding: 20, background: "linear-gradient(150deg,#1a0840,#0a0a0a)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", flexDirection: "column", color: "#fff", overflow: "hidden", position: "relative" }}>
            <div aria-hidden style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.35),transparent 70%)", pointerEvents: "none" }} />
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 14, position: "relative" }}>{estGratuit ? "Quota du mois" : "Abonnement"}</p>
            <div style={{ position: "relative", marginBottom: "auto" }}>
              <p style={{ fontSize: "2.8rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>{estGratuit ? restant : "∞"}</p>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginTop: 6 }}>{estGratuit ? `génération${(restant ?? 0) > 1 ? "s" : ""} restante${(restant ?? 0) > 1 ? "s" : ""} sur ${max}` : "Générations illimitées"}</p>
            </div>
            {estGratuit && (
              <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden", margin: "16px 0", position: "relative" }}>
                <div style={{ height: "100%", borderRadius: 6, width: `${Math.min(100, (utilisees / max) * 100)}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
              </div>
            )}
            <Link href="/compte" style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 12, background: estGratuit && restant === 0 ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.08)", border: estGratuit && restant === 0 ? "none" : "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.83rem", fontWeight: 600, textDecoration: "none", marginTop: estGratuit ? 0 : 16 }}>
              {estGratuit && restant === 0 ? "Recharger maintenant" : "Gérer mon abonnement"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
