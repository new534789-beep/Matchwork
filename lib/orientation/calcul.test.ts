import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  calculerPourFiliere,
  evaluerToutesFilieres,
  ReleveInvalide,
  validerReleve,
  type Releve,
} from "./calcul"
import { FILIERES_PUBLIQUES, filiereParId } from "./donnees"
import type { FilierePublique, Serie } from "./types"

function filiere(predicat: (f: FilierePublique) => boolean): FilierePublique {
  const f = FILIERES_PUBLIQUES.find(predicat)
  assert.ok(f, "filière introuvable dans le jeu de données")
  return f
}

const MEDECINE = filiere(
  (f) => f.filiere === "Médecine Humaine" && f.modeEntree === "classement",
)

describe("exemples travaillés du guide MESRS (page 9)", () => {
  // « Exemple 1 : Médecine Bac D, M = SVT*5 + Math*4 + SPCT*4 / 13 »
  it("Médecine, Bac D : (SVT×5 + Maths×4 + PCT×4) ÷ 13", () => {
    const releve: Releve = {
      serie: "D",
      lignes: [
        { matiere: "SVT", note: 15, coefficient: 5 },
        { matiere: "Mathématiques", note: 12, coefficient: 4 },
        { matiere: "PCT", note: 14, coefficient: 4 },
      ],
    }
    const r = calculerPourFiliere(releve, MEDECINE)
    assert.equal(r.statut, "calcule")
    if (r.statut !== "calcule") return

    assert.equal(r.sommeCoefficients, 13, "la somme des coefficients doit valoir 13")
    const attendu = (15 * 5 + 12 * 4 + 14 * 4) / 13
    assert.equal(r.moyenne, attendu)
    assert.deepEqual(
      r.matieresRetenues.map((m) => m.matiere).sort(),
      ["Mathématiques", "PCT", "SVT"],
    )
  })

  // « Exemple 2 : Médecine Bac C ; M = SVT*2 + Math*6 + SPCT*5 / 13 »
  it("Médecine, Bac C : (SVT×2 + Maths×6 + PCT×5) ÷ 13", () => {
    const releve: Releve = {
      serie: "C",
      lignes: [
        { matiere: "SVT", note: 11, coefficient: 2 },
        { matiere: "Mathématiques", note: 17, coefficient: 6 },
        { matiere: "PCT", note: 15, coefficient: 5 },
      ],
    }
    const r = calculerPourFiliere(releve, MEDECINE)
    assert.equal(r.statut, "calcule")
    if (r.statut !== "calcule") return

    assert.equal(r.sommeCoefficients, 13)
    assert.equal(r.moyenne, (11 * 2 + 17 * 6 + 15 * 5) / 13)
  })

  it("mêmes notes, coefficients de série différents : moyennes différentes", () => {
    const notes = { svt: 10, maths: 18, pct: 14 }
    const enD = calculerPourFiliere(
      {
        serie: "D",
        lignes: [
          { matiere: "SVT", note: notes.svt, coefficient: 5 },
          { matiere: "Mathématiques", note: notes.maths, coefficient: 4 },
          { matiere: "PCT", note: notes.pct, coefficient: 4 },
        ],
      },
      MEDECINE,
    )
    const enC = calculerPourFiliere(
      {
        serie: "C",
        lignes: [
          { matiere: "SVT", note: notes.svt, coefficient: 2 },
          { matiere: "Mathématiques", note: notes.maths, coefficient: 6 },
          { matiere: "PCT", note: notes.pct, coefficient: 5 },
        ],
      },
      MEDECINE,
    )
    assert.equal(enD.statut, "calcule")
    assert.equal(enC.statut, "calcule")
    if (enD.statut !== "calcule" || enC.statut !== "calcule") return
    // le profil est fort en maths : la série C, qui pèse plus les maths, le sert mieux
    assert.ok(enC.moyenne > enD.moyenne)
  })
})

