import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { FormParametres } from "@/components/admin/FormParametres";
import { getParametres, CLES_PARAMETRES } from "@/lib/parametres";

export const dynamic = "force-dynamic";

export default async function PageParametres() {
  const cles = Object.values(CLES_PARAMETRES);
  const courants = await getParametres(cles);

  const valeurs: Record<string, string> = {};
  for (const c of cles) valeurs[c] = courants[c] ?? "";

  const defauts: Record<string, string> = {
    [CLES_PARAMETRES.quotaGratuitDefaut]: process.env.QUOTA_GRATUIT_MENSUEL || "3",
    [CLES_PARAMETRES.fournisseurIa]: "mistral",
    [CLES_PARAMETRES.fournisseurEmail]: process.env.RESEND_API_KEY ? "resend" : "(non configuré)",
    [CLES_PARAMETRES.texteAccueil]: "",
  };

  return (
    <>
      <EnteteAdmin titre="Paramètres du SaaS" sousTitre="Réglages globaux — prennent effet dans l'app" />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full">
        <FormParametres valeurs={valeurs} defauts={defauts} />
      </main>
    </>
  );
}
