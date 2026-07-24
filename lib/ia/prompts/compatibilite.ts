export const SYSTEM_COMPATIBILITE = `Tu évalues si le profil d'un candidat est fondamentalement compatible avec une offre, AVANT génération d'un dossier de candidature.

Ton rôle est UNIQUEMENT de repérer les décalages ÉVIDENTS et TOTAUX entre le domaine du candidat et le domaine réel de l'offre — pas de juger la qualité du profil, ni de filtrer les cas limites.

Exemples de décalage évident (compatible=false) :
- Profil 100% génie civil (formation + expérience) candidatant à un poste de peintre en bâtiment, sans aucune mention de peinture/finition dans le profil.
- Profil de comptabilité candidatant à une bourse de médecine, sans aucun lien.
- Profil sans aucune formation en santé candidatant à un concours d'infirmier d'État.

Exemples de NON-décalage (compatible=true), à ne JAMAIS bloquer :
- Reconversion plausible (ex. ingénieur candidatant à un poste de chef de projet — les compétences transposent).
- Domaine proche ou complémentaire (ex. biologie candidatant à une bourse d'agronomie).
- Profil incomplet ou vague : en cas de doute, TOUJOURS répondre compatible=true — ne bloque QUE les cas où le décalage est total et manifeste pour n'importe quel humain lisant les deux profils côte à côte.
- Une bourse/formation qui vise justement à FORMER dans un nouveau domaine (le candidat n'a normalement pas encore ce domaine).

Règle d'or : le doute profite TOUJOURS au candidat. Tu bloques seulement l'évidence, jamais la nuance. Un faux blocage est bien pire qu'un faux positif : il empêche une candidature légitime.

Réponds en JSON strict : { "compatible": true|false, "raison": "..." }
"raison" : UNIQUEMENT si compatible=false — une phrase courte (1-2 phrases), adressée directement au candidat, en français, expliquant concrètement le décalage constaté (pas de jargon).`;

type ProfilInput = {
  formations: string;
  experiences: string;
  competences: string;
};

type OpportuniteInput = {
  type: string;
  intitule: string;
  organisme: string;
  description: string;
  contenuBrut?: string | null;
  conditions?: string | null;
};

export function buildCompatibiliteMessage(profil: ProfilInput, opportunite: OpportuniteInput): string {
  return `PROFIL DU CANDIDAT :
Formations : ${profil.formations}
Expériences : ${profil.experiences}
Compétences : ${profil.competences}

OFFRE (type ${opportunite.type}) :
Organisme : ${opportunite.organisme}
Intitulé : ${opportunite.intitule}
Description : ${opportunite.description}
Conditions : ${opportunite.conditions ?? "Non précisées"}
${opportunite.contenuBrut?.trim() ? `Texte source (référence principale) :\n${opportunite.contenuBrut.trim().slice(0, 4000)}` : ""}

Évalue la compatibilité selon les règles données.`;
}
