export const SYSTEM_GENERATION = `Tu rédiges les documents de candidature demandés par une offre, pour un candidat.
On te fournit : (A) son PROFIL COMPLET avec coordonnées, (B) le contenu de ses PIÈCES justificatives, (C) l'OFFRE ANALYSÉE — dont la LISTE EXACTE des documents rédactionnels à produire et la langue exigée ; (D) l'HISTORIQUE des tournures déjà utilisées.

Règles absolues :
1. Produis UNIQUEMENT les documents listés en (C). N'ajoute PAS de CV ni de lettre si l'offre ne les demande pas.
2. N'invente JAMAIS un diplôme, une note, une expérience, une date ou un fait absent de (A)/(B). Information manquante → OMETS-LA (ne mets jamais de placeholder).
3. Ne génère JAMAIS une pièce personnelle (acte de naissance, diplôme, relevé, pièce d'identité, justificatif de langue) : ce n'est pas du rédactionnel.
4. Sélectionne seulement les éléments de (A) pertinents pour CETTE offre.
5. Rédige ENTIÈREMENT dans la langue exigée (C). Par défaut le français.
6. Adapte le ton au champ « ton » du profil (formel / naturel / dynamique).
7. Démarque-toi de l'HISTORIQUE (D) : ni les mêmes accroches, ni la même structure.
8. N'affirme jamais un niveau de langue ou une qualification absente de (A)/(B).

INTERDICTION ABSOLUE DE CHAMPS VIDES OU PLACEHOLDERS :
- JAMAIS de "[à compléter]", "[votre nom]", "[date]", "[adresse]", "___", "...", "[organisme]" ou tout autre placeholder.
- Utilise DIRECTEMENT les informations du profil (A) : nom complet, adresse, téléphone, email, date de naissance, nationalité, lieu de naissance, signature.
- Utilise DIRECTEMENT les informations de l'offre (C) : nom de l'organisme, intitulé de la bourse/poste, date limite.
- La DATE DU JOUR pour l'en-tête de la lettre est fournie dans (C).
- La SIGNATURE en bas de chaque lettre/document doit utiliser le champ "signature" du profil.

LONGUEUR DES DOCUMENTS :
- Chaque document doit avoir une LONGUEUR MOYENNE : ni trop court (qui paraît bâclé), ni trop long (qui ennuie le lecteur).
- LETTRE DE MOTIVATION : 350 à 500 mots. Percutante, chaque phrase doit apporter quelque chose.
- CV : 1 page, concis mais complet.
- DEMANDE MANUSCRITE : 200 à 350 mots. Directe et formelle.
- PROJET D'ÉTUDES : 400 à 600 mots. Structuré et convaincant.
- DÉCLARATION PERSONNELLE : 400 à 600 mots.
- Privilégie l'IMPACT sur la longueur : des phrases concrètes avec des chiffres et résultats plutôt que du remplissage.

FORMAT DES DOCUMENTS — respecte les normes de rédaction :
- LETTRE DE MOTIVATION : en-tête complet (Prénom NOM / Adresse / Tél / Email en haut à gauche, Organisme destinataire / Date en haut à droite), objet, corps structuré (accroche, développement, conclusion), formule de politesse, signature.
- CV : coordonnées complètes en en-tête, sections claires (Formation, Expérience, Compétences, Langues), dates précises.
- DEMANDE MANUSCRITE : lieu et date, identité complète de l'expéditeur, destinataire, objet, corps, formule de politesse, signature.
- PROJET D'ÉTUDES : introduction, objectifs, plan de formation, perspectives, adéquation avec la bourse.
- Tout document doit être COMPLET et prêt à l'envoi, sans aucune retouche nécessaire.

Sortie : un objet JSON strict, sans balises markdown, un objet par document demandé, avec le "type" EXACTEMENT tel que fourni en (C) :
{ "documents": [ { "type": "...", "contenu": "..." } ], "accrochesCles": ["...", "..."] }`;

type ProfilInput = {
  nomComplet?: string | null;
  dateNaissance?: string | null;
  lieuNaissance?: string | null;
  nationalite?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  email?: string | null;
  signature?: string | null;
  linkedin?: string | null;
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
  dateLimite?: Date | null;
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

  const dateJour = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const dateLimiteStr = opportunite.dateLimite
    ? opportunite.dateLimite.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "Non précisée";

  return `(A) PROFIL COMPLET DU CANDIDAT :
Nom complet : ${profil.nomComplet ?? "Non renseigné"}
Date de naissance : ${profil.dateNaissance ?? "Non renseignée"}
Lieu de naissance : ${profil.lieuNaissance ?? "Non renseigné"}
Nationalité : ${profil.nationalite ?? "Non renseignée"}
Téléphone : ${profil.telephone ?? "Non renseigné"}
Adresse postale : ${profil.adresse ?? "Non renseignée"}
E-mail : ${profil.email ?? "Non renseigné"}
Signature (nom pour signer) : ${profil.signature ?? profil.nomComplet ?? "Non renseigné"}
LinkedIn : ${profil.linkedin ?? "Non renseigné"}
Bio : ${profil.bio ?? "Non renseignée"}
Formations : ${profil.formations}
Expériences : ${profil.experiences}
Compétences : ${profil.competences}
Langues parlées : ${profil.langues}
Objectifs : ${profil.objectifs ?? "Non renseignés"}
Ton souhaité : ${profil.tonSouhaite ?? "formel"}

(B) PIÈCES JUSTIFICATIVES (coffre-fort) :
${coffre || "Aucun document uploadé avec contenu extrait."}

(C) OFFRE ANALYSÉE :
Organisme : ${opportunite.organisme}
Intitulé : ${opportunite.intitule}
Langue de l'offre : ${opportunite.langueDetectee ?? "fr"}
Exigence de langue : ${opportunite.exigenceLangue ?? "Non précisée"}
Description : ${opportunite.description}
Conditions d'éligibilité : ${opportunite.conditions ?? "Non précisées"}
Date limite de candidature : ${dateLimiteStr}
Date du jour (pour l'en-tête) : ${dateJour}

DOCUMENTS RÉDACTIONNELS À PRODUIRE (produis EXACTEMENT ceux-ci, rien d'autre) :
${aProduire}

(D) HISTORIQUE DES ACCROCHES ET TOURNURES DÉJÀ UTILISÉES :
${historique}

RAPPEL : utilise DIRECTEMENT les coordonnées du profil (A) et les infos de l'offre (C) dans les documents. AUCUN champ vide, AUCUN placeholder, AUCUN "[à compléter]". Le document doit être prêt à imprimer et envoyer.`;
}
