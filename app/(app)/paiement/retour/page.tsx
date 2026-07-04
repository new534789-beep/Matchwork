import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenirStatut } from "@/lib/paiement/fedapay";
import { redirect } from "next/navigation";
import Link from "next/link";

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

  const nomPlan = plan === "premium" ? "Premium" : "Pro";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>

        {statut === "reussi" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(124,58,237,0.12)", border: "2px solid rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Paiement réussi</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
              Votre abonnement <strong style={{ color: "#a78bfa" }}>Matchwork {nomPlan}</strong> est maintenant actif. Générations illimitées débloquées.
            </p>
            <Link href="/opportunites" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
              Explorer les bourses
            </Link>
          </>
        )}

        {statut === "echoue" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.08)", border: "2px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Paiement échoué</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
              La transaction n&apos;a pas abouti. Aucun montant n&apos;a été débité. Vous pouvez réessayer depuis votre compte.
            </p>
            <Link href="/compte" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
              Retour à mon compte
            </Link>
          </>
        )}

        {statut === "attente" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(124,58,237,0.08)", border: "2px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Paiement en cours</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
              Votre paiement est en cours de traitement. Vérifiez votre compte dans quelques instants.
            </p>
            <Link href="/compte" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
              Voir mon compte
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
