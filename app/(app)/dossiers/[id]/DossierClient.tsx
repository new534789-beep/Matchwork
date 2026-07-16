"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChecklistItem } from "./page";

type DocGenere = { id: string; type: string; label: string; contenu: string; langue: string };

type DossierData = {
  id: string;
  statut: string;
  createdAt: string;
  opportunite: {
    id: string;
    intitule: string;
    organisme: string;
    langueDetectee: string | null;
    dateLimite: string | null;
    lien: string | null;
    canalCandidature: string;
    cibleCandidature: string | null;
  };
  docsGeneres: DocGenere[];
};

type ModeleCv = "classique" | "sidebar" | "bandeau";

const MODELES_CV: { valeur: ModeleCv; label: string; description: string }[] = [
  { valeur: "classique", label: "Classique", description: "Colonne unique, sobre" },
  { valeur: "sidebar", label: "Bandeau latéral", description: "Contact à gauche en violet" },
  { valeur: "bandeau", label: "Bandeau plein", description: "Identité en bloc violet" },
];

type Props = { dossier: DossierData; checklist: ChecklistItem[]; modeleCvInitial?: ModeleCv };

const V = "#7c3aed";

function estEmail(v: string | null | undefined): v is string {
  return !!v && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export function DossierClient({ dossier, checklist, modeleCvInitial = "classique" }: Props) {
  const router = useRouter();
  const docs = dossier.docsGeneres;
  const aUnCv = docs.some((d) => d.type === "cv");
  const [modeleCv, setModeleCv] = useState<ModeleCv>(modeleCvInitial);
  const [modeleSaving, setModeleSaving] = useState(false);

  async function choisirModeleCv(m: ModeleCv) {
    if (m === modeleCv || modeleSaving) return;
    setModeleCv(m);
    setModeleSaving(true);
    try {
      await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modeleCv: m }),
      });
    } finally {
      setModeleSaving(false);
    }
  }

  const [contenus, setContenus] = useState<Record<string, string>>(
    () => Object.fromEntries(docs.map((d) => [d.id, d.contenu])),
  );
  const [actifId, setActifId] = useState<string>(docs[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [statut, setStatut] = useState(dossier.statut);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<Record<number, { uploading: boolean; erreur?: string; ok?: boolean }>>({});
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const areaRef = useRef<HTMLTextAreaElement>(null);

  async function televerserPiece(i: number, typeDoc: string, fichier: File) {
    setUploadInfo((p) => ({ ...p, [i]: { uploading: true } }));
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("type", typeDoc);
    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json() as { erreur?: string };
      if (!res.ok) { setUploadInfo((p) => ({ ...p, [i]: { uploading: false, erreur: data.erreur ?? "Erreur lors du dépôt." } })); return; }
      setUploadInfo((p) => ({ ...p, [i]: { uploading: false, ok: true } }));
      router.refresh();
    } catch {
      setUploadInfo((p) => ({ ...p, [i]: { uploading: false, erreur: "Impossible de déposer le fichier." } }));
    }
  }

  useEffect(() => { setContenus(Object.fromEntries(docs.map((d) => [d.id, d.contenu]))); }, [docs]);
  useEffect(() => { autoResize(areaRef.current); }, [actifId, contenus]);

  const opp = dossier.opportunite;
  const dateLimite = opp.dateLimite ? new Date(opp.dateLimite) : null;
  const joursRestants = dateLimite ? Math.ceil((dateLimite.getTime() - Date.now()) / 86400000) : null;
  const enRetard = joursRestants !== null && joursRestants < 0;
  const urgent = joursRestants !== null && joursRestants >= 0 && joursRestants <= 7;

  const piecesManquantes = checklist.filter((c) => c.categorie === "personnel" && c.statut === "manquante");
  const prets = checklist.filter((c) => c.statut === "genere" || c.statut === "presente").length;
  const docActif = docs.find((d) => d.id === actifId);
  const contenuActif = contenus[actifId] ?? "";
  const verrouille = statut === "utilise";

  async function sauvegarder() {
    if (!docActif) return;
    setSaving(true); setErreur(null);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}/documents/${docActif.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenu: contenuActif }),
      });
      if (!res.ok) { const d = await res.json() as { erreur?: string }; throw new Error(d.erreur ?? "Erreur"); }
      setSavedOk(true); setTimeout(() => setSavedOk(false), 2500);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Impossible de sauvegarder.");
    } finally { setSaving(false); }
  }

  async function regenerer() {
    if (!confirm("Régénérer le dossier ? Le contenu actuel sera remplacé.")) return;
    setRegenerating(true); setErreur(null);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}/regenerer`, { method: "POST" });
      const data = await res.json() as { erreur?: string };
      if (!res.ok) throw new Error(data.erreur ?? "Erreur");
      window.location.reload();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la régénération.");
      setRegenerating(false);
    }
  }

  async function marquerUtilise() {
    if (statut === "utilise") return;
    try {
      await fetch(`/api/dossiers/${dossier.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut: "utilise" }) });
      setStatut("utilise");
    } catch { /* silencieux */ }
  }

  function ouvrir(url: string) { window.open(url, "_blank", "noopener,noreferrer"); }

  async function envoyerEmail(mode: "candidature" | "self") {
    setActionEnCours(true); setErreur(null);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}/email`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode }),
      });
      const data = (await res.json()) as { ok?: boolean; erreur?: string; destinataire?: string };
      if (res.ok && data.ok) {
        await marquerUtilise();
        alert(mode === "candidature" ? `Dossier envoyé à ${data.destinataire}.` : "Dossier envoyé sur votre adresse e-mail.");
      } else setErreur(data.erreur ?? "Envoi indisponible pour le moment.");
    } catch { setErreur("Envoi indisponible pour le moment."); }
    finally { setActionEnCours(false); }
  }

  async function telecharger() {
    setActionEnCours(true);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}/pdf`);
      if (!res.ok) { setErreur("Impossible de générer le PDF."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Matchwork-${opp.organisme.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await marquerUtilise();
    } catch {
      setErreur("Erreur lors du téléchargement du PDF.");
    } finally {
      setActionEnCours(false);
    }
  }

  async function annuler() {
    if (!confirm("Annuler ce dossier ? Il sera supprimé et le crédit vous sera rendu.")) return;
    setActionEnCours(true);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}`, { method: "DELETE" });
      if (res.ok) { router.push("/candidatures"); router.refresh(); }
      else { setErreur("Impossible d'annuler le dossier."); setActionEnCours(false); }
    } catch { setErreur("Impossible d'annuler le dossier."); setActionEnCours(false); }
  }

  // ── Bouton de candidature intelligent (priorité email > formulaire > lien_info > aucun) ──
  const canal = opp.canalCandidature;
  const cible = opp.cibleCandidature;
  let bouton: { label: string; onClick: () => void; note?: string };
  if (canal === "email" && estEmail(cible)) {
    bouton = { label: `Envoyer à ${cible}`, onClick: () => envoyerEmail("candidature"), note: "L'IA a détecté une candidature par e-mail." };
  } else if (canal === "formulaire" && cible) {
    bouton = { label: "Postuler (formulaire)", onClick: () => { ouvrir(cible); marquerUtilise(); }, note: "Candidature via un formulaire en ligne." };
  } else if (canal === "lien_info" && cible) {
    bouton = { label: "Postuler sur le site officiel", onClick: () => { ouvrir(cible); marquerUtilise(); } };
  } else if (opp.lien) {
    // Ambigu / non déterminé : on affiche le lien sans forcer d'envoi.
    bouton = { label: "Postuler ici →", onClick: () => { ouvrir(opp.lien!); marquerUtilise(); }, note: "Canal non déterminé — vérifiez la marche à suivre sur le site." };
  } else {
    bouton = { label: "Recevoir mon dossier par e-mail", onClick: () => envoyerEmail("self"), note: "Aucun canal indiqué : recevez le dossier pour postuler vous-même." };
  }

  const dateGen = new Date(dossier.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: #fff !important; color: #111 !important; }
          .print-page { padding: 2cm 2.5cm; font-family: Georgia, 'Times New Roman', serif; }
          .print-meta { font-size: 9pt; color: #555; margin-bottom: 16pt; }
          .print-heading { font-size: 15pt; font-weight: bold; border-bottom: 1.5px solid #333; padding-bottom: 6pt; margin-bottom: 14pt; }
          .print-body { font-size: 11pt; line-height: 1.75; white-space: pre-wrap; }
          .print-break { page-break-after: always; }
        }
        .print-only { display: none; }
        textarea:focus { outline: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Impression : tous les documents */}
      <div className="print-only">
        {docs.map((d, i) => (
          <div key={d.id} className={i < docs.length - 1 ? "print-page print-break" : "print-page"}>
            <p className="print-meta">{opp.organisme} — {opp.intitule}</p>
            <h1 className="print-heading">{d.label}</h1>
            <p className="print-body">{contenus[d.id] ?? d.contenu}</p>
          </div>
        ))}
      </div>

      <div className="no-print" style={{ maxWidth: 560, margin: "0 auto", paddingBottom: 48 }}>

        {/* Deadline */}
        {dateLimite && (
          <div style={{
            borderRadius: 12, padding: "11px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10,
            background: enRetard ? "#ef4444" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>
              {enRetard ? `Date limite dépassée (${dateLimite.toLocaleDateString("fr-FR")})`
                : joursRestants === 0 ? "Date limite aujourd'hui !"
                : `${joursRestants} jour${joursRestants! > 1 ? "s" : ""} avant la date limite — ${dateLimite.toLocaleDateString("fr-FR")}`}
              {urgent && !enRetard ? " · urgent" : ""}
            </span>
          </div>
        )}

        {/* En-tête */}
        <div style={{ borderRadius: 16, padding: "18px 20px", marginBottom: 14, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 8px 22px -6px rgba(124,58,237,0.4)" }}>
          <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.75)", marginBottom: 3 }}>{opp.organisme}</p>
          <h1 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 5 }}>{opp.intitule}</h1>
          <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.65)" }}>Généré le {dateGen}{verrouille ? " · utilisé" : ""}</p>
        </div>

        {/* Checklist de conformité */}
        {checklist.length > 0 && (
          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)" }}>Checklist de conformité</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 10px", borderRadius: 6, background: V, color: "#fff" }}>{prets}/{checklist.length} prêts</span>
            </div>
            <ul style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
              {checklist.map((item, i) => {
                const ok = item.statut === "genere" || item.statut === "presente";
                const tag = item.statut === "genere" ? "généré par l'IA" : item.statut === "presente" ? "dans le coffre" : item.statut === "a_generer" ? "génération en cours" : "à fournir";
                return (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: ok ? V : "var(--bg)", border: `1px solid ${ok ? V : "var(--border-strong, var(--border))"}`, color: ok ? "#fff" : "var(--text-3)" }}>
                      {ok ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />}
                    </div>
                    <span style={{ fontSize: "0.85rem", flex: 1, color: ok ? "var(--text)" : "var(--text-3)" }}>
                      {item.nom}{!item.obligatoire && <span style={{ marginLeft: 6, fontSize: "0.68rem", color: "var(--text-3)" }}>optionnel</span>}
                    </span>
                    <span style={{ fontSize: "0.66rem", fontWeight: 600, color: ok ? V : "var(--text-3)" }}>{tag}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Compléter mes pièces personnelles — dépôt direct, une zone par document */}
        {piecesManquantes.length > 0 && (
          <div style={{ borderRadius: 14, padding: "14px 18px", marginBottom: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Compléter mes pièces personnelles</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: 12 }}>Ces pièces ne se génèrent pas : déposez-les directement ici.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {piecesManquantes.map((p) => {
                const i = checklist.indexOf(p);
                const info = uploadInfo[i];
                return (
                  <div key={i} style={{ borderRadius: 12, padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{p.nom}</span>
                      <button
                        onClick={() => fileRefs.current[i]?.click()}
                        disabled={info?.uploading}
                        style={{
                          flexShrink: 0, padding: "7px 14px", borderRadius: 9, border: "none", cursor: info?.uploading ? "default" : "pointer",
                          background: V, color: "#fff", fontSize: "0.76rem", fontWeight: 600, opacity: info?.uploading ? 0.7 : 1,
                        }}
                      >
                        {info?.uploading ? "Dépôt…" : "Choisir un fichier"}
                      </button>
                      <input
                        ref={(el) => { fileRefs.current[i] = el; }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) void televerserPiece(i, p.typeDoc ?? "AUTRE", f); e.target.value = ""; }}
                      />
                    </div>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: 4 }}>PDF, JPEG ou PNG · Max 10 Mo</p>
                    {info?.erreur && <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 6, fontWeight: 600 }}>{info.erreur}</p>}
                    {info?.ok && <p style={{ fontSize: "0.72rem", color: "#22c55e", marginTop: 6, fontWeight: 600 }}>Déposé — extraction en cours…</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Éditeur — un onglet par document généré */}
        {docs.length > 0 ? (
          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
              {docs.map((d) => (
                <button key={d.id} onClick={() => setActifId(d.id)} style={{
                  flex: "1 0 auto", padding: "12px 16px", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap",
                  background: actifId === d.id ? V : "transparent",
                  color: actifId === d.id ? "#fff" : "var(--text-3)", border: "none",
                  borderBottom: actifId === d.id ? `2px solid ${V}` : "2px solid transparent", cursor: "pointer",
                }}>{d.label}</button>
              ))}
            </div>
            <div style={{ padding: "16px 18px" }}>
              <textarea
                ref={areaRef}
                value={contenuActif}
                readOnly={verrouille}
                onChange={(e) => { setContenus((p) => ({ ...p, [actifId]: e.target.value })); autoResize(e.target); }}
                placeholder="Le document apparaîtra ici…"
                style={{ width: "100%", minHeight: 300, resize: "none", overflow: "hidden", background: "transparent", border: "none", color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.75, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{contenuActif.trim().split(/\s+/).filter(Boolean).length} mots</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => navigator.clipboard.writeText(contenuActif)} style={{ padding: "7px 14px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer" }}>Copier</button>
                {!verrouille && (
                  <button onClick={sauvegarder} disabled={saving} style={{ padding: "7px 18px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, background: V, border: "none", color: "#fff", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
                    {saving ? "Enregistrement…" : savedOk ? "Sauvegardé ✓" : "Sauvegarder"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: 14, padding: "24px 18px", marginBottom: 14, textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.85rem" }}>
            Aucun document rédactionnel généré pour cette offre.
          </div>
        )}

        {erreur && <div style={{ borderRadius: 10, padding: "11px 16px", marginBottom: 14, background: "#ef4444", color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{erreur}</div>}

        {/* Choix du modèle de CV (mise en page du PDF, sans changer le contenu) */}
        {aUnCv && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>Modèle du CV (PDF)</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {MODELES_CV.map((m) => {
                const actif = modeleCv === m.valeur;
                return (
                  <button
                    key={m.valeur}
                    onClick={() => choisirModeleCv(m.valeur)}
                    disabled={modeleSaving}
                    style={{
                      padding: "10px 8px", borderRadius: 11, textAlign: "left", cursor: modeleSaving ? "default" : "pointer",
                      background: actif ? V : "var(--bg-card)",
                      border: actif ? `1.5px solid ${V}` : "1px solid var(--border)",
                    }}
                  >
                    <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: actif ? "#fff" : "var(--text)" }}>{m.label}</span>
                    <span style={{ display: "block", fontSize: "0.68rem", color: actif ? "rgba(255,255,255,0.75)" : "var(--text-3)", marginTop: 2, lineHeight: 1.3 }}>{m.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bouton de candidature intelligent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          <button onClick={bouton.onClick} disabled={actionEnCours} style={{ width: "100%", padding: "13px", borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontSize: "0.9rem", fontWeight: 700, border: "none", cursor: actionEnCours ? "default" : "pointer", opacity: actionEnCours ? 0.7 : 1, boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}>
            {actionEnCours ? "En cours…" : bouton.label}
          </button>
          {bouton.note && <p style={{ fontSize: "0.72rem", color: "var(--text-3)", textAlign: "center" }}>{bouton.note}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={telecharger} style={{ padding: "11px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Télécharger (PDF)</button>
            <button onClick={() => envoyerEmail("self")} disabled={actionEnCours} style={{ padding: "11px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 600, cursor: actionEnCours ? "default" : "pointer", opacity: actionEnCours ? 0.6 : 1 }}>Recevoir par e-mail</button>
          </div>
          {statut === "genere" && (
            <button onClick={annuler} disabled={actionEnCours} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "transparent", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.82rem", fontWeight: 600, cursor: actionEnCours ? "default" : "pointer" }}>Annuler le dossier (rendre le crédit)</button>
          )}
          {verrouille && <p style={{ textAlign: "center", fontSize: "0.76rem", color: "var(--text-3)", padding: "4px 0" }}>Dossier utilisé — crédit consommé, annulation désactivée.</p>}
        </div>

        {/* Régénérer */}
        {!verrouille && docs.length > 0 && (
          <button onClick={regenerer} disabled={regenerating} style={{ width: "100%", padding: "13px", borderRadius: 13, marginBottom: 10, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.875rem", fontWeight: 600, cursor: regenerating ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {regenerating ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>↻</span> Régénération en cours…</> : <>↻ Régénérer le dossier</>}
          </button>
        )}

        <Link href="/candidatures" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.85rem", textDecoration: "none" }}>Voir toutes mes candidatures</Link>
      </div>
    </>
  );
}
