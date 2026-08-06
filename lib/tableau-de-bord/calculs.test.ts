import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { calculerConformite, calculerProfilPct, joursRestants, jsonLen, parseJSON } from "./calculs"

describe("joursRestants", () => {
  it("renvoie null sans date", () => {
    assert.equal(joursRestants(null), null)
  })
  it("renvoie un nombre négatif pour une date passée", () => {
    assert.ok((joursRestants(new Date(Date.now() - 2 * 86_400_000)) ?? 0) < 0)
  })
  it("renvoie un nombre positif pour une date future", () => {
    const j = joursRestants(new Date(Date.now() + 3 * 86_400_000))
    assert.equal(j, 3)
  })
})

describe("calculerConformite", () => {
  it("sans pièces : total 0 et 100 %", () => {
    assert.deepEqual(calculerConformite([], new Set(), false), { total: 0, couvertes: 0, pct: 100, manquantes: [] })
  })
  it("pièce générable couverte quand le dossier est généré", () => {
    const r = calculerConformite([{ nom: "CV" }], new Set(), true)
    assert.deepEqual(r, { total: 1, couvertes: 1, pct: 100, manquantes: [] })
  })
  it("pièce générable manquante sans dossier généré", () => {
    const r = calculerConformite([{ nom: "Lettre de motivation" }], new Set(), false)
    assert.deepEqual(r, { total: 1, couvertes: 0, pct: 0, manquantes: ["Lettre de motivation"] })
  })
  it("pièce personnelle couverte quand le type est déposé", () => {
    const r = calculerConformite([{ nom: "Relevé de notes" }], new Set(["RELEVE_NOTES"]), false)
    assert.deepEqual(r, { total: 1, couvertes: 1, pct: 100, manquantes: [] })
  })
  it("pièce personnelle manquante quand le type n'est pas présent", () => {
    const r = calculerConformite([{ nom: "Passeport" }], new Set(), false)
    assert.deepEqual(r, { total: 1, couvertes: 0, pct: 0, manquantes: ["Passeport"] })
  })
  it("mélange : compte, pourcentage arrondi et manquantes", () => {
    const r = calculerConformite(
      [{ nom: "CV" }, { nom: "Diplôme de licence" }, { nom: "Acte de naissance" }],
      new Set(["DIPLOME"]),
      true
    )
    assert.equal(r.total, 3)
    assert.equal(r.couvertes, 2)
    assert.equal(r.pct, 67)
    assert.deepEqual(r.manquantes, ["Acte de naissance"])
  })
})

describe("calculerProfilPct", () => {
  const base = { bio: null, objectifs: null, tonSouhaite: null, formations: "[]", experiences: "[]", competences: "[]", langues: "[]" }
  it("renvoie 0 pour un profil nul", () => {
    assert.equal(calculerProfilPct(null), 0)
  })
  it("renvoie 0 pour un profil vide", () => {
    assert.equal(calculerProfilPct(base), 0)
  })
  it("renvoie 100 pour un profil complet", () => {
    assert.equal(
      calculerProfilPct({
        bio: "bio", objectifs: "objectifs", tonSouhaite: "ton",
        formations: '["f"]', experiences: '["e"]', competences: '["c"]', langues: '["l"]',
      }),
      100
    )
  })
  it("compte les champs remplis", () => {
    assert.equal(calculerProfilPct({ ...base, bio: "bio", formations: '["f"]' }), 29)
  })
})

describe("parseJSON / jsonLen", () => {
  it("parse et compte les éléments d'un tableau", () => {
    assert.equal(jsonLen('[{"a":1},{"b":2}]'), 2)
  })
  it("retombe sur la valeur de secours en cas de JSON invalide", () => {
    assert.deepEqual(parseJSON("pas du json", []), [])
    assert.equal(jsonLen("pas du json"), 0)
  })
})
