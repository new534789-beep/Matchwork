// Interface abstraite PaymentProvider — MTN MoMo, Moov Money, BjPay s'ajouteront ici

export type FournisseurPaiement = "MTN" | "MOOV" | "BJPAY";

export type StatutPaiement = "en_attente" | "reussi" | "echoue";

export interface InitierPaiementParams {
  userId: string;
  montant: number;
  description: string;
  simulerEchec?: boolean;
}

export interface InitierPaiementResult {
  reference: string;
}

export interface VerifierStatutResult {
  statut: StatutPaiement;
}

export interface PaymentProvider {
  nom: FournisseurPaiement;
  initierPaiement(params: InitierPaiementParams): Promise<InitierPaiementResult>;
  verifierStatut(reference: string): Promise<VerifierStatutResult>;
}
