import type { PaymentProvider, InitierPaiementParams, InitierPaiementResult, VerifierStatutResult } from "../types";

// Stub BjPay — sandbox uniquement
export const bjpayProvider: PaymentProvider = {
  nom: "BJPAY",

  async initierPaiement({ userId, montant, description, simulerEchec }: InitierPaiementParams): Promise<InitierPaiementResult> {
    console.log(`[BJPAY STUB] initierPaiement user=${userId} montant=${montant} XOF desc="${description}" simulerEchec=${simulerEchec}`);
    await new Promise((r) => setTimeout(r, 300));
    return { reference: `BJPAY-STUB-${Date.now()}` };
  },

  async verifierStatut(reference: string): Promise<VerifierStatutResult> {
    const echoue = reference.includes("ECHEC");
    return { statut: echoue ? "echoue" : "reussi" };
  },
};
