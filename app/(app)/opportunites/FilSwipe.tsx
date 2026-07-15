"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CouvertureOffre } from "@/components/opportunites/CouvertureOffre";

type PieceExigee = { nom: string; obligatoire: boolean };

type Opportunite = {
  id: string;
  type: string;
  organisme: string;
  intitule: string;
  description: string;
  langueDetectee: string | null;
  exigenceLangue: string | null;
  dateLimite: string | null;
  conditions: string | null;
  piecesExigees: PieceExigee[];
  source: string;
  score?: number | null;
};

const SWIPE_THRESHOLD = 110;
const LANGUE_LABELS: Record<string, string> = {
  en: "EN",
  de: "DE",
  es: "ES",
  pt: "PT",
  ar: "AR",
  zh: "ZH",
  ja: "JA",
  ko: "KO",
  nl: "NL",
  it: "IT",
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function joursRestants(iso: string | null) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  const jours = Math.ceil(diff / 86400000);
  if (jours < 0) return null;
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "1 jour";
  return `${jours} jours`;
}

function IconGlobe({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconSpeech({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCalendar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Passer : simple trait — neutre, sans connotation d'erreur/rejet.
function IconPasser({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// Candidater : avion en papier — sémantique "envoyer ma candidature", plus
// professionnelle qu'un cœur pour une plateforme de bourses/emploi.
function IconCandidater({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M22 2 11 13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IconTranslate({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l6 6" />
      <path d="M4 14l6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="M22 22l-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type Toast = { id: string; intitule: string; statut: "loading" | "ok" | "erreur"; dossierId?: string };

type GateSupplementaire = { lien: string; titre: string; sousTitre: string };

export function FilSwipe({
  initial,
  profilComplet = true,
  gateSupplementaire,
}: {
  initial: Opportunite[];
  profilComplet?: boolean;
  gateSupplementaire?: GateSupplementaire;
}) {
  const router = useRouter();
  const [pile, setPile] = useState<Opportunite[]>(initial);
  const [sortante, setSortante] = useState<{ id: string; direction: "gauche" | "droite" } | null>(null);
  const [glissement, setGlissement] = useState(0);
  const [traduction, setTraduction] = useState<{ id: string; texte: string; titre?: string } | null>(null);
  const [loadingTraduction, setLoadingTraduction] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [demanderProfil, setDemanderProfil] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const actuelle = pile[0] ?? null;

  const enregistrerDecision = useCallback(async (id: string, decision: "interesse" | "ignore") => {
    await fetch(`/api/opportunites/${id}/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
  }, []);

  const genererEnArrierePlan = useCallback(async (opportunite: Opportunite) => {
    if (opportunite.type === "APPEL_PROJET") {
      try {
        const res = await fetch("/api/dossiers/generer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opportuniteId: opportunite.id, briefOnly: true }),
        });
        const data = await res.json() as { dossierId?: string };
        if (data.dossierId) {
          router.push(`/dossiers/${data.dossierId}/brief-projet`);
        }
      } catch { /* ignore */ }
      return;
    }

    const toastId = opportunite.id;
    setToasts((prev) => [...prev, { id: toastId, intitule: opportunite.intitule, statut: "loading" }]);
    try {
      const res = await fetch("/api/dossiers/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportuniteId: opportunite.id }),
      });
      const data = await res.json() as { dossierId?: string; statut?: string; erreur?: string; quotaAtteint?: boolean };
      if (data.quotaAtteint) {
        setToasts((prev) => prev.map((t) => t.id === toastId ? { ...t, statut: "erreur" as const } : t));
      } else if (data.statut === "genere" || data.statut === "a_preparer") {
        setToasts((prev) => prev.map((t) => t.id === toastId ? { ...t, statut: "ok" as const, dossierId: data.dossierId } : t));
      } else {
        setToasts((prev) => prev.map((t) => t.id === toastId ? { ...t, statut: "ok" as const, dossierId: data.dossierId } : t));
      }
    } catch {
      setToasts((prev) => prev.map((t) => t.id === toastId ? { ...t, statut: "erreur" as const } : t));
    }
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 6000);
  }, [router]);

  const passer = useCallback(
    (direction: "gauche" | "droite") => {
      if (!actuelle) return;
      if (direction === "droite" && !profilComplet) {
        // Pas de redirection immédiate : popup Matchwork, la carte reste en place.
        setDemanderProfil(true);
        setGlissement(0);
        return;
      }
      if (gateSupplementaire) {
        router.push(gateSupplementaire.lien);
        return;
      }
      const decision = direction === "droite" ? "interesse" : "ignore";
      setSortante({ id: actuelle.id, direction });
      enregistrerDecision(actuelle.id, decision);
      if (direction === "droite") {
        genererEnArrierePlan(actuelle);
      }
      setGlissement(0);
      setTraduction(null);
      setTimeout(() => {
        setPile((prev) => prev.slice(1));
        setSortante(null);
      }, 340);
    },
    [actuelle, profilComplet, gateSupplementaire, router, enregistrerDecision, genererEnArrierePlan]
  );

  // Flèches du clavier (ordinateur) : → « Ça m'intéresse », ← « Passer »
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!actuelle || sortante) return;
      if (e.key === "ArrowRight") { e.preventDefault(); passer("droite"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); passer("gauche"); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actuelle, sortante, passer]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setGlissement(e.clientX - startX.current);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(glissement) >= SWIPE_THRESHOLD) {
      passer(glissement > 0 ? "droite" : "gauche");
    } else {
      setGlissement(0);
    }
  };

  const traduire = async () => {
    if (!actuelle) return;
    if (traduction?.id === actuelle.id) return;
    setLoadingTraduction(true);
    try {
      const res = await fetch("/api/ia/traduire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportuniteId: actuelle.id }),
      });
      const data = await res.json() as { traduit?: string; titre?: string; erreur?: string };
      if (data.traduit) {
        setTraduction({ id: actuelle.id, texte: data.traduit, titre: data.titre || undefined });
      }
    } finally {
      setLoadingTraduction(false);
    }
  };

  if (!actuelle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>Vous avez tout vu !</p>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Revenez bientôt pour de nouvelles offres,<br />ou collez une offre manuellement.
        </p>
      </div>
    );
  }

  const rotation = glissement * 0.06;
  const estLangueEtrangere = actuelle.langueDetectee && actuelle.langueDetectee !== "fr";
  const badgeLangue = estLangueEtrangere
    ? LANGUE_LABELS[actuelle.langueDetectee!] ?? actuelle.langueDetectee!.toUpperCase()
    : null;

  let cardTransform = `translateX(${glissement}px) rotate(${rotation}deg)`;
  let cardTransition = dragging.current ? "none" : "transform 0.18s ease";

  // Sortie : pas d'opacité, la carte reste pleinement visible jusqu'à la sortie
  if (sortante?.id === actuelle.id) {
    const flyX = sortante.direction === "droite" ? 140 : -140;
    cardTransform = `translateX(${flyX}vw) rotate(${sortante.direction === "droite" ? 25 : -25}deg)`;
    cardTransition = "transform 0.34s cubic-bezier(.4,0,.2,1)";
  }

  const swipeRightOpacity = Math.max(0, Math.min(1, glissement / SWIPE_THRESHOLD));
  const swipeLeftOpacity = Math.max(0, Math.min(1, -glissement / SWIPE_THRESHOLD));

  const description = traduction?.id === actuelle.id ? traduction.texte : actuelle.description;
  const titreAffiche = (traduction?.id === actuelle.id && traduction.titre) ? traduction.titre : actuelle.intitule;

  return (
    <div className="w-full max-w-xl mx-auto select-none">
      <p className="text-xs text-center mb-4" style={{ color: "var(--text-3)" }}>
        {pile.length} {pile.length === 1 ? "offre restante" : "offres restantes"}
      </p>

      {/* Pile de cartes */}
      <div style={{ position: "relative", height: "520px" }}>
        {/* Carte 3ème niveau */}
        {pile[2] && (
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: "20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              transform: "scale(0.88) translateY(22px)",
              zIndex: 0,
            }}
          />
        )}

        {/* Carte en dessous — remonte quand sortante est active */}
        {pile[1] && (
          <div
            className={sortante ? "swipe-card-enter" : undefined}
            style={{
              position: "absolute", inset: 0, borderRadius: "20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              zIndex: 1,
              ...(sortante ? {} : { transform: "scale(0.94) translateY(12px)" }),
            }}
          />
        )}

        {/* Carte principale */}
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={() => {
            if (Math.abs(glissement) < 5 && !sortante) {
              router.push(`/opportunites/${actuelle.id}`);
            }
          }}
          style={{
            position: "absolute", inset: 0, borderRadius: "20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
            zIndex: 10,
            cursor: "grab",
            transform: cardTransform,
            transition: cardTransition,
            overflow: "hidden",
            touchAction: "none",
          }}
        >
          {/* Badge CANDIDATER */}
          <div style={{
            position: "absolute", top: 24, left: 20, zIndex: 20,
            opacity: swipeRightOpacity,
            border: "2px solid #7c3aed", borderRadius: "8px",
            padding: "4px 12px", pointerEvents: "none",
            transform: "rotate(-8deg)",
            background: "rgba(124,58,237,0.08)",
          }}>
            <span style={{ color: "#7c3aed", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>CANDIDATER</span>
          </div>

          {/* Badge PASSER */}
          <div style={{
            position: "absolute", top: 24, right: 20, zIndex: 20,
            opacity: swipeLeftOpacity,
            border: "2px solid var(--border-strong)", borderRadius: "8px",
            padding: "4px 12px", pointerEvents: "none",
            transform: "rotate(8deg)",
            background: "var(--bg-card)",
          }}>
            <span style={{ color: "var(--text-2)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>PASSER</span>
          </div>

          {/* Couverture (photo de l'offre) */}
          <div style={{ position: "relative" }}>
            <CouvertureOffre type={actuelle.type} organisme={actuelle.organisme} height={184} />
            {actuelle.score != null && actuelle.score > 0 && (
              <span style={{
                position: "absolute", top: 12, left: 12,
                fontSize: "0.7rem", fontWeight: 700,
                padding: "4px 9px", borderRadius: "7px",
                background: actuelle.score >= 70 ? "rgba(124,58,237,0.85)" : actuelle.score >= 40 ? "rgba(217,119,6,0.85)" : "rgba(100,100,100,0.7)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", gap: "4px",
                backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                {actuelle.score} %
              </span>
            )}
            {badgeLangue && (
              <span style={{
                position: "absolute", top: 12, right: 12,
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
                padding: "4px 9px", borderRadius: "7px",
                background: "rgba(0,0,0,0.45)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", gap: "5px",
                backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
              }}>
                <IconGlobe size={12} />
                {badgeLangue}
              </span>
            )}
          </div>

          {/* Titre */}
          <div style={{ padding: "16px 24px 0" }}>
            <p style={{ fontSize: "0.78rem", color: "var(--text-2)", marginBottom: "4px" }}>
              {actuelle.organisme}
            </p>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.35 }}>
              {titreAffiche}
            </h3>
          </div>

          {/* Corps */}
          <div style={{ padding: "18px 24px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{
              fontSize: "0.83rem", color: "var(--text-2)",
              lineHeight: 1.6, display: "-webkit-box",
              WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {description}
            </p>

            {/* Bouton traduire */}
            {estLangueEtrangere && traduction?.id !== actuelle.id && (
              <button
                onClick={(e) => { e.stopPropagation(); traduire(); }}
                disabled={loadingTraduction}
                style={{
                  alignSelf: "flex-start", fontSize: "0.82rem", fontWeight: 700,
                  padding: "8px 16px", borderRadius: "10px",
                  background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                  color: "#fff",
                  border: "none",
                  cursor: loadingTraduction ? "default" : "pointer",
                  opacity: loadingTraduction ? 0.6 : 1,
                  display: "flex", alignItems: "center", gap: "7px",
                  transition: "background 0.2s ease, transform 0.15s ease",
                }}
              >
                <IconTranslate size={15} />
                {loadingTraduction ? "Traduction…" : "Traduire en français"}
              </button>
            )}
            {traduction?.id === actuelle.id && (
              <span style={{
                fontSize: "0.78rem", color: "var(--text)", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "10px",
                background: "var(--bg)", border: "1px solid var(--border)",
              }}>
                <IconCheck size={14} />
                Traduit en français
              </span>
            )}

            {/* Méta-infos */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {actuelle.exigenceLangue && (
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "var(--text-3)", minWidth: 16, display: "flex" }}>
                    <IconSpeech size={14} />
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>{actuelle.exigenceLangue}</span>
                </div>
              )}
              {actuelle.dateLimite && (
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "var(--text-3)", minWidth: 16, display: "flex" }}>
                    <IconCalendar size={14} />
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
                    {formatDate(actuelle.dateLimite)}
                    {joursRestants(actuelle.dateLimite) && (
                      <span style={{
                        marginLeft: "6px", fontSize: "0.75rem",
                        color: joursRestants(actuelle.dateLimite) === "Aujourd'hui" ? "#f59e0b" : "var(--text-3)",
                      }}>
                        ({joursRestants(actuelle.dateLimite)} restants)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            <p style={{ fontSize: "0.72rem", color: "var(--text-4)", textAlign: "center", marginTop: "4px" }}>
              Swipez ou utilisez les boutons ci-dessous
            </p>
          </div>
        </div>
      </div>

      {profilComplet && gateSupplementaire && (
        <div
          onClick={() => router.push(gateSupplementaire.lien)}
          style={{
            marginTop: 24, padding: "14px 20px", borderRadius: 16,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            color: "#fff", textAlign: "center", cursor: "pointer",
            boxShadow: "0 6px 24px rgba(124,58,237,0.35)",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{gateSupplementaire.titre}</p>
          <p style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: 4 }}>{gateSupplementaire.sousTitre}</p>
        </div>
      )}

      {/* Boutons swipe */}
      <div className="flex items-center justify-center gap-5 mt-8">
        <button
          onClick={() => passer("gauche")}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--bg-card)", border: "1.5px solid var(--border-strong)",
            color: "var(--text-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "transform 0.18s ease, background 0.18s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card-hover)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          aria-label="Passer"
        >
          <IconPasser size={22} />
        </button>

        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (!actuelle) return;
            const url = `${window.location.origin}/opportunites/${actuelle.id}`;
            const texte = `*${actuelle.intitule}*\n${actuelle.organisme}\n\n${actuelle.description}\n\n${url}`;
            if (navigator.share) {
              try {
                const res = await fetch(`/api/og/${actuelle.id}`);
                const blob = await res.blob();
                const file = new File([blob], `${actuelle.intitule}.png`, { type: "image/png" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  await navigator.clipboard.writeText(texte);
                  setToasts((prev) => [...prev, { id: "partage-" + actuelle.id, intitule: "Texte copié ! Collez-le dans votre message.", statut: "ok" as const }]);
                  setTimeout(() => setToasts((prev) => prev.filter((t) => !t.id.startsWith("partage-"))), 5000);
                  await navigator.share({ files: [file] });
                } else {
                  await navigator.share({ text: texte });
                }
              } catch {}
            } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, "_blank", "noopener");
            }
          }}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "transparent", border: "1.5px solid var(--border-strong)",
            color: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "transform 0.18s ease, border-color 0.18s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#7c3aed"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          aria-label="Partager"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>

        <button
          onClick={() => passer("droite")}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)", border: "none",
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "transform 0.18s ease, filter 0.18s ease",
            boxShadow: "0 6px 18px rgba(124,58,237,0.35)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          aria-label="Candidater"
        >
          <IconCandidater size={20} />
        </button>
      </div>
      <div className="flex justify-center mt-2" style={{ gap: "28px" }}>
        <span style={{ fontSize: "0.68rem", color: "var(--text-3)", width: 56, textAlign: "center" }}>Passer</span>
        <span style={{ fontSize: "0.68rem", color: "var(--text-3)", width: 40, textAlign: "center" }}>Partager</span>
        <span style={{ fontSize: "0.68rem", color: "var(--text-3)", width: 56, textAlign: "center" }}>Candidater</span>
      </div>

      {/* Toasts de génération */}
      {toasts.length > 0 && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100, display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                if (t.dossierId) router.push(`/dossiers/${t.dossierId}`);
              }}
              style={{
                padding: "12px 16px", borderRadius: 14,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                cursor: t.dossierId ? "pointer" : "default",
                display: "flex", alignItems: "center", gap: 12,
                animation: "fadeInUp 0.3s ease",
              }}
            >
              {t.statut === "loading" && (
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#a78bfa", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
              )}
              {t.statut === "ok" && (
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
              {t.statut === "erreur" && (
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.statut === "loading" ? "Génération en cours…" : t.statut === "ok" ? "Dossier prêt" : "Quota épuisé"}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.intitule}
                </p>
                {t.statut === "ok" && t.dossierId && (
                  <p style={{ fontSize: "0.68rem", color: "#a78bfa", marginTop: 2 }}>Cliquer pour voir le dossier</p>
                )}
                {t.statut === "erreur" && (
                  <p style={{ fontSize: "0.68rem", color: "#f87171", marginTop: 2 }}>Passez à un abonnement Pro</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup profil incomplet — remplace l'ancienne bannière permanente,
          n'apparaît qu'au moment où l'action a vraiment du sens (swipe droite). */}
      {demanderProfil && (
        <div
          role="dialog"
          aria-label="Créer votre profil"
          onClick={() => setDemanderProfil(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(10,6,20,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 380, width: "100%", borderRadius: 22, padding: "28px 24px 24px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              boxShadow: "0 30px 70px -15px rgba(31,16,64,0.45)", textAlign: "center",
            }}
          >
            <div style={{
              width: 56, height: 56, margin: "0 auto 16px", borderRadius: 16,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 22px -6px rgba(124,58,237,0.5)",
            }}>
              <IconCandidater size={24} />
            </div>
            <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", marginBottom: 8 }}>
              Créez votre profil avec Amara
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.6, marginBottom: 22 }}>
              Amara, notre IA, discute avec vous quelques minutes pour construire votre profil — indispensable pour générer un dossier adapté à cette offre.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => router.push("/onboarding")}
                style={{
                  padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff",
                  fontWeight: 600, fontSize: "0.9rem",
                  boxShadow: "0 6px 18px rgba(124,58,237,0.35)",
                }}
              >
                Créer mon profil avec Amara
              </button>
              <button
                onClick={() => setDemanderProfil(false)}
                style={{
                  padding: "11px 0", borderRadius: 12, cursor: "pointer",
                  background: "transparent", border: "1px solid var(--border)", color: "var(--text-2)",
                  fontWeight: 600, fontSize: "0.85rem",
                }}
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
