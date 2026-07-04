"use client";

import { usePathname } from "next/navigation";
import { NavLateral } from "./NavLateral";

/**
 * Coque de l'espace connecté.
 * Masque la navigation latérale sur les parcours plein écran (onboarding),
 * où l'utilisateur est encore en phase d'inscription.
 */
export function AppShell({ children, userEmail, role }: { children: React.ReactNode; userEmail?: string; role?: string }) {
  const pathname = usePathname();
  const pleinEcran = pathname?.startsWith("/onboarding");

  if (pleinEcran) {
    return <div className="flex-1 flex flex-col min-w-0">{children}</div>;
  }

  return (
    <>
      <NavLateral userEmail={userEmail} role={role} />
      <div className="flex-1 flex flex-col min-w-0 sidebar-content-offset">
        {children}
      </div>
    </>
  );
}
