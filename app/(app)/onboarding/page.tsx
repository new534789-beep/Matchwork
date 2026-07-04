import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InterfaceOnboarding } from "@/components/chat/InterfaceOnboarding";

export default async function Onboarding() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const profil = await prisma.profil.findUnique({
    where: { userId: session.user.id },
  });

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
