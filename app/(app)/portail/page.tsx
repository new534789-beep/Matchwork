"use client";

import { useState, useEffect } from "react";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { Carte } from "@/components/ui/carte";

type Organisme = { id: string; nom: string; type: string; pays: string | null; siteWeb: string | null; verifie: boolean };
type OppItem = { id: string; type: string; intitule: string; statut: string; dateLimite: string | null; createdAt: string; _count: { interactions: number; dossiers: number } };

export default function Portail() {
  const [organisme, setOrganisme] = useState<Organisme | null>(null);
  const [opps, setOpps] = useState<OppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"dash" | "inscription" | "nouvelle">("dash");

  // Form inscription
  const [formOrg, setFormOrg] = useState({ nom: "", type: "universite" as string, pays: "", siteWeb: "" });
  const [erreurOrg, setErreurOrg] = useState("");

  // Form nouvelle offre
  const [formOpp, setFormOpp] = useState({ type: "BOURSE", intitule: "", description: "", conditions: "", dateLimite: "", lien: "" });
  const [erreurOpp, setErreurOpp] = useState("");
  const [succes, setSucces] = useState("");

  useEffect(() => {
    fetch("/api/organisme")
      .then(async (r) => {
        if (r.ok) {
          setOrganisme(await r.json());
          const oppsRes = await fetch("/api/organisme/opportunites");
          if (oppsRes.ok) setOpps((await oppsRes.json()).opportunites || []);
        } else {
          setMode("inscription");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const inscrire = async () => {
    setErreurOrg("");
    const res = await fetch("/api/organisme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formOrg),
    });
    const data = await res.json();
    if (res.ok) {
      setOrganisme(data);
      setMode("dash");
    } else {
      setErreurOrg(data.erreur || "Erreur");
    }
  };

  const publier = async () => {
    setErreurOpp("");
    setSucces("");
    const res = await fetch("/api/organisme/opportunites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formOpp),
    });
    const data = await res.json();
    if (res.ok) {
      setOpps((prev) => [{ ...data, _count: { interactions: 0, dossiers: 0 } }, ...prev]);
      setFormOpp({ type: "BOURSE", intitule: "", description: "", conditions: "", dateLimite: "", lien: "" });
      setSucces(organisme?.verifie ? "Offre publiée !" : "Offre soumise — en attente de validation par l'équipe Matchwork.");
      setMode("dash");
    } else {
      setErreurOpp(data.erreur || "Erreur");
    }
  };

  if (loading) {
    return (
      <>
        <EnteteApp titre="Portail organismes" />
        <main className="flex-1 flex items-center justify-center"><p style={{ color: "var(--text-2)" }}>Chargement...</p></main>
      </>
    );
  }

  // Inscription organisme
  if (mode === "inscription") {
    return (
      <>
        <EnteteApp titre="Portail organismes" />
        <main className="flex-1 px-4 sm:px-6 py-8 max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Inscrivez votre organisme</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
            Universités, ONG, entreprises — publiez vos offres directement sur Matchwork.
          </p>
          <Carte>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Nom de l&apos;organisme *</span>
                <input value={formOrg.nom} onChange={(e) => setFormOrg({ ...formOrg, nom: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Type *</span>
                <select value={formOrg.type} onChange={(e) => setFormOrg({ ...formOrg, type: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }}>
                  <option value="universite">Université / École</option>
                  <option value="ong">ONG / Fondation</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="gouvernement">Institution gouvernementale</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Pays</span>
                <input value={formOrg.pays} onChange={(e) => setFormOrg({ ...formOrg, pays: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Site web</span>
                <input value={formOrg.siteWeb} onChange={(e) => setFormOrg({ ...formOrg, siteWeb: e.target.value })} placeholder="https://..."
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }} />
              </label>
              {erreurOrg && <p style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: 600 }}>{erreurOrg}</p>}
              <button onClick={inscrire} style={{
                padding: "12px", borderRadius: 11, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff",
                fontWeight: 600, fontSize: "0.85rem",
              }}>
                Créer mon espace organisme
              </button>
            </div>
          </Carte>
        </main>
      </>
    );
  }

  // Nouvelle offre
  if (mode === "nouvelle") {
    return (
      <>
        <EnteteApp titre="Nouvelle offre" />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-lg mx-auto w-full">
          <button onClick={() => setMode("dash")} style={{ color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>
            &larr; Retour au tableau de bord
          </button>
          <Carte>
            <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Publier une opportunité</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Type *</span>
                <select value={formOpp.type} onChange={(e) => setFormOpp({ ...formOpp, type: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }}>
                  {["BOURSE", "EMPLOI", "STAGE", "FORMATION", "ADMISSION", "RECOMPENSE", "APPEL_PROJET"].map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Intitulé *</span>
                <input value={formOpp.intitule} onChange={(e) => setFormOpp({ ...formOpp, intitule: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Description *</span>
                <textarea value={formOpp.description} onChange={(e) => setFormOpp({ ...formOpp, description: e.target.value })} rows={5}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem", resize: "vertical" }} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Conditions d&apos;éligibilité</span>
                <textarea value={formOpp.conditions} onChange={(e) => setFormOpp({ ...formOpp, conditions: e.target.value })} rows={3}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem", resize: "vertical" }} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Date limite</span>
                  <input type="date" value={formOpp.dateLimite} onChange={(e) => setFormOpp({ ...formOpp, dateLimite: e.target.value })}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Lien</span>
                  <input value={formOpp.lien} onChange={(e) => setFormOpp({ ...formOpp, lien: e.target.value })} placeholder="https://..."
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: "0.85rem" }} />
                </label>
              </div>
              {erreurOpp && <p style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: 600 }}>{erreurOpp}</p>}
              <button onClick={publier} style={{
                padding: "12px", borderRadius: 11, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff",
                fontWeight: 600, fontSize: "0.85rem",
              }}>
                {organisme?.verifie ? "Publier" : "Soumettre à validation"}
              </button>
            </div>
          </Carte>
        </main>
      </>
    );
  }

  // Tableau de bord organisme
  return (
    <>
      <EnteteApp titre="Portail organismes" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>{organisme?.nom}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                {organisme?.type === "universite" ? "Université" : organisme?.type === "ong" ? "ONG" : organisme?.type === "entreprise" ? "Entreprise" : "Institution"}
              </span>
              {organisme?.verifie ? (
                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(5,150,105,0.1)", color: "#059669" }}>Vérifié</span>
              ) : (
                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(217,119,6,0.1)", color: "#d97706" }}>En attente de vérification</span>
              )}
            </div>
          </div>
          <button onClick={() => setMode("nouvelle")} style={{
            padding: "10px 18px", borderRadius: 11, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff",
            fontWeight: 600, fontSize: "0.82rem",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nouvelle offre
          </button>
        </div>

        {succes && (
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", marginBottom: 16 }}>
            <p style={{ color: "#059669", fontSize: "0.82rem", fontWeight: 600 }}>{succes}</p>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Offres publiées", valeur: opps.filter((o) => o.statut === "publiee").length },
            { label: "Candidats intéressés", valeur: opps.reduce((s, o) => s + o._count.interactions, 0) },
            { label: "Dossiers reçus", valeur: opps.reduce((s, o) => s + o._count.dossiers, 0) },
          ].map((s) => (
            <Carte key={s.label}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#7c3aed" }}>{s.valeur}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>{s.label}</p>
            </Carte>
          ))}
        </div>

        {/* Liste des offres */}
        <Carte>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Mes offres</h2>
          {opps.length === 0 ? (
            <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>Aucune offre publiée. Cliquez sur &quot;Nouvelle offre&quot; pour commencer.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {opps.map((o) => (
                <div key={o.id} style={{
                  padding: "14px 16px", borderRadius: 12,
                  border: "1px solid var(--border)", background: "var(--bg)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{o.intitule}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{
                        fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: o.statut === "publiee" ? "rgba(5,150,105,0.1)" : o.statut === "a_valider" ? "rgba(217,119,6,0.1)" : "rgba(100,100,100,0.1)",
                        color: o.statut === "publiee" ? "#059669" : o.statut === "a_valider" ? "#d97706" : "var(--text-3)",
                      }}>
                        {o.statut === "publiee" ? "Publiée" : o.statut === "a_valider" ? "En validation" : o.statut}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
                        {o._count.interactions} intéressés · {o._count.dossiers} dossiers
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)", flexShrink: 0 }}>
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Carte>
      </main>
    </>
  );
}
