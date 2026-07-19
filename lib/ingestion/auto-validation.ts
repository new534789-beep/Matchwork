/**
 * Bot de validation automatique des opportunités.
 *
 * Vérifie les offres en file (`a_valider` / `revue_manuelle`) et décide
 * automatiquement de publier ou rejeter, sans intervention admin.
 *
 * Règles :
 *  - Source ATS (emplois) : publiée directement (source fiable, API officielle)
 *  - Source RSS/scrape (bourses, etc.) : vérification des champs critiques
 *  - Rejet automatique si : titre vide, doublon sémantique, spam détecté
 */
import { prisma } from "@/lib/prisma";
import { STATUTS_EN_FILE } from "@/lib/opportunites";
import { detecterBlog } from "@/lib/ia/detection-blog";
import { notifierOpportunitePubliee } from "@/lib/blog/notifier-make";

export type RapportValidation = {
  traitees: number;
  publiees: number;
  rejetees: number;
  ignorees: number;
  details: { id: string; intitule: string; decision: "publiee" | "rejetee"; raison: string }[];
};

const MOTS_SPAM = [
  "casino", "lottery", "viagra", "crypto scam", "make money fast",
  "click here", "free iphone", "congratulations you won",
];

// ── Filtre anti-blog : détection par IA (Mistral) ──

const SEUIL_CONFIANCE_BLOG = 0.7;

async function estContenuBlog(intitule: string, description: string): Promise<string | null> {
  const resultat = await detecterBlog(intitule, description);
  if (!resultat) return null;
  if (resultat.estBlog && resultat.confiance >= SEUIL_CONFIANCE_BLOG) {
    return `Contenu blog/article détecté par IA (${resultat.raison})`;
  }
  return null;
}

// ── Cohérence type ↔ contenu ──

const SIGNAUX_EMPLOI = [
  "recrute", "recrutement", "hiring", "we are hiring", "join our team",
  "offre d'emploi", "offre d emploi", "poste à pourvoir",
  "candidature spontanée", "poste chez", "vacancy",
];

const SIGNAUX_BOURSE = [
  "bourse d'étude", "bourse d'excellence", "scholarship", "fellowship",
  "bourse de recherche", "aide financière", "financement doctoral",
  "funding opportunity", "grant for",
];

function verifierCoherence(
  type: string,
  intitule: string,
  description: string,
): { coherent: boolean; raison?: string } {
  const titre = intitule.toLowerCase();
  const desc = (description || "").toLowerCase().slice(0, 500);
  const texte = `${titre} ${desc}`;

  if (type === "BOURSE" || type === "BOURSE_ETUDE") {
    if (desc.startsWith("poste ") || desc.includes("poste chez")) {
      return { coherent: false, raison: `Type ${type} mais description d'emploi (poste chez...)` };
    }
    const aSignalEmploi = SIGNAUX_EMPLOI.some((s) => texte.includes(s));
    const aSignalBourse = SIGNAUX_BOURSE.some((s) => texte.includes(s));
    if (aSignalEmploi && !aSignalBourse && !titre.includes("bourse") && !titre.includes("scholarship")) {
      return { coherent: false, raison: `Type ${type} mais contenu d'emploi détecté` };
    }
  }

  if (type === "EMPLOI" || type === "STAGE") {
    const aSignalBourse = SIGNAUX_BOURSE.some((s) => texte.includes(s));
    const aSignalEmploi = SIGNAUX_EMPLOI.some((s) => texte.includes(s));
    if (aSignalBourse && !aSignalEmploi && (titre.includes("bourse") || titre.includes("scholarship"))) {
      return { coherent: false, raison: `Type ${type} mais contenu de bourse détecté` };
    }
  }

  return { coherent: true };
}

// ── Vérification description : rejeter les descriptions qui ne décrivent pas l'offre ──

