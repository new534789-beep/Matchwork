import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { normaliserExtraction } from "./extraction-releve"
import { matieresUtiles } from "./vocabulaire"

describe("vocabulaire dérivé du guide", () => {
  it("ne demande que les matières qui peuvent influer sur une moyenne", () => {
    const d = matieresUtiles("D")
    assert.deepEqual(
      [...d].sort(),
      ["Anglais", "Français", "Histoire-Géographie", "Mathématiques", "PCT", "Philosophie", "SVT"],
    )
  })

  it("classe les matières les plus déterminantes en premier", () => {
    const d = matieresUtiles("D")
    // en série D, Maths / PCT / SVT reviennent dans bien plus de filières
    // que la philosophie : elles doivent ouvrir la liste
    assert.ok(d.indexOf("Mathématiques") < d.indexOf("Philosophie"))
  })

  it("adapte la liste à la série", () => {
    assert.ok(matieresUtiles("G2").includes("Économie"))
    assert.ok(!matieresUtiles("D").includes("Économie"))
  })
})

describe("normalisation : refus d'inventer", () => {
  it("garde une valeur illisible à null plutôt que de la combler", () => {
    const r = normaliserExtraction(
      {
        lignes: [
          { matiere: "SVT", note: 14, coefficient: null },
          { matiere: "Mathématiques", note: null, coefficient: 4 },
        ],
      },
      "D",
    )
    assert.equal(r.lignes[0].coefficient, null)
    assert.equal(r.lignes[1].note, null)
    assert.ok(r.avertissements.some((a) => a.includes("illisible")))
  })

  it("rejette une note hors de 0-20", () => {
    const r = normaliserExtraction(
      { lignes: [{ matiere: "SVT", note: 45, coefficient: 4 }] },
      "D",
    )
    assert.equal(r.lignes[0].note, null)
  })

  it("rejette un coefficient aberrant", () => {
    const r = normaliserExtraction(
      { lignes: [{ matiere: "SVT", note: 12, coefficient: 250 }] },
      "D",
    )
    assert.equal(r.lignes[0].coefficient, null)
  })

  it("écarte une matière que le guide n'utilise pas pour cette série", () => {
    const r = normaliserExtraction(
      {
        lignes: [
          { matiere: "SVT", note: 12, coefficient: 4 },
          { matiere: "Éducation physique et sportive", note: 18, coefficient: 1 },
        ],
      },
      "D",
    )
    assert.equal(r.lignes.length, 1)
    assert.equal(r.lignes[0].matiere, "SVT")
  })

  it("accepte la virgule décimale des relevés français", () => {
    const r = normaliserExtraction(
      { lignes: [{ matiere: "SVT", note: "12,5", coefficient: "4" }] },
      "D",
    )
    assert.equal(r.lignes[0].note, 12.5)
    assert.equal(r.lignes[0].coefficient, 4)
  })

  it("reconnaît les libellés longs du relevé", () => {
    const r = normaliserExtraction(
      {
        lignes: [
          { matiere: "Sciences de la Vie et de la Terre", note: 13, coefficient: 5 },
          { matiere: "Physique-Chimie et Technologie", note: 11, coefficient: 4 },
        ],
      },
      "D",
    )
    assert.deepEqual(r.lignes.map((l) => l.matiere), ["SVT", "PCT"])
  })

  it("ne garde qu'une ligne par matière", () => {
    const r = normaliserExtraction(
      {
        lignes: [
          { matiere: "SVT", note: 13, coefficient: 5 },
          { matiere: "Sciences de la Vie et de la Terre", note: 9, coefficient: 5 },
        ],
      },
      "D",
    )
    assert.equal(r.lignes.length, 1)
    assert.equal(r.lignes[0].note, 13)
  })

  it("survit à une réponse vide ou malformée", () => {
    const r = normaliserExtraction({}, "D")
    assert.deepEqual(r.lignes, [])
    assert.equal(r.moyenneGenerale, null)
    assert.ok(r.avertissements.length > 0)
  })

  it("signale les matières absentes de la photo", () => {
    const r = normaliserExtraction(
      { lignes: [{ matiere: "SVT", note: 13, coefficient: 5 }] },
      "D",
    )
    assert.ok(r.avertissements.some((a) => a.includes("non trouvées")))
  })
})

describe("normalisation : cohérence du document", () => {
  it("alerte si la série lue diffère de la série déclarée", () => {
    const r = normaliserExtraction(
      { lignes: [], serieLue: "C" },
      "D",
    )
    assert.ok(r.avertissements.some((a) => a.includes("ne correspond pas")))
  })

  it("n'alerte pas quand les séries concordent", () => {
    const r = normaliserExtraction(
      { lignes: [{ matiere: "SVT", note: 13, coefficient: 5 }], serieLue: "Série D" },
      "D",
    )
    assert.ok(!r.avertissements.some((a) => a.includes("ne correspond pas")))
  })

  it("reprend la moyenne générale imprimée sans jamais la recalculer", () => {
    const r = normaliserExtraction(
      {
        lignes: [
          { matiere: "SVT", note: 20, coefficient: 5 },
          { matiere: "Mathématiques", note: 20, coefficient: 4 },
        ],
        moyenneGenerale: 10.5,
      },
      "D",
    )
    assert.equal(r.moyenneGenerale, 10.5)
  })
})
