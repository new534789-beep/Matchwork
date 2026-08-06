"use client";

import { usePathname } from "next/navigation";
import { NavLateral } from "./NavLateral";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { BarreProgression } from "./BarreProgression";

export function AppShell({ children, userEmail, role, justSignedUp = false }: { children: React.ReactNode; userEmail?: string; role?: string; justSignedUp?: boolean }) {
  const pathname = usePathname();
  const pleinEcran = pathname?.startsWith("/onboarding");

  if (pleinEcran) {
    return (
      <>
        <BarreProgression />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </>
    );
  }

  return (
    <>
      <BarreProgression />
      <NavLateral userEmail={userEmail} role={role} />
      <div className="flex-1 flex flex-col min-w-0 sidebar-content-offset">{children}</div>
      <InstallPrompt justSignedUp={justSignedUp} />
    </>
  );
}
