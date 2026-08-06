import assert from "node:assert/strict"
import { after, describe, it } from "node:test"

import { envoyerAlerteOffre, normaliserTelephone } from "./envoyer"

describe("normaliserTelephone", () => {
  it("garde un numéro déjà en E.164", () => {
    assert.equal(normaliserTelephone("+22890123456"), "+22890123456")
  })

  it("nettoie espaces, tirets, parenthèses et points", () => {
    assert.equal(normaliserTelephone("+228 90 12 34 56"), "+22890123456")
    assert.equal(normaliserTelephone("+1 (202) 555-01.42"), "+12025550142")
  })

  it("convertit le préfixe 00 en +", () => {
    assert.equal(normaliserTelephone("0022890123456"), "+22890123456")
  })

  it("renvoie null pour un numéro sans indicatif explicite (on ne devine pas le pays)", () => {
    assert.equal(normaliserTelephone("90123456"), null)
    assert.equal(normaliserTelephone("090123456"), null)
  })

  it("renvoie null pour null ou vide", () => {
    assert.equal(normaliserTelephone(null), null)
    assert.equal(normaliserTelephone(undefined), null)
    assert.equal(normaliserTelephone("  "), null)
  })
})

describe("envoyerAlerteOffre", () => {
  const tokens = {
    access: process.env.WHATSAPP_ACCESS_TOKEN,
    phone: process.env.WHATSAPP_PHONE_NUMBER_ID,
  }

  after(() => {
    if (tokens.access) process.env.WHATSAPP_ACCESS_TOKEN = tokens.access
    else delete process.env.WHATSAPP_ACCESS_TOKEN
    if (tokens.phone) process.env.WHATSAPP_PHONE_NUMBER_ID = tokens.phone
    else delete process.env.WHATSAPP_PHONE_NUMBER_ID
  })

  it("ne jette pas et signale un défaut de configuration si les tokens manquent", async () => {
    delete process.env.WHATSAPP_ACCESS_TOKEN
    delete process.env.WHATSAPP_PHONE_NUMBER_ID
    const res = await envoyerAlerteOffre("+22890123456", {
      score: 82,
      intitule: "Bourse DAAD",
      organisme: "DAAD",
      url: "https://matchworks.app/opportunites/x",
    })
    assert.equal(res.ok, false)
    assert.match(res.erreur ?? "", /WHATSAPP_ACCESS_TOKEN/)
  })
})
