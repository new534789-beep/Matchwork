"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Bouton } from "@/components/ui/bouton";
import { Carte } from "@/components/ui/carte";
import type { FiliereClassee, Etiquette } from "@/lib/orientation/classement";
import { resumer } from "@/lib/orientation/classement";
import { PLATEFORME_OFFICIELLE } from "@/lib/orientation/donnees";
import { initialesUniversite, logoUniversite } from "@/lib/orientation/logos";
import { mentionPour, pointsVersMentionSuivante } from "@/lib/orientation/mention";

const LIBELLE_ETIQUETTE: Record<Etiquette, string> = {
  interet: "Correspond à tes centres d'intérêt",
  zone: "Dans ta zone",
  "bourses-larges": "Quota de bourses large",
  "debouches-nombreux": "Débouchés nombreux",
  concours: "Sur concours",
  "regle-incertaine": "Règle de calcul incertaine",
};

function Etiquettes({ valeurs }: { valeurs: Etiquette[] }) {
  if (!valeurs.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {valeurs.map((e) => (
        <span
          key={e}
          className="text-[11px] px-2 py-0.5 rounded-full"
          style={{
            background:
              e === "regle-incertaine" || e === "concours"
                ? "rgba(234,179,8,0.12)"
                : "rgba(124,58,237,0.10)",
            color:
              e === "regle-incertaine" || e === "concours" ? "#a16207" : "var(--purple)",
            border: "1px solid var(--border)",
          }}
        >
          {LIBELLE_ETIQUETTE[e]}
        </span>
      ))}
    </div>
  );
}

