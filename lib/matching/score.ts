type Profil = {
  formations: string;
  experiences: string;
  competences: string;
  langues: string;
  objectifs: string | null;
  nationalite: string | null;
};

type Opportunite = {
  type: string;
  description: string;
  conditions: string | null;
  exigenceLangue: string | null;
  piecesExigees: string;
};

function parseJson<T>(s: string | null | undefined, fb: T): T {
  try { return s ? JSON.parse(s) : fb; } catch { return fb; }
}

function norm(s: unknown): string {
  return typeof s === "string" ? s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : "";
}

function motsCles(texte: string): Set<string> {
  return new Set(norm(texte).split(/\W+/).filter((m) => m.length > 2));
}

export function calculerScore(profil: Profil, opp: Opportunite): number {
  let score = 0;
  let poids = 0;

  // 1. Correspondance langue (25 pts)
  poids += 25;
  if (opp.exigenceLangue) {
    const langues: Array<{ langue: string; niveau: string }> = parseJson(profil.langues, []);
    const langueNorm = norm(opp.exigenceLangue);
    const match = langues.some((l) => {
      const ln = norm(l.langue);
      return langueNorm.includes(ln) || ln.includes(langueNorm);
    });
    if (match) score += 25;
  } else {
    score += 20;
  }

  // 2. Correspondance domaine/formation (30 pts)
  poids += 30;
  const formations: Array<{ diplome: string; domaine?: string }> = parseJson(profil.formations, []);
  const competences: string[] = parseJson(profil.competences, []);
  const motsProfil = new Set<string>();
  for (const f of formations) {
    for (const m of motsCles(f.diplome)) motsProfil.add(m);
    if (f.domaine) for (const m of motsCles(f.domaine)) motsProfil.add(m);
  }
  for (const c of competences) for (const m of motsCles(c)) motsProfil.add(m);
  if (profil.objectifs) for (const m of motsCles(profil.objectifs)) motsProfil.add(m);

  const motsOpp = motsCles(opp.description + " " + (opp.conditions || ""));
  let intersect = 0;
  for (const m of motsProfil) if (motsOpp.has(m)) intersect++;
  const ratio = motsProfil.size > 0 ? Math.min(intersect / Math.min(motsProfil.size, 8), 1) : 0;
  score += Math.round(ratio * 30);

  // 3. Expérience pertinente (20 pts)
  poids += 20;
  const experiences: Array<{ poste: string; description?: string }> = parseJson(profil.experiences, []);
  if (experiences.length > 0) {
    const motsExp = new Set<string>();
    for (const e of experiences) {
      for (const m of motsCles(e.poste)) motsExp.add(m);
      if (e.description) for (const m of motsCles(e.description)) motsExp.add(m);
    }
    let expIntersect = 0;
    for (const m of motsExp) if (motsOpp.has(m)) expIntersect++;
    const expRatio = motsExp.size > 0 ? Math.min(expIntersect / Math.min(motsExp.size, 6), 1) : 0;
    score += Math.round(expRatio * 20);
  }

  // 4. Complétude des pièces (15 pts)
  poids += 15;
  const pieces: Array<{ nom: string }> = parseJson(opp.piecesExigees, []);
  if (pieces.length === 0) {
    score += 15;
  } else {
    score += Math.round((Math.min(formations.length, 2) / 2) * 15);
  }

  // 5. Type d'opportunité × objectifs (10 pts)
  poids += 10;
  if (profil.objectifs) {
    const obj = norm(profil.objectifs);
    const typeMap: Record<string, string[]> = {
      BOURSE: ["bourse", "etude", "universite", "master", "licence", "doctorat"],
      EMPLOI: ["emploi", "travail", "poste", "carriere", "salaire"],
      STAGE: ["stage", "experience", "pratique"],
      FORMATION: ["formation", "apprendre", "competence", "certif"],
      ADMISSION: ["admission", "inscription", "universite", "ecole"],
    };
    const kws = typeMap[opp.type] || [];
    if (kws.some((k) => obj.includes(k))) score += 10;
  }

  return poids > 0 ? Math.round((score / poids) * 100) : 50;
}
