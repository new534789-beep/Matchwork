export type EtapeStatut = "fait" | "en_cours" | "a_venir" | "verrouille";
export type Etape = { label: string; sousTexte?: string; statut: EtapeStatut };

export type EtapesDossierProps = {
  statut: string;
  docsCount: number;
  createdAt: string;
  updatedAt: string;
  relanceEnvoyeeLe: string | null;
  planPro: boolean;
};

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// Mapping statut → étapes du suivi de candidature (dossier créé → documents →
// envoi → relance J+7 (Pro) → obtenu). Pur dérivé du statut du dossier — pas
// de nouvel état stocké en base.
export function etapesDossier({ statut, docsCount, createdAt, updatedAt, relanceEnvoyeeLe, planPro }: EtapesDossierProps): Etape[] {
  const documentsGeneres = docsCount > 0;
  const envoyee = statut === "utilise" || statut === "obtenu";
  const obtenu = statut === "obtenu";
  const relanceFaite = !!relanceEnvoyeeLe;

  const etapes: Etape[] = [
    { label: "Dossier créé", sousTexte: formaterDate(createdAt), statut: "fait" },
    {
      label: "Documents générés",
      sousTexte: documentsGeneres ? `${docsCount} document${docsCount > 1 ? "s" : ""}` : undefined,
      statut: documentsGeneres ? "fait" : "en_cours",
    },
    {
      label: "Candidature envoyée",
      statut: envoyee ? "fait" : documentsGeneres ? "en_cours" : "a_venir",
    },
  ];

  if (!planPro) {
    etapes.push({ label: "Relance automatique (J+7)", sousTexte: "Réservé aux plans Pro", statut: "verrouille" });
  } else if (relanceFaite) {
    etapes.push({ label: "Relance automatique envoyée", sousTexte: formaterDate(relanceEnvoyeeLe!), statut: "fait" });
  } else if (envoyee) {
    const prevue = new Date(new Date(updatedAt).getTime() + 7 * 86400000);
    etapes.push({ label: "Relance automatique (J+7)", sousTexte: `Prévue le ${formaterDate(prevue.toISOString())}`, statut: "en_cours" });
  } else {
    etapes.push({ label: "Relance automatique (J+7)", statut: "a_venir" });
  }

  etapes.push({ label: "Offre obtenue", statut: obtenu ? "fait" : "a_venir" });

  return etapes;
}

// Index de l'étape "active" pour un affichage compact (mini-barre) : la
// dernière faite, ou la première en cours si aucune n'est faite après elle.
export function etapeActuelle(etapes: Etape[]): { index: number; etape: Etape } {
  let dernierFait = -1;
  for (let i = 0; i < etapes.length; i++) {
    if (etapes[i].statut === "fait") dernierFait = i;
  }
  const enCoursIndex = etapes.findIndex((e) => e.statut === "en_cours");
  const index = enCoursIndex !== -1 ? enCoursIndex : dernierFait !== -1 ? dernierFait : 0;
  return { index, etape: etapes[index] };
}