describe("reconnaissance des libellés de matières", () => {
  it("accepte les libellés longs du relevé officiel", () => {
    const r = calculerPourFiliere(
      {
        serie: "D",
        lignes: [
          { matiere: "Sciences de la Vie et de la Terre", note: 15, coefficient: 5 },
          { matiere: "Maths", note: 12, coefficient: 4 },
          { matiere: "Physique-Chimie et Technologie", note: 14, coefficient: 4 },
        ],
      },
      MEDECINE,
    )
    assert.equal(r.statut, "calcule")
    if (r.statut !== "calcule") return
    assert.equal(r.moyenne, (15 * 5 + 12 * 4 + 14 * 4) / 13)
  })

  it("traite SPCT et PCT comme la même épreuve", () => {
    const r = calculerPourFiliere(
      {
        serie: "D",
        lignes: [
          { matiere: "SVT", note: 15, coefficient: 5 },
          { matiere: "Mathématiques", note: 12, coefficient: 4 },
          { matiere: "SPCT", note: 14, coefficient: 4 },
        ],
      },
      MEDECINE,
    )
    assert.equal(r.statut, "calcule")
  })
})

describe("refus de calculer plutôt que d'approximer", () => {
  it("refuse si une matière exigée manque au relevé", () => {
    const r = calculerPourFiliere(
      {
        serie: "D",
        lignes: [
          { matiere: "SVT", note: 15, coefficient: 5 },
          { matiere: "Mathématiques", note: 12, coefficient: 4 },
        ],
      },
      MEDECINE,
    )
    assert.equal(r.statut, "non-calculable")
    if (r.statut !== "non-calculable") return
    assert.match(r.raison, /absente du relevé/)
  })

  it("refuse pour une série non acceptée par la filière", () => {
    const r = calculerPourFiliere(
      { serie: "A1", lignes: [{ matiere: "Français", note: 14, coefficient: 3 }] },
      MEDECINE,
    )
    assert.equal(r.statut, "non-calculable")
    if (r.statut !== "non-calculable") return
    assert.match(r.raison, /non ouverte à la série A1/)
  })

  it("refuse pour une filière sur concours", () => {
    const concours = filiere((f) => f.modeEntree === "concours" && f.series.includes("D"))
    const r = calculerPourFiliere(
      {
        serie: "D",
        lignes: [
          { matiere: "SVT", note: 15, coefficient: 5 },
          { matiere: "PCT", note: 14, coefficient: 4 },
          { matiere: "Mathématiques", note: 12, coefficient: 4 },
        ],
      },
      concours,
    )
    assert.equal(r.statut, "non-calculable")
    if (r.statut !== "non-calculable") return
    assert.match(r.raison, /concours/)
  })

  it("refuse quand le guide est ambigu sur la filière", () => {
    const ambigue = FILIERES_PUBLIQUES.find(
      (f) => f.aVerifier && f.modeEntree === "classement" && f.series.length > 0,
    )
    assert.ok(ambigue, "aucune filière marquée aVerifier")
    const r = calculerPourFiliere(
      {
        serie: ambigue.series[0],
        lignes: [
          { matiere: "Français", note: 14, coefficient: 3 },
          { matiere: "Mathématiques", note: 12, coefficient: 4 },
          { matiere: "Anglais", note: 13, coefficient: 2 },
        ],
      },
      ambigue,
    )
    assert.equal(r.statut, "non-calculable")
    if (r.statut !== "non-calculable") return
    assert.match(r.raison, /ambiguë/)
  })
})

describe("validation du relevé", () => {
  const base = { matiere: "SVT", coefficient: 4 }

  it("rejette une note hors de 0-20", () => {
    assert.throws(
      () => validerReleve({ serie: "D", lignes: [{ ...base, note: 21 }] }),
      ReleveInvalide,
    )
  })

  it("rejette un coefficient nul ou négatif", () => {
    assert.throws(
      () => validerReleve({ serie: "D", lignes: [{ ...base, note: 12, coefficient: 0 }] }),
      ReleveInvalide,
    )
  })

  it("rejette une matière en double", () => {
    assert.throws(
      () =>
        validerReleve({
          serie: "D",
          lignes: [
            { matiere: "SVT", note: 12, coefficient: 4 },
            { matiere: "Sciences de la Vie et de la Terre", note: 15, coefficient: 5 },
          ],
        }),
      ReleveInvalide,
    )
  })

  it("rejette un relevé vide", () => {
    assert.throws(() => validerReleve({ serie: "D", lignes: [] }), ReleveInvalide)
  })
})