function descriptionValide(intitule: string, description: string): string | null {
  const desc = (description || "").trim();

  if (desc.length < 30) return "Description trop courte ou absente";

  // Description identique au titre (copié-collé, pas de vraie description)
  if (desc.toLowerCase() === intitule.toLowerCase()) return "Description identique au titre";

  // Description qui est juste le nom d'une entreprise
  if (desc.split(" ").length <= 3 && !desc.includes(".")) return "Description trop vague (quelques mots)";

  return null;
}

// ── Filtre anti-navigation : titres de menu/catégorie remontés par un scraper cassé ──

const INTITULES_GENERIQUES = [
  /^détail$/i, /^detail$/i, /^voir\s*plus$/i, /^en savoir plus$/i, /^lire la suite$/i,
  /^offres?\s+d'emplois?/i, /^offre\s+d\s?emploi/i, /^chercher un emploi$/i,
  /^recherche(r)?\s+un\s+emploi$/i, /^espace\s+candidat/i, /^espace\s+employeur/i,
  /^connexion$/i, /^inscription$/i, /^accueil$/i, /^contact$/i, /^à propos$/i,
];

function intituleGenerique(intitule: string): string | null {
  const t = (intitule || "").trim();
  // Un titre extrêmement court (icône, lien vide) n'est jamais une offre — mais un
  // vrai intitulé de poste peut être court ("Chauffeur", "AI Engineer"), donc on ne
  // filtre sur la longueur seule qu'en dessous d'un seuil très bas.
  if (t.length < 4) return "Titre trop court (probable lien de navigation)";
  if (INTITULES_GENERIQUES.some((re) => re.test(t))) return "Titre générique de menu/catégorie (pas une offre)";
  return null;
}

function estSpam(texte: string): boolean {
  const lower = texte.toLowerCase();
  return MOTS_SPAM.some((mot) => lower.includes(mot));
}

function champRempli(val: string | null | undefined): boolean {
  return !!val && val.trim().length > 0 && val.trim() !== "Non précisé";
}

type Decision = { action: "publiee" | "rejetee"; raison: string };

export async function deciderEmploi(opp: {
  type: string;
  intitule: string;
  organisme: string;
  description: string;
  lien: string | null;
  source: string;
}): Promise<Decision> {
  if (!champRempli(opp.intitule)) {
    return { action: "rejetee", raison: "Titre manquant" };
  }
  const titreErr = intituleGenerique(opp.intitule);
  if (titreErr) {
    return { action: "rejetee", raison: titreErr };
  }
  if (!champRempli(opp.organisme)) {
    return { action: "rejetee", raison: "Entreprise manquante" };
  }
  if (!champRempli(opp.lien)) {
    return { action: "rejetee", raison: "Lien de candidature manquant" };
  }
  if (estSpam(`${opp.intitule} ${opp.description}`)) {
    return { action: "rejetee", raison: "Contenu suspect (spam)" };
  }
  if (!opp.source.startsWith("ATS:")) {
    const blog = await estContenuBlog(opp.intitule, opp.description);
    if (blog) {
      return { action: "rejetee", raison: blog };
    }
  }
  const coherence = verifierCoherence(opp.type, opp.intitule, opp.description);
  if (!coherence.coherent) {
    return { action: "rejetee", raison: coherence.raison! };
  }
  return { action: "publiee", raison: "Source ATS fiable, champs complets" };
}

export async function deciderBourseOuAutre(opp: {
  type: string;
  intitule: string;
  organisme: string;
  description: string;
  lien: string | null;
  dateLimite: Date | null;
  confianceDateLimite: number | null;
}): Promise<Decision> {
  if (!champRempli(opp.intitule)) {
    return { action: "rejetee", raison: "Titre manquant" };
  }
  const titreErr = intituleGenerique(opp.intitule);
  if (titreErr) {
    return { action: "rejetee", raison: titreErr };
  }
  if (!champRempli(opp.organisme)) {
    return { action: "rejetee", raison: "Organisme manquant" };
  }
  if (!champRempli(opp.description) || opp.description.trim().length < 30) {
    return { action: "rejetee", raison: "Description trop courte ou absente" };
  }
  if (estSpam(`${opp.intitule} ${opp.description}`)) {
    return { action: "rejetee", raison: "Contenu suspect (spam)" };
  }
  const blog = await estContenuBlog(opp.intitule, opp.description);
  if (blog) {
    return { action: "rejetee", raison: blog };
  }
  const descErr = descriptionValide(opp.intitule, opp.description);
  if (descErr) {
    return { action: "rejetee", raison: descErr };
  }
  if (opp.dateLimite && opp.dateLimite.getTime() < Date.now()) {
    return { action: "rejetee", raison: "Date limite dépassée" };
  }
  const coherence = verifierCoherence(opp.type, opp.intitule, opp.description);
  if (!coherence.coherent) {
    return { action: "rejetee", raison: coherence.raison! };
  }
  return { action: "publiee", raison: "Champs complets, contenu valide" };
}

