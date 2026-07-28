"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChecklistItem } from "./page";
import { TimelineDossier } from "./TimelineDossier";
import { useToast } from "@/components/ui/Toast";

type DocGenere = { id: string; type: string; label: string; contenu: string; langue: string };
type EtapeObtention = { id: string; texte: string; lienGuide: string | null; fait: boolean };

type DossierData = {
  id: string;
  statut: string;
  createdAt: string;
  updatedAt: string;
  relanceEnvoyeeLe: string | null;
  planPro: boolean;
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
  etapesPostObtention: EtapeObtention[];
};

type Props = { dossier: DossierData; checklist: ChecklistItem[] };

const V = "#7c3aed";

function estEmail(v: string | null | undefined): v is string {
  return !!v && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

export function DossierClient({ dossier, checklist }: Props) {
  const router = useRouter();
  const toast = useToast();
  const docs = dossier.docsGeneres;

  const [regenerating, setRegenerating] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [statut, setStatut] = useState(dossier.statut);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<Record<number, { uploading: boolean; erreur?: string; ok?: boolean }>>({});
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [choixFormatDoc, setChoixFormatDoc] = useState<DocGenere | null>(null);
  const [relanceMessage, setRelanceMessage] = useState<string | null>(null);
  const [relanceEnCours, setRelanceEnCours] = useState(false);
  const [relanceCopie, setRelanceCopie] = useState(false);
  const [etapes, setEtapes] = useState(dossier.etapesPostObtention);
  const [obtenuEnCours, setObtenuEnCours] = useState(false);

  // Ouvre le PDF dans un nouvel onglet — plus fiable qu'une <iframe> dans une
  // popup, en particulier sur mobile où l'affichage de PDF intégré échoue
  // souvent silencieusement (pas de plugin PDF dans le cadre de la webview).
  function previsualiser(doc: DocGenere) {
    window.open(`/api/dossiers/${dossier.id}/pdf?docId=${doc.id}&apercu=1`, "_blank", "noopener,noreferrer");
  }

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

  const opp = dossier.opportunite;
  const dateLimite = opp.dateLimite ? new Date(opp.dateLimite) : null;
  const joursRestants = dateLimite ? Math.ceil((dateLimite.getTime() - Date.now()) / 86400000) : null;
  const enRetard = joursRestants !== null && joursRestants < 0;
  const urgent = joursRestants !== null && joursRestants >= 0 && joursRestants <= 7;

  const piecesManquantes = checklist.filter((c) => c.categorie === "personnel" && c.statut === "manquante");
  const verrouille = statut === "utilise" || statut === "obtenu";
  const obtenu = statut === "obtenu";

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

  async function telechargerDocument(doc: DocGenere, format: "pdf" | "word") {
    setChoixFormatDoc(null);
    setActionEnCours(true);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}/${format === "pdf" ? "pdf" : "word"}?docId=${doc.id}`);
      if (!res.ok) { setErreur(`Impossible de générer le document ${format === "pdf" ? "PDF" : "Word"}.`); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Matchwork-${doc.label.replace(/[^a-zA-Z0-9]/g, "_")}-${opp.organisme.replace(/[^a-zA-Z0-9]/g, "_")}.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await marquerUtilise();
    } catch {
      setErreur(`Erreur lors du téléchargement du document ${format === "pdf" ? "PDF" : "Word"}.`);
    } finally {
      setActionEnCours(false);
    }
  }

  async function genererRelance() {
    setRelanceEnCours(true); setErreur(null); setRelanceCopie(false);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}/relance`, { method: "POST" });
      const data = (await res.json()) as { message?: string; erreur?: string };
      if (res.ok && data.message) setRelanceMessage(data.message);
      else setErreur(data.erreur ?? "Impossible de générer le message de relance.");
    } catch { setErreur("Impossible de générer le message de relance."); }
    finally { setRelanceEnCours(false); }
  }

  async function copierRelance() {
    if (!relanceMessage) return;
    try { await navigator.clipboard.writeText(relanceMessage); setRelanceCopie(true); } catch { /* silencieux */ }
  }

  async function marquerObtenu() {
    if (obtenuEnCours) return;
    setObtenuEnCours(true); setErreur(null);
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}/obtenu`, { method: "POST" });
      const data = (await res.json()) as { etapes?: EtapeObtention[]; erreur?: string };
      if (!res.ok || !data.etapes) { setErreur(data.erreur ?? "Impossible de marquer l'offre comme obtenue."); return; }
      setStatut("obtenu");
      setEtapes(data.etapes);
      toast.succes("Offre marquée comme obtenue — bravo !");
    } catch { setErreur("Impossible de marquer l'offre comme obtenue."); }
    finally { setObtenuEnCours(false); }
  }

  async function basculerEtape(etapeId: string, fait: boolean) {
    setEtapes((prev) => prev.map((e) => (e.id === etapeId ? { ...e, fait } : e)));
    try {
      await fetch(`/api/dossiers/${dossier.id}/etapes/${etapeId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fait }),
      });
    } catch {
      setEtapes((prev) => prev.map((e) => (e.id === etapeId ? { ...e, fait: !fait } : e)));
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

  // ── Bouton de candidature intelligent — priorité email > formulaire exact.
  // Matchwork n'envoie plus jamais l'utilisateur "voir sur le site" à l'aveugle
  // (ancien cas lien_info/canal indéterminé) : si aucun des deux canaux fiables
  // n'est connu, on ne propose que de recevoir le dossier pour postuler soi-même.
  const canal = opp.canalCandidature;
  const cible = opp.cibleCandidature;
  let bouton: { label: string; onClick: () => void; note?: string };
  let emailDestinataire: string | null = null;
  if (canal === "email" && estEmail(cible)) {
    emailDestinataire = cible;
    bouton = { label: "Envoyer la candidature", onClick: () => envoyerEmail("candidature"), note: "Matchwork envoie directement votre dossier au recruteur." };
  } else if (canal === "formulaire" && cible) {
    bouton = { label: "Postuler (formulaire)", onClick: () => { ouvrir(cible); marquerUtilise(); }, note: "Vous arrivez directement sur le formulaire de candidature." };
  } else {
    bouton = { label: "Recevoir mon dossier par e-mail", onClick: () => envoyerEmail("self"), note: "Aucun canal de candidature fiable trouvé pour cette offre : recevez le dossier pour postuler vous-même." };
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
            <p className="print-body">{d.contenu}</p>
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

        <TimelineDossier
          statut={statut}
          docsCount={docs.length}
          createdAt={dossier.createdAt}
          updatedAt={dossier.updatedAt}
          relanceEnvoyeeLe={dossier.relanceEnvoyeeLe}
          planPro={dossier.planPro}
        />

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

        {/* Documents générés — une section par document, avec aperçu et téléchargement individuels */}
        {docs.length > 0 ? (
          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)" }}>Documents générés</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {docs.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    padding: "14px 18px",
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={V} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => previsualiser(d)}
                      style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.76rem", fontWeight: 600, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Aperçu
                    </button>
                    <button
                      onClick={() => setChoixFormatDoc(d)}
                      disabled={actionEnCours}
                      style={{ padding: "7px 12px", borderRadius: 9, fontSize: "0.76rem", fontWeight: 700, background: V, border: "none", color: "#fff", cursor: actionEnCours ? "default" : "pointer", opacity: actionEnCours ? 0.7 : 1, whiteSpace: "nowrap" }}
                    >
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: 14, padding: "24px 18px", marginBottom: 14, textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.85rem" }}>
            Aucun document rédactionnel généré pour cette offre.
          </div>
        )}

        {erreur && <div style={{ borderRadius: 10, padding: "11px 16px", marginBottom: 14, background: "#ef4444", color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{erreur}</div>}

        {/* Bouton de candidature intelligent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {emailDestinataire && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={V} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: V, wordBreak: "break-all" }}>{emailDestinataire}</span>
            </div>
          )}
          <button onClick={bouton.onClick} disabled={actionEnCours} style={{ width: "100%", padding: "13px", borderRadius: 13, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontSize: "0.9rem", fontWeight: 700, border: "none", cursor: actionEnCours ? "default" : "pointer", opacity: actionEnCours ? 0.7 : 1, boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}>
            {actionEnCours ? "En cours…" : bouton.label}
          </button>
          {bouton.note && <p style={{ fontSize: "0.72rem", color: "var(--text-3)", textAlign: "center" }}>{bouton.note}</p>}
          <button onClick={() => envoyerEmail("self")} disabled={actionEnCours} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 600, cursor: actionEnCours ? "default" : "pointer", opacity: actionEnCours ? 0.6 : 1 }}>Recevoir par e-mail</button>
          {statut === "genere" && (
            <button onClick={annuler} disabled={actionEnCours} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "transparent", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.82rem", fontWeight: 600, cursor: actionEnCours ? "default" : "pointer" }}>Annuler le dossier (rendre le crédit)</button>
          )}
          {verrouille && <p style={{ textAlign: "center", fontSize: "0.76rem", color: "var(--text-3)", padding: "4px 0" }}>Dossier utilisé — crédit consommé, annulation désactivée.</p>}
          {statut === "utilise" && (
            <button onClick={marquerObtenu} disabled={obtenuEnCours} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e", fontSize: "0.82rem", fontWeight: 700, cursor: obtenuEnCours ? "default" : "pointer" }}>
              {obtenuEnCours ? "…" : "J'ai obtenu cette offre !"}
            </button>
          )}
        </div>

        {/* Checklist post-obtention — visa, documents, logement... */}
        {obtenu && etapes.length > 0 && (
          <div style={{ borderRadius: 14, padding: "14px 18px", marginBottom: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>Prochaines étapes</p>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: V }}>
                {etapes.filter((e) => e.fait).length}/{etapes.length}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "var(--bg)", marginBottom: 14, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round((etapes.filter((e) => e.fait).length / etapes.length) * 100)}%`, background: V, transition: "width 0.2s ease" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {etapes.map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <button
                    onClick={() => basculerEtape(e.id, !e.fait)}
                    style={{
                      flexShrink: 0, marginTop: 1, width: 18, height: 18, borderRadius: 5, cursor: "pointer",
                      background: e.fait ? V : "transparent", border: `1.5px solid ${e.fait ? V : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {e.fait && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.82rem", color: "var(--text)", textDecoration: e.fait ? "line-through" : "none", opacity: e.fait ? 0.55 : 1, lineHeight: 1.4 }}>{e.texte}</p>
                    {e.lienGuide && (
                      <a href={`/guides/${e.lienGuide}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.74rem", color: V, textDecoration: "underline" }}>
                        Voir le guide →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relancer le recruteur — brouillon généré à la demande, jamais envoyé automatiquement */}
        {statut === "utilise" && (
          <div style={{ borderRadius: 14, padding: "14px 18px", marginBottom: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Relancer le recruteur</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: 12 }}>Sans nouvelle après quelques jours ? Générez un brouillon de message à envoyer vous-même.</p>
            {!relanceMessage ? (
              <button
                onClick={genererRelance}
                disabled={relanceEnCours}
                style={{ width: "100%", padding: "11px", borderRadius: 11, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontWeight: 600, cursor: relanceEnCours ? "default" : "pointer", opacity: relanceEnCours ? 0.7 : 1 }}
              >
                {relanceEnCours ? "Génération…" : "Générer un message de relance"}
              </button>
            ) : (
              <>
                <textarea
                  readOnly
                  value={relanceMessage}
                  rows={6}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", lineHeight: 1.5, resize: "vertical", marginBottom: 10 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={copierRelance} style={{ flex: 1, padding: "10px", borderRadius: 10, background: V, border: "none", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                    {relanceCopie ? "Copié !" : "Copier le message"}
                  </button>
                  <button onClick={genererRelance} disabled={relanceEnCours} style={{ padding: "10px 14px", borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.8rem", fontWeight: 600, cursor: relanceEnCours ? "default" : "pointer" }}>
                    ↻
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Régénérer */}
        {!verrouille && docs.length > 0 && (
          <button onClick={regenerer} disabled={regenerating} style={{ width: "100%", padding: "13px", borderRadius: 13, marginBottom: 10, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.875rem", fontWeight: 600, cursor: regenerating ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {regenerating ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>↻</span> Régénération en cours…</> : <>↻ Régénérer le dossier</>}
          </button>
        )}

        <Link href="/candidatures" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.85rem", textDecoration: "none" }}>Voir toutes mes candidatures</Link>
      </div>

      {/* Popup de choix de format — PDF ou Word, pour un document précis */}
      {choixFormatDoc && (
        <div
          onClick={() => setChoixFormatDoc(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 340, padding: 22, border: "1px solid var(--border)" }}
          >
            <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 4, textAlign: "center" }}>{choixFormatDoc.label}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 18, textAlign: "center" }}>Choisissez le format de téléchargement</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => telechargerDocument(choixFormatDoc, "pdf")}
                style={{ padding: "12px", borderRadius: 11, fontSize: "0.85rem", fontWeight: 700, background: V, border: "none", color: "#fff", cursor: "pointer" }}
              >
                PDF
              </button>
              <button
                onClick={() => telechargerDocument(choixFormatDoc, "word")}
                style={{ padding: "12px", borderRadius: 11, fontSize: "0.85rem", fontWeight: 700, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer" }}
              >
                Word (.docx)
              </button>
              <button
                onClick={() => setChoixFormatDoc(null)}
                style={{ padding: "10px", borderRadius: 11, fontSize: "0.8rem", fontWeight: 600, background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer" }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
