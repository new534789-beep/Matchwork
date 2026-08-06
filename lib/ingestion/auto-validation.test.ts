import assert from "node:assert/strict"
import { before, describe, it } from "node:test"

import { deciderBourseOuAutre, deciderEmploi } from "./auto-validation"

// Sans clé Mistral, la détection de blog renvoie null et la décision devient
// entièrement déterministe : ces tests ne touchent ni le réseau ni la base.
before(() => {
  delete process.env.MISTRAL_API_KEY
})

const BOURSE_DAAD = {
  type: "BOURSE_ETUDE",
  intitule: "DAAD Helmut-Schmidt-Programme (Master's Scholarships for Public Policy)",
  organisme: "DAAD",
  description:
    "Le programme Helmut-Schmidt finance des masters en gouvernance et politiques " +
    "publiques dans des universités allemandes, avec allocation mensuelle, voyage et " +
    "assurance. Ouvert aux candidats des pays en développement.",
  lien: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=57135527",
  source: "SCHOLARSHIP:daad",
  dateLimite: new Date(Date.now() + 60 * 86_400_000),
  confianceDateLimite: 0.9,
}

describe("bourses étrangères : le lien du portail vaut canal de candidature", () => {
  it("publie une bourse DAAD sans canal extrait", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "publiee", d.raison)
  })

  it("publie une bourse dont l'extraction a explicitement conclu « aucun »", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      canalCandidature: "aucun",
      cibleCandidature: null,
    })
    assert.equal(d.action, "publiee", d.raison)
  })

  it("couvre les autres portails institutionnels suivis", async () => {
    for (const source of [
      "SCHOLARSHIP:chevening",
      "SCHOLARSHIP:fulbright",
      "SCHOLARSHIP:cf-france",
      "SCHOLARSHIP:turkiye-burslari",
      "SCHOLARSHIP:mastercard-fdn",
    ]) {
      const d = await deciderBourseOuAutre({
        ...BOURSE_DAAD,
        source,
        canalCandidature: null,
        cibleCandidature: null,
      })
      assert.equal(d.action, "publiee", `${source} : ${d.raison}`)
    }
  })
})

describe("le garde-fou reste actif là où il doit l'être", () => {
  it("rejette une bourse de source non institutionnelle sans canal", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      source: "RSS:un-blog-quelconque",
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
    assert.match(d.raison, /canal de candidature/)
  })

  it("rejette une bourse de portail suivi dont le lien est invalide", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      lien: "pas-une-url",
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
  })

  it("rejette une bourse de portail suivi sans lien du tout", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      lien: null,
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
  })

  it("rejette encore une date limite dépassée", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      dateLimite: new Date(Date.now() - 86_400_000),
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
    assert.match(d.raison, /Date limite/)
  })

  it("rejette encore une description trop courte", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      description: "Bourse.",
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
    assert.match(d.raison, /Description/)
  })

  it("rejette encore un titre de navigation", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      intitule: "En savoir plus",
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
  })

  it("rejette encore un contenu de spam", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      intitule: "Congratulations you won a free iPhone",
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
  })
})

describe("un canal réellement extrait reste prioritaire", () => {
  it("accepte un e-mail valide même hors portail suivi", async () => {
    const d = await deciderBourseOuAutre({
      ...BOURSE_DAAD,
      source: "RSS:autre",
      canalCandidature: "email",
      cibleCandidature: "bourses@exemple.org",
    })
    assert.equal(d.action, "publiee", d.raison)
  })
})

describe("les emplois ne changent pas de comportement", () => {
  const EMPLOI = {
    type: "EMPLOI",
    intitule: "Ingénieur logiciel",
    organisme: "Stripe",
    description:
      "Nous recrutons un ingénieur logiciel pour rejoindre notre équipe paiements " +
      "et construire des API utilisées par des millions de marchands.",
    lien: "https://stripe.com/jobs/listing/software-engineer/1234",
    source: "ATS:stripe",
  }

  it("publie toujours une offre ATS", async () => {
    const d = await deciderEmploi({ ...EMPLOI, canalCandidature: null, cibleCandidature: null })
    assert.equal(d.action, "publiee", d.raison)
  })

  it("rejette toujours un emploi hors ATS sans canal", async () => {
    const d = await deciderEmploi({
      ...EMPLOI,
      source: "RSS:un-site",
      canalCandidature: null,
      cibleCandidature: null,
    })
    assert.equal(d.action, "rejetee")
  })
})
