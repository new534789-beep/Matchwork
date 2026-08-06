/**
 * Contenu du parcours d'orientation.
 *
 * Le candidat ne rédige rien : il choisit parmi des cartes, puis photographie
 * son relevé. Les options de séries techniques sont dérivées du guide, pas
 * écrites à la main, pour rester synchronisées avec les données.
 */

import { FILIERES_PUBLIQUES } from "./donnees"
import type { Serie } from "./types"

export type Option<T extends string = string> = {
  valeur: T
  titre: string
  detail?: string
}

/* ------------------------------------------------------------------ diplôme */

export type Diplome = "bac" | "dt" | "deat"

export const DIPLOMES: Option<Diplome>[] = [
  { valeur: "bac", titre: "Baccalauréat général", detail: "Séries A à G" },
  { valeur: "dt", titre: "Diplôme de Technicien", detail: "Enseignement technique (DT)" },
  {
    valeur: "deat",
    titre: "Diplôme d'Études Agricoles et Tropicales",
    detail: "Enseignement agricole (DEAT)",
  },
]

/* ------------------------------------------------------------------- séries */

const LIBELLES_SERIES: Record<string, string> = {
  A1: "Lettres et langues",
  A2: "Lettres et sciences humaines",
  B: "Sciences sociales et économiques",
  C: "Mathématiques et sciences physiques",
  D: "Mathématiques et sciences de la nature",
  E: "Mathématiques et technique",
  EA: "Eau et assainissement",
  F1: "Construction mécanique",
  F2: "Électronique",
  F3: "Électrotechnique",
  F4: "Génie civil",
  G1: "Techniques administratives",
  G2: "Techniques quantitatives de gestion",
  G3: "Techniques commerciales",
}

const ORDRE_GENERALES = [
  "A1", "A2", "B", "C", "D", "E", "EA",
  "F1", "F2", "F3", "F4", "G1", "G2", "G3",
]

/** Nombre de filières du guide ouvertes à une série. */
export function nombreFilieresOuvertes(serie: Serie): number {
  return FILIERES_PUBLIQUES.filter((f) => f.series.includes(serie)).length
}

/**
 * Filières dont la moyenne de classement peut réellement être calculée pour
 * cette série. Sept spécialités DT n'en ont aucune : mieux vaut le dire avant
 * que le candidat ne photographie son relevé pour rien.
 */
export function nombreFilieresCalculables(serie: Serie): number {
  return FILIERES_PUBLIQUES.filter(
    (f) => f.series.includes(serie) && f.modeEntree === "classement" && !f.aVerifier,
  ).length
}

/**
 * Développement des abréviations de spécialités techniques.
 *
 * On ne développe que ce que le guide établit — sa page « Sigles », ou un
 * libellé écrit en clair ailleurs dans le document. Les abréviations restantes
 * (OG, DPB, IMI, DWM, PM, CEMS, FM, STI…) s'affichent telles qu'imprimées :
 * mieux vaut un sigle que le candidat reconnaît qu'un intitulé inventé.
 */
const LIBELLES_TECHNIQUES: Record<string, string> = {
  "DT/MA": "Maintenance des appareils",
  "DT/EFS": "Économie familiale et sociale",
  "DT/HR": "Hôtellerie-restauration",
  "DT/MAO": "Musique assistée par ordinateur",
  "DT/BTP": "Bâtiment et travaux publics",
  "DT/EAp": "Électrotechnique appliquée",
  "DT/Electrotech": "Électrotechnique",
  "DT/Froid": "Froid et climatisation",
  "DT/Electricité": "Électricité",
  "DEAT/AER": "Aménagement et équipement rural",
  "DEAT/PA": "Production animale",
  "DEAT/PV": "Production végétale",
}

/**
 * Un sigle est court et majoritairement en capitales : « BTP », « EAp », « MA ».
 * « Froid » ou « Electrotech » sont des mots, pas des sigles.
 */
function estSigle(code: string): boolean {
  if (code.length > 5 || !/^[A-Za-z]+$/.test(code)) return false
  const capitales = code.replace(/[^A-Z]/g, "").length
  return capitales / code.length >= 0.5
}

/** « 1 filière », « 12 filières ». */
export function compterFilieres(n: number): string {
  return n === 0 ? "Aucune filière" : `${n} filière${n > 1 ? "s" : ""}`
}

function detailSerie(serie: Serie): string {
  const n = nombreFilieresOuvertes(serie)
  return n === 0 ? "Aucune filière recensée" : `${compterFilieres(n)} ouvertes`
}

