"use client";

import { useState } from "react";
import { Bouton } from "@/components/ui/bouton";
import { ChampTexte, ChampTextarea, ChampSelect } from "@/components/ui/champ";
import { Carte, CarteTitre, CarteEntete } from "@/components/ui/carte";
import { Badge } from "@/components/ui/badge";
import type { Profil } from "@prisma/client";

interface Formation {
  etablissement: string;
  diplome: string;
  annee: string;
  note?: string;
  domaine?: string;
}

interface Experience {
  poste: string;
  organisation: string;
  dateDebut: string;
  dateFin?: string;
  description?: string;
}

interface Langue {
  langue: string;
  niveau: string;
}

const NIVEAUX_LANGUE = [
  { valeur: "", libelle: "Sélectionner…" },
  { valeur: "natif", libelle: "Natif / Langue maternelle" },
  { valeur: "C2", libelle: "C2 — Maîtrise" },
  { valeur: "C1", libelle: "C1 — Autonome avancé" },
  { valeur: "B2", libelle: "B2 — Indépendant avancé" },
  { valeur: "B1", libelle: "B1 — Indépendant" },
  { valeur: "A2", libelle: "A2 — Élémentaire" },
  { valeur: "A1", libelle: "A1 — Débutant" },
];

const TONS = [
  { valeur: "", libelle: "Sélectionner…" },
  { valeur: "formel", libelle: "Formel et académique" },
  { valeur: "dynamique", libelle: "Dynamique et engagé" },
  { valeur: "academique", libelle: "Académique et rigoureux" },
];

interface Props {
  profilInitial: Profil | null;
}

