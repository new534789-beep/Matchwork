"use client";

import { usePathname } from "next/navigation";
import { NavLateral } from "./NavLateral";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useDetecteurNavigation } from "./DetecteurNavigation";
import { ChargementNavigation } from "./ChargementNavigation";

export function AppShell({ children, userEmail, role, justSignedUp = false }: { children: React.ReactNode; userEmail?: string; role?: string; justSignedUp?: boolean }) {
  const pathname = usePathname();
  const pleinEcran = pathname?.startsWith("/onboarding");
  const navigationEnCours = useDetecteurNavigation();

  // filter (pas backdrop-filter) : flouter le contenu réel plutôt que
  // demander au navigateur de flouter "ce qu'il y a derrière" — bien plus
  // fiable sur Android/WebView, où backdrop-filter + position:fixed est
  // capricieux voire silencieusement ignoré sur certains appareils.
  const styleFlou: React.CSSProperties = {
    filter: navigationEnCours ? "blur(4px)" : "none",
    transition: "filter 0.15s ease",
  };

  if (pleinEcran) {
    return (
      <>
        <ChargementNavigation actif={navigationEnCours} />
        <div className="flex-1 flex flex-col min-w-0" style={styleFlou}>
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <ChargementNavigation actif={navigationEnCours} />
      <NavLateral userEmail={userEmail} role={role} />
      <div className="flex-1 flex flex-col min-w-0 sidebar-content-offset" style={styleFlou}>
        {children}
      </div>
      <InstallPrompt justSignedUp={justSignedUp} />
    </>
  );
}
