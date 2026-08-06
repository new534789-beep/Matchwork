import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenirStatut } from "@/lib/paiement/fedapay";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ id?: string; token?: string }>;
}

export default async function RetourPaiement({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const params = await searchParams;
  const transactionIdStr = params.id;

  let statut: "reussi" | "echoue" | "attente" = "attente";
  let plan = "pro";

  if (transactionIdStr) {
    const fedapayId = parseInt(transactionIdStr, 10);
    if (!isNaN(fedapayId)) {
      try {
        const transaction = await obtenirStatut(fedapayId);
        const paiement = await prisma.paiement.findFirst({
          where: { fedapayId, userId: session.user.id },
        });

        if (transaction.status === "approved" && paiement) {
          plan = paiement.plan;
          await Promise.all([
            prisma.paiement.update({
              where: { id: paiement.id },
              data: { statut: "reussi" },
            }),
            prisma.user.update({
              where: { id: session.user.id },
              data: { plan },
            }),
          ]);
          statut = "reussi";
        } else if (
          transaction.status === "declined" ||
          transaction.status === "cancelled" ||
          transaction.status === "error"
        ) {
          if (paiement) {
            await prisma.paiement.update({
              where: { id: paiement.id },
              data: { statut: "echoue" },
            });
          }
          statut = "echoue";
        }
      } catch (e) {
        console.error("Erreur vérification FedaPay:", e);
        statut = "attente";
      }
    }
  }

  // Le résultat s'affiche en popup sur la page compte (centré + flou pour un
  // succès, toast pour un échec/attente), pas sur une page dédiée séparée.
  redirect(`/compte?paiement=${statut}&plan=${plan}`);
}