export function FormulaireProfil({ profilInitial }: Props) {
  const [sauvegarde, setSauvegarde] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const [bio, setBio] = useState(profilInitial?.bio ?? "");
  const [objectifs, setObjectifs] = useState(profilInitial?.objectifs ?? "");
  const [tonSouhaite, setTonSouhaite] = useState(profilInitial?.tonSouhaite ?? "");

  const [formations, setFormations] = useState<Formation[]>(
    (profilInitial?.formations as Formation[]) ?? []
  );
  const [experiences, setExperiences] = useState<Experience[]>(
    (profilInitial?.experiences as Experience[]) ?? []
  );
  const [competences, setCompetences] = useState<string[]>(
    (profilInitial?.competences as string[]) ?? []
  );
  const [langues, setLangues] = useState<Langue[]>(
    (profilInitial?.langues as Langue[]) ?? []
  );
  const [competenceInput, setCompetenceInput] = useState("");

  async function sauvegarder(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    setSauvegarde(false);

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, objectifs, tonSouhaite, formations, experiences, competences, langues }),
      });
      if (!res.ok) throw new Error();
      setSauvegarde(true);
      setTimeout(() => setSauvegarde(false), 3000);
    } catch {
      setErreur("Erreur lors de la sauvegarde. Réessayez.");
    } finally {
      setChargement(false);
    }
  }

  function ajouterFormation() {
    setFormations([...formations, { etablissement: "", diplome: "", annee: "" }]);
  }
  function majFormation(i: number, champ: keyof Formation, val: string) {
    setFormations(formations.map((f, idx) => (idx === i ? { ...f, [champ]: val } : f)));
  }
  function supprimerFormation(i: number) {
    setFormations(formations.filter((_, idx) => idx !== i));
  }

  function ajouterExperience() {
    setExperiences([...experiences, { poste: "", organisation: "", dateDebut: "" }]);
  }
  function majExperience(i: number, champ: keyof Experience, val: string) {
    setExperiences(experiences.map((e, idx) => (idx === i ? { ...e, [champ]: val } : e)));
  }
  function supprimerExperience(i: number) {
    setExperiences(experiences.filter((_, idx) => idx !== i));
  }

  function ajouterCompetence() {
    if (!competenceInput.trim()) return;
    setCompetences([...competences, competenceInput.trim()]);
    setCompetenceInput("");
  }

  function ajouterLangue() {
    setLangues([...langues, { langue: "", niveau: "" }]);
  }
  function majLangue(i: number, champ: keyof Langue, val: string) {
    setLangues(langues.map((l, idx) => (idx === i ? { ...l, [champ]: val } : l)));
  }
  function supprimerLangue(i: number) {
    setLangues(langues.filter((_, idx) => idx !== i));
  }

  return (
    <form onSubmit={sauvegarder} className="space-y-5 pb-8">
      {/* Bio */}
      <Carte>
        <CarteEntete>
          <CarteTitre>Présentation générale</CarteTitre>
        </CarteEntete>
        <ChampTextarea
          label="Bio / Situation actuelle"
          placeholder="Ex : Étudiant en Master Informatique à l'UAC, passionné par l'IA et le développement logiciel…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />
      </Carte>

      {/* Formations */}
      <Carte>
        <CarteEntete>
          <div className="flex items-center justify-between">
            <CarteTitre>Formations</CarteTitre>
            <button type="button" onClick={ajouterFormation} className="text-indigo-600 text-sm font-medium">
              + Ajouter
            </button>
          </div>
        </CarteEntete>
        <div className="space-y-4">
          {formations.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Aucune formation ajoutée</p>
          )}
          {formations.map((f, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-3 relative">
              <button
                type="button"
                onClick={() => supprimerFormation(i)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
              <ChampTexte
                label="Établissement"
                placeholder="Ex : Université d'Abomey-Calavi"
                value={f.etablissement}
                onChange={(e) => majFormation(i, "etablissement", e.target.value)}
              />
              <ChampTexte
                label="Diplôme"
                placeholder="Ex : Licence en Informatique"
                value={f.diplome}
                onChange={(e) => majFormation(i, "diplome", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <ChampTexte
                  label="Année"
                  placeholder="2023"
                  value={f.annee}
                  onChange={(e) => majFormation(i, "annee", e.target.value)}
                />
                <ChampTexte
                  label="Mention / Note"
                  placeholder="Ex : Bien, 14/20"
                  value={f.note ?? ""}
                  onChange={(e) => majFormation(i, "note", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Carte>

      {/* Expériences */}
      <Carte>
        <CarteEntete>
          <div className="flex items-center justify-between">
            <CarteTitre>Expériences</CarteTitre>
            <button type="button" onClick={ajouterExperience} className="text-indigo-600 text-sm font-medium">
              + Ajouter
            </button>
          </div>
        </CarteEntete>
        <div className="space-y-4">
          {experiences.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Aucune expérience ajoutée</p>
          )}
          {experiences.map((exp, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-3 relative">
              <button
                type="button"
                onClick={() => supprimerExperience(i)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
              <ChampTexte
                label="Poste / Rôle"
                placeholder="Ex : Stagiaire développeur"
                value={exp.poste}
                onChange={(e) => majExperience(i, "poste", e.target.value)}
              />
              <ChampTexte
                label="Organisation"
                placeholder="Ex : ONG TechAfrica"
                value={exp.organisation}
                onChange={(e) => majExperience(i, "organisation", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <ChampTexte
                  label="Début"
                  placeholder="2022-06"
                  value={exp.dateDebut}
                  onChange={(e) => majExperience(i, "dateDebut", e.target.value)}
                />
                <ChampTexte
                  label="Fin (ou vide)"
                  placeholder="2022-09"
                  value={exp.dateFin ?? ""}
                  onChange={(e) => majExperience(i, "dateFin", e.target.value)}
                />
              </div>
              <ChampTextarea
                label="Description"
                placeholder="Missions et réalisations principales…"
                value={exp.description ?? ""}
                onChange={(e) => majExperience(i, "description", e.target.value)}
                rows={2}
              />
            </div>
          ))}
        </div>
      </Carte>

      {/* Compétences */}
      <Carte>
        <CarteEntete>
          <CarteTitre>Compétences</CarteTitre>
        </CarteEntete>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={competenceInput}
            onChange={(e) => setCompetenceInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ajouterCompetence(); } }}
            placeholder="Ex : Python, Gestion de projet…"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Bouton type="button" variante="secondaire" taille="sm" onClick={ajouterCompetence}>
            +
          </Bouton>
        </div>
        <div className="flex flex-wrap gap-2">
          {competences.map((c, i) => (
            <Badge key={i} couleur="indigo" className="cursor-pointer" onClick={() => setCompetences(competences.filter((_, idx) => idx !== i))}>
              {c} ✕
            </Badge>
          ))}
          {competences.length === 0 && (
            <p className="text-sm text-gray-400">Appuyez sur Entrée ou + pour ajouter</p>
          )}
        </div>
      </Carte>

      {/* Langues */}
      <Carte>
        <CarteEntete>
          <div className="flex items-center justify-between">
            <CarteTitre>Langues</CarteTitre>
            <button type="button" onClick={ajouterLangue} className="text-indigo-600 text-sm font-medium">
              + Ajouter
            </button>
          </div>
        </CarteEntete>
        <div className="space-y-3">
          {langues.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Aucune langue ajoutée</p>
          )}
          {langues.map((l, i) => (
            <div key={i} className="flex gap-2 items-end">
              <ChampTexte
                label={i === 0 ? "Langue" : undefined}
                placeholder="Ex : Anglais"
                value={l.langue}
                onChange={(e) => majLangue(i, "langue", e.target.value)}
                className="flex-1"
              />
              <ChampSelect
                label={i === 0 ? "Niveau réel" : undefined}
                options={NIVEAUX_LANGUE}
                value={l.niveau}
                onChange={(e) => majLangue(i, "niveau", e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => supprimerLangue(i)}
                className="text-gray-400 hover:text-red-500 pb-2.5 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Carte>

      {/* Objectifs */}
      <Carte>
        <CarteEntete>
          <CarteTitre>Objectifs</CarteTitre>
        </CarteEntete>
        <ChampTextarea
          label="Domaine et pays visés, motivations"
          placeholder="Ex : Je souhaite poursuivre un Master en Intelligence Artificielle en Europe (France, Belgique, Allemagne)…"
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          rows={3}
        />
      </Carte>

      {/* Ton */}
      <Carte>
        <CarteEntete>
          <CarteTitre>Ton des lettres</CarteTitre>
        </CarteEntete>
        <ChampSelect
          label="Ton préféré pour vos lettres de motivation"
          options={TONS}
          value={tonSouhaite}
          onChange={(e) => setTonSouhaite(e.target.value)}
        />
      </Carte>

      {/* Erreur / Succès */}
      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {erreur}
        </div>
      )}
      {sauvegarde && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          ✓ Profil sauvegardé avec succès
        </div>
      )}

      <Bouton type="submit" chargement={chargement} className="w-full">
        Sauvegarder le profil
      </Bouton>
    </form>
  );
}