/**
 * Traite toutes les offres en file de validation et publie/rejette automatiquement.
 * Par lots pour éviter les timeouts.
 */
export async function validerAutomatiquement(options?: { limite?: number }): Promise<RapportValidation> {
  const limite = options?.limite ?? 500;

  const offres = await prisma.opportunite.findMany({
    where: { statut: { in: [...STATUTS_EN_FILE] } },
    orderBy: { premiereVue: "desc" },
    take: limite,
    select: {
      id: true,
      type: true,
      intitule: true,
      organisme: true,
      description: true,
      lien: true,
      source: true,
      dateLimite: true,
      confianceDateLimite: true,
      pays: true,
      slug: true,
    },
  });

  const rapport: RapportValidation = {
    traitees: offres.length,
    publiees: 0,
    rejetees: 0,
    ignorees: 0,
    details: [],
  };

  for (const opp of offres) {
    const estATS = opp.source.startsWith("ATS:");
    const estEmploi = opp.type === "EMPLOI" || estATS;

    const decision = estEmploi
      ? await deciderEmploi(opp)
      : await deciderBourseOuAutre(opp);

    try {
      await prisma.opportunite.update({
        where: { id: opp.id },
        data: {
          statut: decision.action,
          actif: decision.action === "publiee",
        },
      });

      if (decision.action === "publiee") {
        rapport.publiees++;
        notifierOpportunitePubliee(opp);
      } else rapport.rejetees++;

      rapport.details.push({
        id: opp.id,
        intitule: opp.intitule.slice(0, 80),
        decision: decision.action,
        raison: decision.raison,
      });
    } catch {
      rapport.ignorees++;
    }
  }

  // Nettoyer aussi les offres déjà publiées qui sont incohérentes
  const nettoyage = await nettoyerOffresIncoherentes();
  rapport.rejetees += nettoyage.retirees;
  for (const d of nettoyage.details) {
    rapport.details.push(d);
  }

  return rapport;
}

/**
 * Vérifie les offres déjà publiées et retire du fil celles
 * dont le type ne correspond pas au contenu (titre + description).
 */
export async function nettoyerOffresIncoherentes(): Promise<{
  retirees: number;
  details: RapportValidation["details"];
}> {
  const publiees = await prisma.opportunite.findMany({
    where: { statut: "publiee", actif: true },
    select: {
      id: true,
      type: true,
      intitule: true,
      description: true,
      source: true,
    },
  });

  let retirees = 0;
  const details: RapportValidation["details"] = [];

  for (const opp of publiees) {
    let raison: string | null = intituleGenerique(opp.intitule);

    if (!raison) {
      const coherence = verifierCoherence(opp.type, opp.intitule, opp.description);
      if (!coherence.coherent) raison = coherence.raison!;
    }

    if (!raison && (opp.type === "BOURSE" || opp.type === "BOURSE_ETUDE")) {
      raison = descriptionValide(opp.intitule, opp.description);
    }

    if (raison) {
      await prisma.opportunite.update({
        where: { id: opp.id },
        data: { statut: "rejetee", actif: false },
      });
      retirees++;
      details.push({
        id: opp.id,
        intitule: opp.intitule.slice(0, 80),
        decision: "rejetee",
        raison,
      });
    }
  }

  return { retirees, details };
}
