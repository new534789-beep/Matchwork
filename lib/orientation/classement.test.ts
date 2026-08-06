import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { classer, resumer } from "./classement"
import type { Releve } from "./calcul"
import { mentionPour, pointsVersMentionSuivante } from "./mention"
import type { Preferences, Priorite } from "./questionnaire"

const RELEVE: Releve = {
  serie: "D",
  lignes: [
    { matiere: "SVT", note: 11, coefficient: 5 },
    { matiere: "Mathématiques", note: 18, coefficient: 4 },
    { matiere: "PCT", note: 16, coefficient: 4 },
    { matiere: "Français", note: 10, coefficient: 3 },
    { matiere: "Anglais", note: 13, coefficient: 2 },
    { matiere: "Histoire-Géographie", note: 9, coefficient: 2 },
    { matiere: "Philosophie", note: 9, coefficient: 2 },
  ],
}

function prefs(priorite: Priorite, extra: Partial<Preferences> = {}): Preferences {
  return { diplome: "bac", serie: "D", interets: [], priorite, zone: "*", ...extra }
}

function moyennes(priorite: Priorite, extra?: Partial<Preferences>) {
  return classer(RELEVE, prefs(priorite, extra))
    .filter((c) => c.resultat.statut === "calcule")
    .map((c) => (c.resultat as { moyenne: number }).moyenne)
}

describe("la moyenne reste le critère premier", () => {
  it("l'ordre décroissant des moyennes est identique quelle que soit la priorité", () => {
    const reference = moyennes("bourse")
    for (const p of ["passion", "emploi", "proximite"] as Priorite[]) {
      assert.deepEqual(moyennes(p), reference, `la priorité ${p} a modifié les moyennes`)
    }
  })

  it("les moyennes restent triées décroissantes", () => {
    const m = moyennes("emploi")
    for (let i = 1; i < m.length; i++) {
      assert.ok(m[i - 1] >= m[i], "ordre décroissant rompu")
    }
  })
})

describe("la priorité départage les ex aequo", () => {
  // Le guide impose souvent le même trio de matières : un candidat obtient peu
  // de moyennes distinctes, avec de gros paquets à égalité. L'ordre interne à
  // ces paquets est donc le classement réellement lu.
  it("un relevé produit bien de gros paquets ex aequo", () => {
    const m = moyennes("bourse")
    const distinctes = new Set(m.map((x) => x.toFixed(2)))
    assert.ok(
      m.length > distinctes.size * 3,
      `${m.length} filières pour ${distinctes.size} moyennes : paquets attendus`,
    )
  })

  it("« bourse » place le plus gros quota en tête de son paquet", () => {
    const c = classer(RELEVE, prefs("bourse")).filter(
      (x) => x.resultat.statut === "calcule",
    )
    const paquet = c.filter(
      (x) =>
        (x.resultat as { moyenne: number }).moyenne.toFixed(2) ===
        (c[0].resultat as { moyenne: number }).moyenne.toFixed(2),
    )
    assert.ok(paquet.length > 1, "paquet trop petit pour tester")
    const quotas = paquet.map((x) => x.filiere.quotaBourse ?? 0)
    assert.deepEqual(quotas, [...quotas].sort((a, b) => b - a))
  })

  it("« emploi » place le plus de débouchés en tête de son paquet", () => {
    const c = classer(RELEVE, prefs("emploi")).filter(
      (x) => x.resultat.statut === "calcule",
    )
    const cle = (x: (typeof c)[0]) =>
      (x.resultat as { moyenne: number }).moyenne.toFixed(2)
    const paquet = c.filter((x) => cle(x) === cle(c[0]))
    const debouches = paquet.map((x) => x.filiere.debouches.length)
    assert.deepEqual(debouches, [...debouches].sort((a, b) => b - a))
  })

  it("changer de priorité change réellement l'ordre affiché", () => {
    const ids = (p: Priorite) => classer(RELEVE, prefs(p)).map((c) => c.filiere.id)
    assert.notDeepEqual(ids("bourse"), ids("emploi"))
  })

  it("« proximité » remonte l'université choisie à moyenne égale", () => {
    const cible = "Université de Parakou"
    const c = classer(RELEVE, prefs("proximite", { zone: cible })).filter(
      (x) => x.resultat.statut === "calcule",
    )
    const cle = (x: (typeof c)[0]) =>
      (x.resultat as { moyenne: number }).moyenne.toFixed(2)
    // dans chaque paquet, aucune filière hors zone ne précède une filière en zone
    let paquetCourant = cle(c[0])
    let vuHorsZone = false
    for (const x of c) {
      if (cle(x) !== paquetCourant) {
        paquetCourant = cle(x)
        vuHorsZone = false
      }
      const enZone = x.filiere.universite === cible
      if (enZone) assert.ok(!vuHorsZone, `${x.filiere.filiere} en zone après du hors-zone`)
      else vuHorsZone = true
    }
  })

  it("le classement reste déterministe à préférences égales", () => {
    const a = classer(RELEVE, prefs("bourse")).map((c) => c.filiere.id)
    const b = classer(RELEVE, prefs("bourse")).map((c) => c.filiere.id)
    assert.deepEqual(a, b)
  })
})

describe("aucune filière n'est écartée", () => {
  it("le total est le même quelle que soit la priorité", () => {
    const total = (p: Priorite) => resumer(classer(RELEVE, prefs(p))).total
    assert.equal(total("bourse"), total("passion"))
    assert.equal(total("bourse"), total("emploi"))
  })

  it("les filières sans moyenne sont conservées, après les calculées", () => {
    const c = classer(RELEVE, prefs("bourse"))
    const s = resumer(c)
    assert.ok(s.total > s.calculees, "aucune filière sans moyenne")
    assert.ok(
      c.slice(0, s.calculees).every((x) => x.resultat.statut === "calcule"),
      "une filière sans moyenne s'est glissée parmi les calculées",
    )
  })

  it("les rangs sont consécutifs à partir de 1", () => {
    const rangs = classer(RELEVE, prefs("bourse"))
      .map((c) => c.rang)
      .filter((r): r is number => r !== null)
    assert.deepEqual(rangs, rangs.map((_, i) => i + 1))
  })
})

describe("mention du baccalauréat", () => {
  it("applique les seuils officiels", () => {
    assert.equal(mentionPour(17), "Très bien")
    assert.equal(mentionPour(16), "Très bien")
    assert.equal(mentionPour(15.99), "Bien")
    assert.equal(mentionPour(14), "Bien")
    assert.equal(mentionPour(12), "Assez bien")
    assert.equal(mentionPour(10), "Passable")
    assert.equal(mentionPour(9.5), "Insuffisant")
  })

  it("indique ce qui manquait pour la mention suivante", () => {
    const r = pointsVersMentionSuivante(11.5)
    assert.equal(r?.mention, "Assez bien")
    assert.equal(r?.ecart, 0.5)
  })

  it("ne propose rien au-delà de Très bien", () => {
    assert.equal(pointsVersMentionSuivante(18), null)
  })
})
