const BASE_URL = process.env.FEDAPAY_BASE_URL ?? "https://api.fedapay.com/v1";
const SECRET_KEY = process.env.FEDAPAY_SECRET_KEY ?? "";

function headers() {
  return {
    "Authorization": `Bearer ${SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface TransactionFedapay {
  id: number;
  reference: string;
  status: "pending" | "approved" | "declined" | "cancelled" | "refunded" | "error";
  amount: number;
}

export async function creerTransaction(params: {
  montant: number;
  description: string;
  email: string;
  callbackUrl: string;
}): Promise<{ id: number; reference: string }> {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      description: params.description,
      amount: params.montant,
      currency: { iso: "XOF" },
      customer: { email: params.email },
      callback_url: params.callbackUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FedaPay creerTransaction: ${res.status} — ${err}`);
  }

  const data = await res.json() as { "v1/transaction": { id: number; reference: string } };
  const t = data["v1/transaction"];
  return { id: t.id, reference: t.reference };
}

export async function genererUrlPaiement(transactionId: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/transactions/${transactionId}/token`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FedaPay genererUrlPaiement: ${res.status} — ${err}`);
  }

  const data = await res.json() as { token: string; url: string };
  return data.url;
}

export async function obtenirStatut(transactionId: number): Promise<TransactionFedapay> {
  const res = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FedaPay obtenirStatut: ${res.status} — ${err}`);
  }

  const data = await res.json() as { "v1/transaction": TransactionFedapay };
  return data["v1/transaction"];
}