/** Position de la moyenne sur l'échelle 0-20, avec les seuils de mention. */
function Barre({ moyenne }: { moyenne: number }) {
  const pct = Math.max(0, Math.min(100, (moyenne / 20) * 100));
  const seuils = [
    { v: 10, label: "Passable" },
    { v: 12, label: "Assez bien" },
    { v: 14, label: "Bien" },
    { v: 16, label: "Très bien" },
  ];
  return (
    <div className="mt-3">
      <div
        className="relative h-2 rounded-full"
        style={{ background: "var(--border-strong)", opacity: 0.9 }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#5b21b6)" }}
        />
        {seuils.map((s) => (
          <span
            key={s.v}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${(s.v / 20) * 100}%`, background: "var(--bg)" , opacity: 0.8 }}
            title={`${s.label} — ${s.v}/20`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--text-4)" }}>
        <span>0</span>
        {seuils.map((s) => (
          <span key={s.v}>{s.label}</span>
        ))}
        <span>20</span>
      </div>
    </div>
  );
}

/**
 * Logo de l'université, ou ses initiales à défaut. Le fond blanc et la
 * bordure isolent les couleurs du logo du reste de la carte.
 */
function LogoUniversite({ universite }: { universite: string }) {
  const src = logoUniversite(universite);
  const taille = 38;

  if (!src) {
    return (
      <span
        className="shrink-0 grid place-items-center rounded-xl text-xs font-bold"
        style={{
          width: taille,
          height: taille,
          background: "rgba(124,58,237,0.10)",
          color: "var(--purple)",
        }}
        aria-hidden
      >
        {initialesUniversite(universite)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={taille}
      height={taille}
      // Fichiers déjà servis en WebP 128px : inutile de repasser par
      // l'optimiseur pour les afficher à 38px.
      unoptimized
      className="shrink-0 rounded-xl object-contain"
      style={{
        width: taille,
        height: taille,
        padding: 3,
        background: "#fff",
        border: "1px solid var(--border)",
      }}
    />
  );
}

function CarteFiliere({ item }: { item: FiliereClassee }) {
  const [ouvert, setOuvert] = useState(false);
  const { filiere: f, resultat: r } = item;
  const calcule = r.statut === "calcule";

  return (
    <Carte className="transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <LogoUniversite universite={f.universite} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {item.rang !== null && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                  style={{ background: "rgba(124,58,237,0.12)", color: "var(--purple)" }}
                >
                  {item.rang}
                </span>
              )}
              <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                {f.filiere}
              </h3>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
              {f.etablissement}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-4)" }}>
              {f.universite}
            </p>
          </div>
        </div>

        {calcule && (
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold leading-none" style={{ color: "var(--purple)" }}>
              {r.moyenne.toFixed(2)}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--text-4)" }}>
              sur 20
            </div>
          </div>
        )}
      </div>

      {calcule && <Barre moyenne={r.moyenne} />}

      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs" style={{ color: "var(--text-2)" }}>
        <span>
          Bourses <strong style={{ color: "var(--text)" }}>{f.quotaBourse ?? "—"}</strong>
        </span>
        <span>
          Aide / partiellement payant{" "}
          <strong style={{ color: "var(--text)" }}>{f.quotaAideFpp ?? "—"}</strong>
        </span>
        <span style={{ color: "var(--text-3)" }}>
          {f.modeEntree === "concours"
            ? "Concours"
            : f.modeEntree === "classement"
              ? "Classement"
              : "Mode non précisé"}
        </span>
      </div>

      <Etiquettes valeurs={item.etiquettes} />

      {!calcule && (
        <p
          className="mt-3 text-xs rounded-xl px-3 py-2"
          style={{ background: "rgba(234,179,8,0.08)", color: "var(--text-2)" }}
        >
          {r.raison}
        </p>
      )}

      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        className="mt-3 text-xs font-medium"
        style={{ color: "var(--purple)" }}
      >
        {ouvert ? "Masquer le détail" : "Voir le détail"}
      </button>

      {ouvert && (
        <div className="mt-3 space-y-3">
          {calcule && (
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "var(--text-4)" }}>
                Calcul
              </p>
              <p
                className="text-xs font-mono rounded-xl px-3 py-2"
                style={{ background: "var(--input-bg)", color: "var(--text-2)" }}
              >
                {r.formule}
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: "var(--text-4)" }}>
                Notes et coefficients lus sur ta photo de relevé.
              </p>
            </div>
          )}
          {f.debouches.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "var(--text-4)" }}>
                Débouchés
              </p>
              <ul className="text-xs space-y-0.5" style={{ color: "var(--text-2)" }}>
                {f.debouches.map((d, i) => (
                  <li key={i}>— {d}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
            Guide MESRS, page {f.source.page} · séries acceptées : {f.series.join(", ")}
          </p>
        </div>
      )}
    </Carte>
  );
}

function Profil({ moyenneGenerale }: { moyenneGenerale: number }) {
  const mention = mentionPour(moyenneGenerale);
  const suivante = pointsVersMentionSuivante(moyenneGenerale);
  return (
    <Carte>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-4)" }}>
            Moyenne générale au bac
          </p>
          <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--text)" }}>
            {moyenneGenerale.toFixed(2)}
            <span className="text-sm font-normal" style={{ color: "var(--text-3)" }}>
              {" "}/ 20
            </span>
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(124,58,237,0.12)", color: "var(--purple)" }}
        >
          Mention {mention}
        </span>
      </div>
      {suivante && (
        <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
          Il te manquait {suivante.ecart.toFixed(2)} point
          {suivante.ecart > 1 ? "s" : ""} pour la mention {suivante.mention}.
        </p>
      )}
      <p className="text-[11px] mt-2" style={{ color: "var(--text-4)" }}>
        Lue sur ton relevé. Elle ne sert pas au classement — celui-ci utilise
        uniquement les trois matières retenues par filière.
      </p>
    </Carte>
  );
}

/**
 * Commentaire rédigé par le modèle. Absent en cas de doute : tout chiffre
 * non vérifiable fait écarter le texte côté serveur, et la page se lit
 * parfaitement sans lui.
 */
function Explication({ texte, chargement }: { texte: string | null; chargement: boolean }) {
  if (chargement) {
    return (
      <Carte>
        <div className="flex items-center gap-2.5">
          <svg className="h-4 w-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--purple)">
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
            <path className="opacity-75" fill="var(--purple)" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm" style={{ color: "var(--text-3)" }}>
            Lecture de tes résultats…
          </span>
        </div>
      </Carte>
    );
  }
  if (!texte) return null;
  return (
    <Carte>
      <p className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "var(--text-4)" }}>
        Ce que disent tes résultats
      </p>
      <div className="text-sm space-y-2" style={{ color: "var(--text-2)" }}>
        {texte
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </div>
    </Carte>
  );
}

export function Resultats({
  nom,
  classees,
  moyenneGenerale,
  explication,
  explicationEnCours,
  onTelechargerPdf,
  onRecommencer,
}: {
  nom?: string | null;
  classees: FiliereClassee[];
  moyenneGenerale?: number;
  explication?: string | null;
  explicationEnCours?: boolean;
  onTelechargerPdf?: () => Promise<void>;
  onRecommencer: () => void;
}) {
  const [pdfEnCours, setPdfEnCours] = useState(false);
  const [pdfErreur, setPdfErreur] = useState<string | null>(null);
  const synthese = useMemo(() => resumer(classees), [classees]);
  // Certaines séries techniques n'ont aucune filière calculable ; ouvrir sur
  // l'onglet « Avec moyenne » afficherait alors une liste vide.
  const [filtre, setFiltre] = useState<"toutes" | "calculees" | "autres">(
    synthese.calculees > 0 ? "calculees" : "toutes",
  );

  const visibles = classees.filter((c) =>
    filtre === "toutes"
      ? true
      : filtre === "calculees"
        ? c.resultat.statut === "calcule"
        : c.resultat.statut !== "calcule",
  );

  const onglets: { cle: typeof filtre; label: string; n: number }[] = [
    { cle: "calculees", label: "Avec moyenne", n: synthese.calculees },
    { cle: "autres", label: "Sans moyenne", n: synthese.total - synthese.calculees },
    { cle: "toutes", label: "Toutes", n: synthese.total },
  ];

  return (
    <div className="space-y-4">
      {moyenneGenerale !== undefined && <Profil moyenneGenerale={moyenneGenerale} />}

      <Carte>
        <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
          {nom ? `Résultats de ${nom}` : "Tes résultats"}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          {synthese.total} filières te sont ouvertes.{" "}
          {synthese.calculees === 0 ? (
            <>
              Aucune n&apos;a de moyenne de classement : pour ta série, le guide ne donne
              que des filières sur concours ou sans règle de calcul précise. La liste
              ci-dessous reste utile — chaque fiche indique pourquoi
            </>
          ) : (
            <>
              {synthese.calculees} ont une moyenne de classement calculable, de{" "}
              <strong style={{ color: "var(--text)" }}>
                {synthese.meilleureMoyenne?.toFixed(2)}
              </strong>{" "}
              à{" "}
              <strong style={{ color: "var(--text)" }}>
                {synthese.moyenneLaPlusBasse?.toFixed(2)}
              </strong>
            </>
          )}
          .
        </p>
        {synthese.calculees > 0 && (
          <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
            Ta moyenne change d&apos;une filière à l&apos;autre parce que le guide
            n&apos;y retient pas les mêmes matières. C&apos;est normal, et c&apos;est la
            règle officielle.
          </p>
        )}
      </Carte>

      <Explication texte={explication ?? null} chargement={explicationEnCours ?? false} />

      <div className="flex gap-1.5">
        {onglets.map((o) => (
          <button
            key={o.cle}
            type="button"
            onClick={() => setFiltre(o.cle)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filtre === o.cle ? "rgba(124,58,237,0.12)" : "var(--bg-card)",
              color: filtre === o.cle ? "var(--purple)" : "var(--text-3)",
              border: `1px solid ${filtre === o.cle ? "var(--purple)" : "var(--border)"}`,
            }}
          >
            {o.label} ({o.n})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visibles.map((c) => (
          <CarteFiliere key={c.filiere.id} item={c} />
        ))}
      </div>

      <Carte>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Simulation non officielle, calculée à partir du guide du MESRS. Les choix se
          font sur{" "}
          <a
            href={PLATEFORME_OFFICIELLE}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--purple)" }}
          >
            apresmonbac.bj
          </a>
          , seul site officiel.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {onTelechargerPdf && (
            <Bouton
              taille="sm"
              chargement={pdfEnCours}
              onClick={async () => {
                setPdfEnCours(true);
                setPdfErreur(null);
                try {
                  await onTelechargerPdf();
                } catch {
                  setPdfErreur("Le téléchargement a échoué. Réessaie.");
                } finally {
                  setPdfEnCours(false);
                }
              }}
            >
              <svg
                className="mr-1.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger mon plan
            </Bouton>
          )}
          <Bouton variante="secondaire" taille="sm" onClick={onRecommencer}>
            Recommencer
          </Bouton>
        </div>
        {pdfErreur && (
          <p className="text-xs mt-2" style={{ color: "#b91c1c" }}>
            {pdfErreur}
          </p>
        )}
        <p className="text-[11px] mt-2.5" style={{ color: "var(--text-4)" }}>
          Le PDF reprend ton relevé et toutes tes filières. Tu peux l&apos;imprimer, le
          partager, ou le rouvrir sans connexion.
        </p>
      </Carte>
    </div>
  );
}
