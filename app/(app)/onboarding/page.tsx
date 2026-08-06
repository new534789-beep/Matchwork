import { sessionCourante } from "@/lib/session";
import { redirect } from "next/navigation";
import { InterfaceOnboarding } from "@/components/chat/InterfaceOnboarding";
import { getProfilActif } from "@/lib/profil/actif";

export default async function Onboarding() {
  const session = await sessionCourante();
  if (!session?.user?.id) redirect("/connexion");

  const profil = await getProfilActif(session.user.id);

  if (profil?.complete) redirect("/tableau-de-bord");

  let sessionOnboarding: unknown[] = [];
  try {
    sessionOnboarding = profil?.sessionOnboarding
      ? JSON.parse(profil.sessionOnboarding as string)
      : [];
  } catch {
    sessionOnboarding = [];
  }

  return <InterfaceOnboarding sessionOnboarding={sessionOnboarding} />;
}
