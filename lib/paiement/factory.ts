import type { FournisseurPaiement, PaymentProvider } from "./types";
import { mtnProvider } from "./stubs/mtn";
import { moovProvider } from "./stubs/moov";
import { bjpayProvider } from "./stubs/bjpay";

const PROVIDERS: Record<FournisseurPaiement, PaymentProvider> = {
  MTN: mtnProvider,
  MOOV: moovProvider,
  BJPAY: bjpayProvider,
};

export function getProvider(fournisseur: FournisseurPaiement): PaymentProvider {
  return PROVIDERS[fournisseur];
}
