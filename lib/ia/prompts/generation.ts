export const SYSTEM_GENERATION = `Tu rédiges les documents de candidature demandés par une offre, pour un candidat.
On te fournit : (A) son PROFIL réel, (B) le contenu de ses PIÈCES justificatives, (C) l'OFFRE analysée — dont la LISTE EXACTE des documents rédactionnels à produire (ex. lettre seule, ou CV + lettre, ou lettre + projet d'études…), et la langue exigée ; (D) l'HISTORIQUE des tournures déjà utilisées.

Règles absolues :
1. Produis UNIQUEMENT les documents listés en (C). N'ajoute PAS de CV ni de lettre si l'offre ne les demande pas.
2. N'invente JAMAIS un diplôme, une note, une expérience, une date ou un fait absent de (A)/(B). Information manquante -> rédige sans, ou marque « à compléter ».
3. Ne génère JAMAIS une pièce personnelle (acte de naissance, diplôme, relevé, pièce d'identité, justificatif de langue) : ce n'est pas du rédactionnel.
4. Sélectionne seulement les éléments de (A) pertinents pour CETTE offre.
5. Rédige ENTIÈREMENT dans la langue exigée (C). Par défaut le français.
6. Adapte le ton au champ « ton » du profil (formel / naturel / dynamique).
7. Démarque-toi de l'HISTORIQUE (D) : ni les mêmes accroches, ni la même structure.
8. N'affirme jamais un niveau de langue ou une qualification absente de (A)/(B).

Sortie : un objet JSON strict, sans balises markdown, un objet par document demandé, avec le "type" EXACTEMENT tel que fourni en (C) :
{ "documents": [ { "type": "...", "contenu": "..." } ], "accrochesCles": ["...", "..."] }`;

type ProfilInput = {
  bio?: string | null;
  formations: string;
  experiences: string;
  competences: string;
  langues: string;
  objectifs?: string | null;
  tonSouhaite?: string | null;
};

type DocCoffre = {
  type: string;
  infosExtraites: string | null;
};

type OpportuniteInput = {
  intitule: string;
  organisme: string;
  description: string;
  conditions?: string | null;
  piecesExigees: string;
  langueDetectee?: string | null;
  exigenceLangue?: string | null;
};

export type DocumentAGenerer = { type: string; nom: string };

export function buildGenerationMessage(
  profil: ProfilInput,
  coffreFort: DocCoffre[],
  opportunite: OpportuniteInput,
  historiqueAccroches: string[],
  documentsAGenerer: DocumentAGenerer[]
): string {
  const coffre = coffreFort
    .filter((d) => d.infosExtraites)
    .map((d, i) => `[${i + 1}] Type : ${d.type}\n${d.infosExtraites}`)
    .join("\n\n");

  const historique =
    historiqueAccroches.length === 0
      ? "Aucune (première candidature du candidat)."
      : historiqueAccroches.map((a, i) => `${i + 1}. ${a}`).join("\n");

  const aProduire = documentsAGenerer
    .map((d, i) => `${i + 1}. type="${d.type}" — ${d.nom}`)
    .join("\n");

  return `(A) PROFIL DU CANDIDAT :
Bio : ${profil.bio ?? "Non renseignée"}
Formations : ${profil.formations}
Expériences : ${profil.experiences}
Compétences : ${profil.competences}
Langues parlées : ${profil.langues}
Objectifs : ${profil.objectifs ?? "Non renseignés"}
Ton souhaité : ${profil.tonSouhaite ?? "naturel"}

(B) PIÈCES JUSTIFICATIVES (coffre-fort) :
${coffre || "Aucun document uploadé avec contenu extrait."}

(C) OFFRE ANALYSÉE :
Organisme : ${opportunite.organisme}
Intitulé : ${opportunite.intitule}
Langue de l'offre : ${opportunite.langueDetectee ?? "fr"}
Exigence de langue : ${opportunite.exigenceLangue ?? "Non précisée"}
Description : ${opportunite.description}
Conditions d'éligibilité : ${opportunite.conditions ?? "Non précisées"}

DOCUMENTS RÉDACTIONNELS À PRODUIRE (produis EXACTEMENT ceux-ci, rien d'autre) :
${aProduire}

(D) HISTORIQUE DES ACCROCHES ET TOURNURES DÉJÀ UTILISÉES :
${historique}

Génère uniquement les documents listés ci-dessus.`;
}
