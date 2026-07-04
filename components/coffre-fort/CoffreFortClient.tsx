"use client";

import { useState, useRef } from "react";
import { Carte } from "@/components/ui/carte";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTaille } from "@/lib/utils";

const TYPES_DOC = [
  { valeur: "DIPLOME", libelle: "Diplôme / Attestation" },
  { valeur: "RELEVE_NOTES", libelle: "Relevé de notes" },
  { valeur: "ACTE_NAISSANCE", libelle: "Acte de naissance" },
  { valeur: "PIECE_IDENTITE", libelle: "Pièce d'identité" },
  { valeur: "JUSTIFICATIF_LANGUE", libelle: "Justificatif de langue (DELF, IELTS…)" },
  { valeur: "LETTRE_RECO", libelle: "Lettre de recommandation" },
  { valeur: "AUTRE", libelle: "Autre document" },
];

interface Document {
  id: string;
  type: string;
  nomFichier: string;
  taille: number | null;
  infosExtraites: unknown;
  extraitParIa: boolean;
  createdAt: Date | string;
}

interface Props {
  documentsInitiaux: Document[];
}

const selectStyle: React.CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--text)",
};

export function CoffreFortClient({ documentsInitiaux }: Props) {
  const [documents, setDocuments] = useState<Document[]>(documentsInitiaux);
  const [typeSel, setTypeSel] = useState("DIPLOME");
  const [uploading, setUploading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [docDetail, setDocDetail] = useState<Document | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setUploading(true);
    setErreur("");
    setSucces("");

    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("type", typeSel);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setErreur(data.erreur ?? "Erreur lors de l'upload."); return; }
      setDocuments((prev) => [data, ...prev]);
      setSucces(`"${fichier.name}" déposé avec succès. L'IA extrait les informations…`);
      setTimeout(() => setSucces(""), 5000);

      setTimeout(async () => {
        const liste = await fetch("/api/documents");
        if (liste.ok) { const maj = await liste.json(); setDocuments(maj); }
      }, 6000);
    } catch {
      setErreur("Impossible d'uploader le fichier. Réessayez.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function supprimer(id: string) {
    if (!confirm("Supprimer ce document définitivement ?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (docDetail?.id === id) setDocDetail(null);
    }
  }

  const parType = TYPES_DOC.reduce<Record<string, Document[]>>((acc, t) => {
    acc[t.valeur] = documents.filter((d) => d.type === t.valeur);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-5 pb-8 items-start">
      <div className="space-y-5">
      {/* Zone d'upload */}
      <Carte>
        <p className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>
          Ajouter un document
        </p>

        <div className="mb-3">
          <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-2)" }}>
            Type de document
          </label>
          <select
            value={typeSel}
            onChange={(e) => setTypeSel(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={selectStyle}
          >
            {TYPES_DOC.map((t) => (
              <option key={t.valeur} value={t.valeur}>{t.libelle}</option>
            ))}
          </select>
        </div>

        <div
          className="rounded-xl p-6 text-center cursor-pointer transition-colors"
          style={{
            border: "2px dashed rgba(124,58,237,0.3)",
            background: "rgba(124,58,237,0.05)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.border = "2px dashed rgba(124,58,237,0.6)";
            (e.currentTarget as HTMLDivElement).style.background = "rgba(124,58,237,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.border = "2px dashed rgba(124,58,237,0.3)";
            (e.currentTarget as HTMLDivElement).style.background = "rgba(124,58,237,0.05)";
          }}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(124,58,237,0.2)" }}>
            <svg className="w-5 h-5" style={{ color: "#a78bfa" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            Appuyez pour sélectionner un fichier
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
            PDF, JPEG ou PNG · Max 10 Mo
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: "#a78bfa" }}>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Chiffrement et upload en cours…
          </div>
        )}
        {succes && (
          <div className="mt-3 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#16a34a" }}>
            {succes}
          </div>
        )}
        {erreur && (
          <div className="mt-3 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#dc2626" }}>
            {erreur}
          </div>
        )}
      </Carte>

      {/* Confidentialité */}
      <div className="rounded-xl px-4 py-3 flex gap-3 items-start" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#a78bfa" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: "var(--purple-light)" }}>
          Vos documents sont chiffrés (AES-256) et accessibles uniquement par vous.
          Seules les informations utiles aux candidatures sont conservées.
        </p>
      </div>
      </div>

      <div>
      {/* Liste par type */}
      {documents.length === 0 ? (
        <Carte className="text-center py-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <svg className="w-6 h-6" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>Aucun document déposé</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>Commencez par déposer votre diplôme</p>
        </Carte>
      ) : (
        <div className="space-y-4">
          {TYPES_DOC.filter((t) => parType[t.valeur].length > 0).map((t) => (
            <div key={t.valeur}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-2)" }}>
                {t.libelle} ({parType[t.valeur].length})
              </p>
              <div className="space-y-2">
                {parType[t.valeur].map((doc) => (
                  <Carte key={doc.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                            {doc.nomFichier}
                          </p>
                          {doc.extraitParIa ? (
                            <Badge couleur="vert">Extrait par l&apos;IA</Badge>
                          ) : (
                            <Badge couleur="orange">En cours…</Badge>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                          {doc.taille ? formatTaille(doc.taille) : ""} · Déposé le {formatDate(doc.createdAt)}
                        </p>
                        {doc.extraitParIa && Boolean(doc.infosExtraites) && (
                          <button
                            onClick={() => setDocDetail(docDetail?.id === doc.id ? null : doc)}
                            className="text-xs mt-1 hover:underline"
                            style={{ color: "#a78bfa" }}
                          >
                            {docDetail?.id === doc.id ? "Masquer les infos" : "Voir les infos extraites"}
                          </button>
                        )}
                        {docDetail?.id === doc.id && Boolean(doc.infosExtraites) && (
                          <pre
                            className="mt-2 text-xs rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap"
                            style={{ background: "var(--bg-card)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                          >
                            {JSON.stringify(doc.infosExtraites as Record<string, unknown>, null, 2)}
                          </pre>
                        )}
                      </div>
                      <button
                        onClick={() => supprimer(doc.id)}
                        className="transition-colors flex-shrink-0 p-1"
                        style={{ color: "var(--text-3)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)")}
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </Carte>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
