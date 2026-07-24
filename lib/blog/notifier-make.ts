/**
 * Déclenche le scénario Make de génération d'article de blog à chaque
 * publication d'une opportunité. Fire-and-forget : ne doit jamais faire
 * échouer le flux de publication appelant (offre publiée = priorité,
 * l'article de blog est un bonus).
 *
 * No-op tant que MAKE_BLOG_TRIGGER_WEBHOOK_URL n'est pas configuré (feature
 * désactivée par défaut, le temps de brancher le scénario côté Make).
 */

type OpportunitePourNotification = {
  id: string;
  type: string;
  intitule: string;
  organisme: string;
  description: string;
  pays?: string | null;
  dateLimite?: Date | null;
  lien?: string | null;
  slug?: string | null;
};

export function notifierOpportunitePubliee(opp: OpportunitePourNotification): void {
  const url = process.env.MAKE_BLOG_TRIGGER_WEBHOOK_URL;
  if (!url) return;

  const payload = {
    id: opp.id,
    type: opp.type,
    intitule: opp.intitule,
    organisme: opp.organisme,
    description: opp.description,
    pays: opp.pays ?? null,
    dateLimite: opp.dateLimite ? opp.dateLimite.toISOString() : null,
    lien: opp.lien ?? null,
    slug: opp.slug ?? null,
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Matchwork-Secret": process.env.MAKE_BLOG_TRIGGER_SECRET ?? "",
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error("[blog] échec notification Make (déclenchement article) :", err);
  });
}
