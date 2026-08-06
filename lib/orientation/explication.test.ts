import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { DonneesExplication } from "@/lib/ia/prompts/orientation"

import { classer } from "./classement"
import { chiffresInventes, construireDonnees } from "./explication"
import type { Releve } from "./calcul"

const RELEVE: Releve = {
  serie: "C",
  moyenneGenerale: 17.13,
  lignes: [
    { matiere: "Mathématiques", note: 15, coefficient: 6 },
    { matiere: "PCT", note: 19, coefficient: 5 },
    { matiere: "SVT", note: 20, coefficient: 2 },
    { matiere: "Français", note: 16, coefficient: 2 },
    { matiere: "Anglais", note: 18, coefficient: 2 },
    { matiere: "Histoire-Géographie", note: 18, coefficient: 2 },
    { matiere: "Philosophie", note: 15, coefficient: 2 },
  ],
}

const CLASSEES = classer(RELEVE, {
  diplome: "bac",
  serie: "C",
  interets: [],
  priorite: "bourse",
  zone: "*",
})

const DONNEES = construireDonnees(RELEVE, CLASSEES)

describe("données transmises au modèle", () => {
  it("ne contient que des valeurs déjà calculées", () => {
    assert.equal(DONNEES.serie, "C")
    assert.equal(DONNEES.moyenneGenerale, 17.13)
    assert.equal(DONNEES.mention, "Très bien")
    assert.equal(DONNEES.notes.length, 7)
    assert.ok(DONNEES.nombreCalculables > 0)
  })

  it("reprend les notes du relevé sans les modifier", () => {
    const maths = DONNEES.notes.find((n) => n.matiere === "Mathématiques")
    assert.deepEqual(maths, { matiere: "Mathématiques", note: 15, coefficient: 6 })
  })

  it("borne le nombre de filières transmises", () => {
    assert.ok(DONNEES.meilleures.length <= 5)
    assert.ok(DONNEES.plusBasses.length <= 2)
  })

  it("transmet la formule de chaque filière citée", () => {
    for (const m of DONNEES.meilleures) {
      assert.match(m.formule, /÷ \d+ = \d+\.\d{2}$/)
    }
  })

  it("laisse la mention à null quand la moyenne générale n'a pas été lue", () => {
    const sans = construireDonnees({ ...RELEVE, moyenneGenerale: undefined }, CLASSEES)
    assert.equal(sans.moyenneGenerale, null)
    assert.equal(sans.mention, null)
  })
})

describe("détection des chiffres inventés", () => {
  it("accepte un texte qui ne reprend que les chiffres fournis", () => {
    const m = DONNEES.meilleures[0]
    const texte = `Ta meilleure moyenne est ${m.moyenne.toFixed(2)} en ${m.filiere}. Tu as 20 en SVT.`
    assert.deepEqual(chiffresInventes(texte, DONNEES), [])
  })

  it("repère une moyenne inventée", () => {
    const inventes = chiffresInventes("Ta moyenne en droit serait de 11,47 sur 20.", DONNEES)
    assert.ok(inventes.includes("11,47"), `attendu 11,47 parmi ${inventes.join(", ")}`)
  })

  it("repère un quota inventé", () => {
    const inventes = chiffresInventes("Cette filière offre 137 bourses.", DONNEES)
    assert.ok(inventes.includes("137"))
  })

  it("repère un pourcentage de chance, formellement interdit", () => {
    const inventes = chiffresInventes("Tu as 78 % de chances d'obtenir la bourse.", DONNEES)
    assert.ok(inventes.includes("78"))
  })

  it("tolère la virgule décimale française", () => {
    const m = DONNEES.meilleures[0]
    const texte = `Ta moyenne atteint ${m.moyenne.toFixed(2).replace(".", ",")}.`
    assert.deepEqual(chiffresInventes(texte, DONNEES), [])
  })

  it("tolère un arrondi d'affichage de la même valeur", () => {
    const m = DONNEES.meilleures[0]
    const texte = `Ta moyenne atteint ${m.moyenne.toFixed(1)}.`
    assert.deepEqual(chiffresInventes(texte, DONNEES), [])
  })

  it("accepte la somme des coefficients, dénominateur de la formule", () => {
    const somme = RELEVE.lignes.reduce((s, l) => s + l.coefficient, 0)
    assert.deepEqual(chiffresInventes(`Le total des coefficients est ${somme}.`, DONNEES), [])
  })

  it("accepte les seuils de mention du système béninois", () => {
    assert.deepEqual(
      chiffresInventes("Il faut 16 pour Très bien, 14 pour Bien, 12 pour Assez bien.", DONNEES),
      [],
    )
  })

  it("ne se laisse pas berner par un texte sans aucun chiffre", () => {
    assert.deepEqual(chiffresInventes("Tes points forts sont les sciences.", DONNEES), [])
  })

  it("repère plusieurs inventions à la fois", () => {
    const inventes = chiffresInventes("Tu es 42e sur 1500 candidats avec 8,25.", DONNEES)
    assert.ok(inventes.length >= 2, `attendu au moins 2, obtenu ${inventes.join(", ")}`)
  })
})

describe("robustesse", () => {
  it("ne plante pas sur des données vides", () => {
    const vide: DonneesExplication = {
      serie: "C",
      moyenneGenerale: null,
      mention: null,
      notes: [],
      nombreFilieresOuvertes: 0,
      nombreCalculables: 0,
      nombreSurConcours: 0,
      meilleures: [],
      plusBasses: [],
    }
    assert.deepEqual(chiffresInventes("Rien à dire.", vide), [])
    assert.ok(chiffresInventes("Ta moyenne est 15,5.", vide).includes("15,5"))
  })
})
