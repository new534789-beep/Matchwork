export type Piece = { nom: string; obligatoire?: boolean }

export function joursRestants(date: Date | null): number | null {
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000)
}

export function norm(s: unknown): string {
  // Retire les accents (plage des diacritiques combinants U+0300–U+036F)
  return typeof s === "string" ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ""
}

export function parseJSON<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback }
  catch { return fallback }
}

export function jsonLen(s: string | null | undefined): number {
  const arr = parseJSON<unknown[]>(s, [])
  return Array.isArray(arr) ? arr.length : 0
}

export const TYPE_KEYWORDS: Record<string, string[]> = {
  DIPLOME: ["diplome", "attestation", "licence", "master", "baccalaureat", "bac", "doctorat", "certificat de scolarite"],
  RELEVE_NOTES: ["releve", "note", "bulletin", "transcript", "resultat"],
  ACTE_NAISSANCE: ["naissance", "acte de naissance", "extrait de naissance"],
  PIECE_IDENTITE: ["identite", "passeport", "cni", "carte nationale", "carte d'identite"],
  JUSTIFICATIF_LANGUE: ["langue", "delf", "dalf", "ielts", "toefl", "tcf", "anglais", "francais", "certification de langue"],
  LETTRE_RECO: ["recommandation", "reference", "reco"],
}
export const GENERE_KEYWORDS = ["cv", "curriculum", "lettre de motivation", "lettre motivation", "motivation"]

export function calculerConformite(pieces: Piece[], typesPresents: Set<string>, dossierGenere: boolean) {
  if (!pieces.length) return { total: 0, couvertes: 0, pct: 100, manquantes: [] as string[] }
  let couvertes = 0
  const manquantes: string[] = []
  for (const p of pieces) {
    const n = norm(p.nom ?? "")
    if (GENERE_KEYWORDS.some((k) => n.includes(k))) {
      if (dossierGenere) couvertes++; else manquantes.push(p.nom)
      continue
    }
    let matched = false
    for (const [type, kws] of Object.entries(TYPE_KEYWORDS)) {
      if (kws.some((k) => n.includes(k)) && typesPresents.has(type)) { matched = true; break }
    }
    if (matched) couvertes++; else manquantes.push(p.nom)
  }
  return { total: pieces.length, couvertes, pct: Math.round((couvertes / pieces.length) * 100), manquantes }
}

export function calculerProfilPct(profil: {
  bio: string | null; objectifs: string | null; tonSouhaite: string | null
  formations: string; experiences: string; competences: string; langues: string
} | null): number {
  if (!profil) return 0
  const champs = [
    !!profil.bio?.trim(),
    !!profil.objectifs?.trim(),
    !!profil.tonSouhaite?.trim(),
    jsonLen(profil.formations) > 0,
    jsonLen(profil.experiences) > 0,
    jsonLen(profil.competences) > 0,
    jsonLen(profil.langues) > 0,
  ]
  return Math.round((champs.filter(Boolean).length / champs.length) * 100)
}