export function seriesPourDiplome(diplome: Diplome): Option<Serie>[] {
  if (diplome === "bac") {
    return ORDRE_GENERALES.filter((s) => nombreFilieresOuvertes(s as Serie) > 0).map(
      (s) => ({
        valeur: s as Serie,
        titre: `Série ${s}`,
        detail: LIBELLES_SERIES[s] ?? detailSerie(s as Serie),
      }),
    )
  }

  const prefixe = diplome === "dt" ? "DT/" : "DEAT/"
  const vues = new Map<string, number>()
  for (const f of FILIERES_PUBLIQUES) {
    for (const s of f.series) {
      if (s.startsWith(prefixe)) vues.set(s, (vues.get(s) ?? 0) + 1)
    }
  }
  return [...vues.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
    .map(([s, n]) => {
      const option = s.slice(prefixe.length)
      const developpe = LIBELLES_TECHNIQUES[s]
      return {
        valeur: s as Serie,
        titre:
          option === "TOUTES"
            ? "Toutes spécialités"
            : (developpe ?? option),
        // on rappelle le sigle du guide, pour que le candidat retrouve ce qui
        // est écrit sur son diplôme — sauf quand ce n'est pas un sigle
        detail:
          nombreFilieresCalculables(s as Serie) === 0
            ? `${compterFilieres(n)} · aucune moyenne calculable`
            : developpe && estSigle(option)
              ? `${option} · ${compterFilieres(n)}`
              : compterFilieres(n),
      }
    })
}

/* ---------------------------------------------------------------- intérêts */

export type Interet =
  | "sante" | "ingenierie" | "agriculture" | "droit" | "gestion"
  | "lettres" | "arts" | "sciences" | "environnement" | "enseignement"
  | "numerique" | "sport"

export const INTERETS: Option<Interet>[] = [
  { valeur: "sante", titre: "Santé" },
  { valeur: "ingenierie", titre: "Ingénierie et technique" },
  { valeur: "agriculture", titre: "Agriculture" },
  { valeur: "droit", titre: "Droit et administration" },
  { valeur: "gestion", titre: "Économie et gestion" },
  { valeur: "lettres", titre: "Lettres et langues" },
  { valeur: "arts", titre: "Arts et culture" },
  { valeur: "sciences", titre: "Sciences fondamentales" },
  { valeur: "environnement", titre: "Environnement" },
  { valeur: "enseignement", titre: "Enseignement" },
  { valeur: "numerique", titre: "Numérique et TIC" },
  { valeur: "sport", titre: "Sport" },
]

/**
 * Mots-clés servant à rapprocher une filière d'un centre d'intérêt.
 * Sert uniquement à mettre en avant, jamais à masquer une filière.
 */
export const MOTS_CLES_INTERET: Record<Interet, string[]> = {
  sante: ["santé", "médec", "infirm", "obstétr", "pharmac", "hygiène", "épidémi", "nutrition", "sage-femme"],
  ingenierie: ["génie", "ingénieur", "mécan", "électro", "industriel", "maintenance", "travaux", "construction", "polytech"],
  agriculture: ["agro", "agricole", "agronom", "élevage", "zootech", "végétal", "aquacult", "horticult", "foresterie", "rural"],
  droit: ["droit", "juridique", "administration", "politique", "magistrat", "diplomat"],
  gestion: ["économ", "gestion", "comptab", "financ", "commerc", "marketing", "banque", "assurance", "logistique", "statistique"],
  lettres: ["lettres", "langue", "anglais", "espagnol", "allemand", "arabe", "chinois", "linguist", "traduction", "interpr"],
  arts: ["art", "musique", "cinéma", "audiovisuel", "patrimoine", "archéolog", "culturel", "design", "théâtre"],
  sciences: ["mathémat", "physique", "chimie", "biolog", "sciences", "préparatoire", "géolog"],
  environnement: ["environnement", "climat", "eau", "assainissement", "écolog", "géograph", "territoire", "aménagement"],
  enseignement: ["normale", "enseign", "éducation", "didactique", "formation des"],
  numerique: ["informat", "numérique", "réseau", "logiciel", "télécom", "web", "données", "digital"],
  sport: ["sport", "physique et sportive", "eps", "jeunesse"],
}

/* --------------------------------------------------------------- priorité */

export type Priorite = "bourse" | "passion" | "emploi" | "proximite"

export const PRIORITES: Option<Priorite>[] = [
  {
    valeur: "bourse",
    titre: "Obtenir une bourse",
    detail: "Mettre en avant les filières où les quotas sont les plus larges",
  },
  {
    valeur: "passion",
    titre: "Faire ce qui me plaît",
    detail: "Mettre en avant mes centres d'intérêt",
  },
  {
    valeur: "emploi",
    titre: "Trouver un emploi",
    detail: "Mettre en avant les filières aux débouchés les plus nombreux",
  },
  {
    valeur: "proximite",
    titre: "Rester près de chez moi",
    detail: "Mettre en avant les établissements de ma zone",
  },
]

/* ------------------------------------------------------------------ zones */

export type Zone = string

/** Universités du guide, avec le nombre de filières de chacune. */
export function zonesDisponibles(): Option<Zone>[] {
  const vues = new Map<string, number>()
  for (const f of FILIERES_PUBLIQUES) {
    vues.set(f.universite, (vues.get(f.universite) ?? 0) + 1)
  }
  const liste: Option<Zone>[] = [...vues.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([u, n]) => ({ valeur: u, titre: u, detail: compterFilieres(n) }))
  return [
    { valeur: "*", titre: "Peu importe", detail: "Voir toutes les universités" },
    ...liste,
  ]
}

/* ------------------------------------------------------------- préférences */

export type Preferences = {
  diplome: Diplome
  serie: Serie
  interets: Interet[]
  priorite: Priorite
  zone: Zone
}
