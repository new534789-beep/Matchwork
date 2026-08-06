import { hasMistralKey, getMistralClient, nombreClesMistral, MODELS as MODELES_MISTRAL } from "@/lib/ia/mistral";
import { hasGeminiKey, getGeminiClient, MODELS as MODELES_GEMINI } from "@/lib/ia/gemini";
import { clefCache, lireCache, ecrireCache } from "@/lib/ia/cache";

/**
 * Point d'entrée unique de tous les appels IA qui attendent du JSON.
 *
 * Les appelants ne choisissent plus un fournisseur : ils décrivent une tâche et
 * un niveau d'exigence. Le routeur essaie les fournisseurs disponibles dans
 * l'ordre (paliers gratuits d'abord), bascule sur le suivant en cas de quota
 * dépassé, de panne ou de réponse inexploitable, et sert depuis le cache quand
 * le même prompt a déjà été payé.
 *
 * Le contrat est celui qu'avaient déjà tous les modules d'ingestion : `null`
 * quand rien d'exploitable ne sort. Aucun appelant n'a besoin de gérer une
 * erreur — l'ingestion continue sans IA plutôt que de s'arrêter.
 */

/** "leger" : traduction, extraction ciblée, classification. "complexe" : lecture complète d'une offre. */
export type NiveauIA = "leger" | "complexe";

export type OptionsAppelJSON = {
  /** Identifiant stable de la tâche (ex. "traduction-offre") : sert de namespace de cache et de trace. */
  tache: string;
  system: string;
  user: string;
  niveau: NiveauIA;
  temperature?: number;
  /** false pour les contenus personnels (lettre, CV) qui ne doivent jamais être resservis. */
  cache?: boolean;
};

type Fournisseur = {
  nom: string;
  disponible: () => boolean;
  /** Nombre de tentatives : Mistral fait tourner ses clés, chaque essai en prend une autre. */
  essais: () => number;
  appeler: (o: OptionsAppelJSON) => Promise<string>;
};

const FOURNISSEURS: Fournisseur[] = [
  {
    nom: "gemini",
    disponible: hasGeminiKey,
    essais: () => 1,
    appeler: async (o) => {
      const client = getGeminiClient();
      const modele = client.getGenerativeModel({
        model: o.niveau === "complexe" ? MODELES_GEMINI.complexe : MODELES_GEMINI.leger,
        systemInstruction: o.system,
        generationConfig: {
          responseMimeType: "application/json",
          ...(o.temperature !== undefined ? { temperature: o.temperature } : {}),
        },
      });
      const resultat = await modele.generateContent(o.user);
      return resultat.response.text() ?? "";
    },
  },
  {
    nom: "mistral",
    disponible: hasMistralKey,
    essais: () => Math.min(nombreClesMistral(), 3),
    appeler: async (o) => {
      const client = getMistralClient();
      const resultat = await client.chat.complete({
        model: o.niveau === "complexe" ? MODELES_MISTRAL.large : MODELES_MISTRAL.small,
        ...(o.temperature !== undefined ? { temperature: o.temperature } : {}),
        messages: [
          { role: "system", content: o.system },
          { role: "user", content: o.user },
        ],
        responseFormat: { type: "json_object" },
      });
      return texteDuContenu(resultat.choices?.[0]?.message?.content);
    },
  },
];

/** Le SDK Mistral renvoie soit une chaîne, soit une liste de blocs de contenu. */
function texteDuContenu(contenu: unknown): string {
  if (typeof contenu === "string") return contenu;
  if (Array.isArray(contenu)) {
    return contenu
      .map((bloc) => (bloc && typeof bloc === "object" && "text" in bloc ? String((bloc as { text: unknown }).text ?? "") : ""))
      .join("");
  }
  return "";
}

/**
 * Ordre des fournisseurs, réglable sans toucher au code via
 * IA_ORDRE_FOURNISSEURS (ex. "mistral,gemini"). Par défaut on commence par le
 * palier gratuit de Gemini et Mistral ne sert que de secours.
 */
function fournisseursOrdonnes(): Fournisseur[] {
  const ordre = (process.env.IA_ORDRE_FOURNISSEURS ?? "gemini,mistral")
    .split(",")
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean);
  const classes = ordre
    .map((nom) => FOURNISSEURS.find((f) => f.nom === nom))
    .filter((f): f is Fournisseur => !!f);
  // Un fournisseur absent de la liste reste utilisable en dernier recours.
  const restants = FOURNISSEURS.filter((f) => !classes.includes(f));
  return [...classes, ...restants].filter((f) => f.disponible());
}

/** Au moins un fournisseur est configuré. */
export function iaDisponible(): boolean {
  return fournisseursOrdonnes().length > 0;
}

export function fournisseursActifs(): string[] {
  return fournisseursOrdonnes().map((f) => f.nom);
}

/**
 * Isole le premier objet JSON d'une réponse modèle, en tolérant les fences
 * ```json que certains modèles ajoutent malgré la consigne. Renvoie null si
 * rien d'exploitable — le routeur traite ça comme un échec du fournisseur et
 * passe au suivant.
 */
export function parserJsonDefensif(brut: string): Record<string, unknown> | null {
  const sansFences = brut.replace(/```(?:json)?/gi, "").trim();
  const match = sansFences.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const valeur = JSON.parse(match[0]) as unknown;
    if (!valeur || typeof valeur !== "object" || Array.isArray(valeur)) return null;
    return valeur as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Une bascule silencieuse est un piège : on croit tourner sur le palier gratuit
 * alors que le fournisseur payant encaisse tout. On trace donc chaque échec —
 * jamais le contenu du prompt, seulement la tâche et la raison.
 */
function signalerEchec(fournisseur: string, tache: string, raison: unknown): void {
  const message = raison instanceof Error ? raison.message : String(raison);
  console.warn(`[ia] ${fournisseur} a échoué sur « ${tache} » → ${message.slice(0, 200)}`);
}

export async function appelJSON<T = Record<string, unknown>>(
  options: OptionsAppelJSON,
): Promise<T | null> {
  const fournisseurs = fournisseursOrdonnes();
  if (!fournisseurs.length) return null;
  if (!options.system.trim() || !options.user.trim()) return null;

  const avecCache = options.cache !== false;
  const cle = clefCache({
    tache: options.tache,
    niveau: options.niveau,
    system: options.system,
    user: options.user,
  });

  if (avecCache) {
    const enCache = await lireCache(cle);
    if (enCache) return enCache as T;
  }

  for (const fournisseur of fournisseurs) {
    const essais = Math.max(1, fournisseur.essais());
    for (let essai = 0; essai < essais; essai++) {
      let brut: string;
      try {
        brut = await fournisseur.appeler(options);
      } catch (e) {
        // quota, panne, réseau : on tente la clé ou le fournisseur suivant
        signalerEchec(fournisseur.nom, options.tache, e);
        continue;
      }
      const parsee = parserJsonDefensif(brut);
      if (!parsee) {
        signalerEchec(fournisseur.nom, options.tache, "réponse JSON inexploitable");
        continue;
      }
      if (avecCache) await ecrireCache(cle, options.tache, parsee, fournisseur.nom);
      return parsee as T;
    }
  }

  return null;
}
