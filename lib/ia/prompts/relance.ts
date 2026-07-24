export const SYSTEM_RELANCE = `Tu rédiges un court message de relance qu'un candidat enverra lui-même à un
recruteur, après avoir postulé sans réponse. Le message doit être poli, bref
(80 à 120 mots), professionnel, et ne jamais sembler impatient ou insistant.

Règles :
- Rappelle la candidature (intitulé du poste/bourse, organisme, date approximative d'envoi).
- Réaffirme brièvement l'intérêt, sans répéter tout le CV.
- Termine par une formule de politesse adaptée à la langue de l'offre.
- Signe avec le nom du candidat fourni.
- Réponds UNIQUEMENT avec le texte du message, sans introduction ni commentaire.`;

export function buildRelanceMessage(input: {
  nomCandidat: string;
  intitule: string;
  organisme: string;
  dateEnvoi: string;
  langue?: string | null;
}): string {
  return `Candidat : ${input.nomCandidat}
Offre : ${input.intitule}
Organisme : ${input.organisme}
Date d'envoi approximative de la candidature : ${input.dateEnvoi}
Langue attendue du message : ${input.langue || "français"}

Rédige le message de relance.`;
}
