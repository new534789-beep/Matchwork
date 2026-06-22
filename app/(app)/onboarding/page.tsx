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

  if (profil?.complete) redirect("/");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <span className="text-indigo-600 font-bold text-lg">Matchwork</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">Construction du profil</span>
        </div>
      </header>
      <InterfaceOnboarding
        sessionOnboarding={(profil?.sessionOnboarding as unknown[]) ?? []}
      />
    </div>
  );
}
