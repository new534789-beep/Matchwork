"use client";

import { useMemo, useRef, useState } from "react";

import { Bouton } from "@/components/ui/bouton";
import { Carte } from "@/components/ui/carte";
import { classer, type FiliereClassee } from "@/lib/orientation/classement";
import type { LigneExtraite, ReleveExtrait } from "@/lib/orientation/extraction-releve";
import {
  DIPLOMES,
  INTERETS,
  PRIORITES,
  seriesPourDiplome,
  zonesDisponibles,
  type Diplome,
  type Interet,
  type Priorite,
} from "@/lib/orientation/questionnaire";
import type { Serie } from "@/lib/orientation/types";

import { GrilleChoix, Progression } from "./Cartes";
import { Resultats } from "./Resultats";

/** Une ligne du relevé effectivement lue, note et coefficient compris. */
type LigneReleve = {
  matiere: string;
  note: number;
  coefficient: number;
  epreuveEcrite?: boolean;
};

const ETAPES = ["Diplôme", "Série", "Intérêts", "Priorité", "Zone", "Relevé"] as const;

export function ParcoursOrientation({ nom }: { nom: string | null }) {
  const [etape, setEtape] = useState(0);
  const [diplome, setDiplome] = useState<Diplome | null>(null);
  const [serie, setSerie] = useState<Serie | null>(null);
  const [interets, setInterets] = useState<Interet[]>([]);
  const [priorite, setPriorite] = useState<Priorite | null>(null);
  const [zone, setZone] = useState<string | null>(null);

  const [lecture, setLecture] = useState<"attente" | "encours" | "erreur">("attente");
  const [erreur, setErreur] = useState<string | null>(null);
  const [classees, setClassees] = useState<FiliereClassee[] | null>(null);
  const [moyenneGenerale, setMoyenneGenerale] = useState<number | undefined>();
  const [avertissements, setAvertissements] = useState<string[]>([]);
  const [explication, setExplication] = useState<string | null>(null);
  const [explicationEnCours, setExplicationEnCours] = useState(false);
  const [notesLues, setNotesLues] = useState<LigneReleve[]>([]);
  const inputPhoto = useRef<HTMLInputElement>(null);

  const series = useMemo(() => (diplome ? seriesPourDiplome(diplome) : []), [diplome]);
  const zones = useMemo(() => zonesDisponibles(), []);

  function reinitialiser() {
    setEtape(0);
    setDiplome(null);
    setSerie(null);
    setInterets([]);
    setPriorite(null);
    setZone(null);
    setClassees(null);
    setMoyenneGenerale(undefined);
    setAvertissements([]);
    setExplication(null);
    setExplicationEnCours(false);
    setNotesLues([]);
    setErreur(null);
    setLecture("attente");
  }

  /**
   * Demande le commentaire des résultats. On envoie le relevé, pas les
   * moyennes : le serveur recalcule tout, donc rien de fabriqué côté client
   * ne peut être commenté. Un échec est silencieux — la page se lit sans.
   */
  async function demanderExplication(
    lignes: LigneReleve[],
    moyenne: number | null,
  ) {
    if (!serie || !diplome || !priorite || !zone) return;
    setExplicationEnCours(true);
    try {
      const rep = await fetch("/api/orientation/expliquer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serie,
          moyenneGenerale: moyenne,
          lignes,
          diplome,
          interets,
          priorite,
          zone,
        }),
      });
      const donnees = (await rep.json()) as { explication?: string | null };
      setExplication(donnees.explication ?? null);
    } catch {
      setExplication(null);
    } finally {
      setExplicationEnCours(false);
    }
  }

  async function envoyerPhoto(fichier: File) {
    if (!serie || !diplome || !priorite || !zone) return;
    setLecture("encours");
    setErreur(null);

    const corps = new FormData();
    corps.append("photo", fichier);
    corps.append("serie", serie);

    try {
      const rep = await fetch("/api/orientation/lire-releve", {
        method: "POST",
        body: corps,
      });
      const donnees = (await rep.json()) as ReleveExtrait & { erreur?: string };
      if (!rep.ok) {
        setErreur(donnees.erreur ?? "La lecture a échoué.");
        setLecture("erreur");
        return;
      }

      // On ne calcule qu'avec ce qui a été lu entièrement : une ligne dont la
      // note ou le coefficient manque est écartée plutôt que complétée.
      const completes = donnees.lignes.filter(
        (l): l is LigneExtraite & { note: number; coefficient: number } =>
          l.note !== null && l.coefficient !== null,
      );
      if (!completes.length) {
        setErreur(
          "Aucune note n'a pu être lue sur cette photo. Reprends-la de plus près, bien à plat et sans reflet.",
        );
        setLecture("erreur");
        return;
      }

      const lignes = completes.map((l) => ({
        matiere: l.matiere,
        note: l.note,
        coefficient: l.coefficient,
        epreuveEcrite: l.epreuveEcrite,
      }));

      setNotesLues(lignes);
      setAvertissements(donnees.avertissements);
      setMoyenneGenerale(donnees.moyenneGenerale ?? undefined);
      setClassees(
        classer(
          { serie, moyenneGenerale: donnees.moyenneGenerale ?? undefined, lignes },
          { diplome, serie, interets, priorite, zone },
        ),
      );
      setLecture("attente");
      // Les résultats s'affichent tout de suite ; le commentaire arrive après.
      void demanderExplication(lignes, donnees.moyenneGenerale ?? null);
    } catch {
      setErreur("Connexion interrompue. Réessaie.");
      setLecture("erreur");
    }
  }

  /**
   * Télécharge le plan en PDF. On renvoie le relevé, pas les moyennes : le
   * serveur reconstruit le classement lui-même.
   */
  async function telechargerPdf() {
    if (!serie || !diplome || !priorite || !zone) return;
    const rep = await fetch("/api/orientation/plan-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serie,
        moyenneGenerale: moyenneGenerale ?? null,
        lignes: notesLues,
        diplome,
        interets,
        priorite,
        zone,
        explication,
      }),
    });
    if (!rep.ok) throw new Error("generation impossible");

    const blob = await rep.blob();
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `plan-orientation-serie-${serie}.pdf`;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    URL.revokeObjectURL(url);
  }

  if (classees) {
    return (
      <div className="space-y-4">
        {avertissements.length > 0 && (
          <Carte>
            <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--text)" }}>
              À savoir sur la lecture de ta photo
            </p>
            <ul className="text-xs space-y-0.5" style={{ color: "var(--text-2)" }}>
              {avertissements.map((a, i) => (
                <li key={i}>— {a}</li>
              ))}
            </ul>
          </Carte>
        )}
        <Resultats
          nom={nom}
          classees={classees}
          moyenneGenerale={moyenneGenerale}
          explication={explication}
          explicationEnCours={explicationEnCours}
          onTelechargerPdf={telechargerPdf}
          onRecommencer={reinitialiser}
        />
      </div>
    );
  }

  // Les relevés DT et DEAT ne sont pas encore publiés : on l'annonce au lieu
  // de laisser le candidat aller jusqu'à la photo pour rien.
  const enAttenteDeReleves = diplome === "dt" || diplome === "deat";

  const peutAvancer =
    (etape === 0 && diplome && !enAttenteDeReleves) ||
    (etape === 1 && serie) ||
    etape === 2 ||
    (etape === 3 && priorite) ||
    (etape === 4 && zone);

  return (
    <div className="space-y-4">
      <Progression etape={etape + 1} total={ETAPES.length} />

      <Carte>
        <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
          Étape {etape + 1} sur {ETAPES.length}
        </p>

        {etape === 0 && (
          <>
            <h2 className="text-base font-semibold mt-1 mb-4" style={{ color: "var(--text)" }}>
              Quel diplôme as-tu obtenu ?
            </h2>
            <GrilleChoix
              options={DIPLOMES}
              valeurs={diplome ? [diplome] : []}
              colonnes={1}
              onChoisir={(v) => {
                setDiplome(v);
                setSerie(null);
              }}
            />

            {enAttenteDeReleves && (
              <div
                className="mt-4 rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(234,179,8,0.10)",
                  border: "1px solid rgba(234,179,8,0.28)",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Les relevés {diplome === "dt" ? "DT" : "DEAT"} ne sont pas encore sortis
                </p>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>
                  Le calcul se fait à partir des notes et des coefficients de ton relevé.
                  Reviens dès que le tien sera disponible — tout est déjà prêt pour ta
                  série.
                </p>
              </div>
            )}
          </>
        )}

        {etape === 1 && (
          <>
            <h2 className="text-base font-semibold mt-1 mb-4" style={{ color: "var(--text)" }}>
              Quelle série exactement ?
            </h2>
            <GrilleChoix
              options={series}
              valeurs={serie ? [serie] : []}
              onChoisir={setSerie}
            />
          </>
        )}

        {etape === 2 && (
          <>
            <h2 className="text-base font-semibold mt-1 mb-1" style={{ color: "var(--text)" }}>
              Qu&apos;est-ce qui t&apos;intéresse ?
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
              Plusieurs réponses possibles. Ça ne masque aucune filière : ça sert
              seulement à repérer celles qui te parlent.
            </p>
            <GrilleChoix
              options={INTERETS}
              valeurs={interets}
              multiple
              colonnes={2}
              onChoisir={(v) =>
                setInterets((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]))
              }
            />
          </>
        )}

        {etape === 3 && (
          <>
            <h2 className="text-base font-semibold mt-1 mb-4" style={{ color: "var(--text)" }}>
              Qu&apos;est-ce qui compte le plus pour toi ?
            </h2>
            <GrilleChoix
              options={PRIORITES}
              valeurs={priorite ? [priorite] : []}
              colonnes={1}
              onChoisir={setPriorite}
            />
          </>
        )}

        {etape === 4 && (
          <>
            <h2 className="text-base font-semibold mt-1 mb-4" style={{ color: "var(--text)" }}>
              Où souhaites-tu étudier ?
            </h2>
            <GrilleChoix
              options={zones}
              valeurs={zone ? [zone] : []}
              colonnes={1}
              onChoisir={setZone}
            />
          </>
        )}

        {etape === 5 && (
          <>
            <h2 className="text-base font-semibold mt-1 mb-1" style={{ color: "var(--text)" }}>
              Photographie ton relevé de notes
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
              On y lit tes notes et tes coefficients. Rien à saisir. Pose le relevé à plat,
              bien éclairé, et cadre le tableau des notes.
            </p>

            <input
              ref={inputPhoto}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void envoyerPhoto(f);
              }}
            />

            <button
              type="button"
              disabled={lecture === "encours"}
              onClick={() => inputPhoto.current?.click()}
              className="w-full rounded-2xl p-8 transition-all active:scale-[0.99] disabled:opacity-60"
              style={{
                background: "var(--input-bg)",
                border: "1.5px dashed var(--border-strong)",
              }}
            >
              {lecture === "encours" ? (
                <span className="flex flex-col items-center gap-2">
                  <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="var(--purple)">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" fill="var(--purple)" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>
                    Lecture de ton relevé…
                  </span>
                </span>
              ) : (
                <span className="flex flex-col items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Prendre ou choisir une photo
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-4)" }}>
                    JPEG, PNG ou WEBP — 8 Mo maximum
                  </span>
                </span>
              )}
            </button>

            {erreur && (
              <p
                className="mt-3 text-xs rounded-xl px-3 py-2"
                style={{ background: "rgba(239,68,68,0.10)", color: "#b91c1c" }}
              >
                {erreur}
              </p>
            )}
          </>
        )}
      </Carte>

      <div className="flex items-center justify-between gap-3">
        <Bouton
          variante="secondaire"
          onClick={() => setEtape((e) => Math.max(0, e - 1))}
          disabled={etape === 0 || lecture === "encours"}
        >
          Retour
        </Bouton>
        {etape < ETAPES.length - 1 && (
          <Bouton onClick={() => setEtape((e) => e + 1)} disabled={!peutAvancer}>
            Continuer
          </Bouton>
        )}
      </div>
    </div>
  );
}
