import type { PaymentProvider, InitierPaiementParams, InitierPaiementResult, VerifierStatutResult } from "../types";

// Stub Moov Money — sandbox uniquement
export const moovProvider: PaymentProvider = {
  nom: "MOOV",

  async initierPaiement({ userId, montant, description, simulerEchec }: InitierPaiementParams): Promise<InitierPaiementResult> {
    console.log(`[MOOV STUB] initierPaiement user=${userId} montant=${montant} XOF desc="${description}" simulerEchec=${simulerEchec}`);
    await new Promise((r) => setTimeout(r, 300));
    return { reference: `MOOV-STUB-${Date.now()}` };
  },

  async verifierStatut(reference: string): Promise<VerifierStatutResult> {
    const echoue = reference.includes("ECHEC");
    return { statut: echoue ? "echoue" : "reussi" };
  },
};
