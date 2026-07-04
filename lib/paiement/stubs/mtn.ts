import type { PaymentProvider, InitierPaiementParams, InitierPaiementResult, VerifierStatutResult } from "../types";

// Stub MTN Mobile Money — sandbox uniquement, aucune vraie intégration marchande
export const mtnProvider: PaymentProvider = {
  nom: "MTN",

  async initierPaiement({ userId, montant, description, simulerEchec }: InitierPaiementParams): Promise<InitierPaiementResult> {
    console.log(`[MTN STUB] initierPaiement user=${userId} montant=${montant} XOF desc="${description}" simulerEchec=${simulerEchec}`);
    await new Promise((r) => setTimeout(r, 300));
    return { reference: `MTN-STUB-${Date.now()}` };
  },

  async verifierStatut(reference: string): Promise<VerifierStatutResult> {
    const echoue = reference.includes("ECHEC");
    return { statut: echoue ? "echoue" : "reussi" };
  },
};