describe("règle DEAT : les trois épreuves écrites", () => {
  it("retient exactement les épreuves marquées écrites", () => {
    const deat = FILIERES_PUBLIQUES.find((f) =>
      Object.values(f.creneauxParSerie).includes("TOUTES_MATIERES_ECRITES"),
    )
    assert.ok(deat, "aucune filière avec règle DEAT")
    const serie = Object.entries(deat.creneauxParSerie).find(
      ([, v]) => v === "TOUTES_MATIERES_ECRITES",
    )![0] as Serie

    const r = calculerPourFiliere(
      {
        serie,
        lignes: [
          { matiere: "Agriculture générale", note: 14, coefficient: 4, epreuveEcrite: true },
          { matiere: "Zootechnie", note: 12, coefficient: 3, epreuveEcrite: true },
          { matiere: "Français", note: 11, coefficient: 2, epreuveEcrite: true },
          { matiere: "Oral de spécialité", note: 18, coefficient: 5 },
        ],
      },
      deat,
    )
    assert.equal(r.statut, "calcule")
    if (r.statut !== "calcule") return
    assert.equal(r.sommeCoefficients, 9, "l'oral ne doit pas entrer dans le calcul")
    assert.equal(r.moyenne, (14 * 4 + 12 * 3 + 11 * 2) / 9)
  })
})

describe("classement de toutes les filières", () => {
  const releve: Releve = {
    serie: "D",
    lignes: [
      { matiere: "SVT", note: 15, coefficient: 5 },
      { matiere: "Mathématiques", note: 18, coefficient: 4 },
      { matiere: "PCT", note: 14, coefficient: 4 },
      { matiere: "Français", note: 11, coefficient: 3 },
      { matiere: "Anglais", note: 13, coefficient: 2 },
      { matiere: "Histoire-Géographie", note: 10, coefficient: 2 },
      { matiere: "Philosophie", note: 9, coefficient: 2 },
    ],
  }

  it("n'écarte aucune filière ouverte à la série", () => {
    const res = evaluerToutesFilieres(releve)
    const attendu = FILIERES_PUBLIQUES.filter((f) => f.series.includes("D")).length
    assert.equal(res.length, attendu)
  })

  it("trie par moyenne décroissante, calculées en tête", () => {
    const res = evaluerToutesFilieres(releve)
    const calculees = res.filter((r) => r.resultat.statut === "calcule")
    assert.ok(calculees.length > 0, "aucune filière calculée")

    // les calculées occupent bien le début de la liste
    assert.ok(res.slice(0, calculees.length).every((r) => r.resultat.statut === "calcule"))

    for (let i = 1; i < calculees.length; i++) {
      const a = calculees[i - 1].resultat as { moyenne: number }
      const b = calculees[i].resultat as { moyenne: number }
      assert.ok(a.moyenne >= b.moyenne, "ordre décroissant rompu")
    }
  })

  it("donne des moyennes différentes selon la filière, à relevé identique", () => {
    const res = evaluerToutesFilieres(releve)
    const moyennes = new Set(
      res
        .filter((r) => r.resultat.statut === "calcule")
        .map((r) => (r.resultat as { moyenne: number }).moyenne.toFixed(4)),
    )
    // c'est tout l'intérêt de la section : le trio de matières change selon la filière
    assert.ok(moyennes.size > 1, "toutes les filières donnent la même moyenne")
  })

  it("produit une formule lisible", () => {
    const r = calculerPourFiliere(releve, MEDECINE)
    assert.equal(r.statut, "calcule")
    if (r.statut !== "calcule") return
    assert.match(r.formule, /÷ 13 = \d+\.\d{2}$/)
  })
})

describe("intégrité du jeu de données", () => {
  it("chaque identifiant est unique", () => {
    const ids = FILIERES_PUBLIQUES.map((f) => f.id)
    assert.equal(new Set(ids).size, ids.length)
  })

  it("chaque filière est retrouvable par son identifiant", () => {
    for (const f of FILIERES_PUBLIQUES) {
      assert.equal(filiereParId(f.id)?.id, f.id)
    }
  })

  it("toute filière calculable expose 3 créneaux pour ses séries calculables", () => {
    for (const f of FILIERES_PUBLIQUES) {
      if (!f.calculable) continue
      for (const s of f.seriesCalculables) {
        const r = f.creneauxParSerie[s]
        if (r === "TOUTES_MATIERES_ECRITES") continue
        assert.equal(r.length, 3, `${f.id} / ${s} : ${r.length} créneau(x)`)
      }
    }
  })

  it("aucun quota négatif", () => {
    for (const f of FILIERES_PUBLIQUES) {
      assert.ok((f.quotaBourse ?? 0) >= 0, f.id)
      assert.ok((f.quotaAideFpp ?? 0) >= 0, f.id)
    }
  })
})
