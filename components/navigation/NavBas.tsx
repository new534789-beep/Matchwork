"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const liens = [
  { href: "/", label: "Accueil", icone: "🏠" },
  { href: "/opportunites", label: "Bourses", icone: "🎓" },
  { href: "/candidatures", label: "Dossiers", icone: "📁" },
  { href: "/coffre-fort", label: "Documents", icone: "🔒" },
  { href: "/profil", label: "Profil", icone: "👤" },
];

export function NavBas() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {liens.map((l) => {
          const actif = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-0",
                actif ? "text-indigo-600" : "text-gray-500"
              )}
            >
              <span className="text-xl leading-none">{l.icone}</span>
              <span className={cn("text-[10px] font-medium truncate", actif && "font-semibold")}>
                {l.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
