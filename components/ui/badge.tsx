import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type CouleurBadge = "indigo" | "vert" | "rouge" | "orange" | "gris";

const couleurs: Record<CouleurBadge, React.CSSProperties> = {
  indigo: { background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)" },
  vert:   { background: "rgba(34,197,94,0.1)",  color: "#86efac",  border: "1px solid rgba(34,197,94,0.3)" },
  rouge:  { background: "rgba(239,68,68,0.1)",  color: "#fca5a5",  border: "1px solid rgba(239,68,68,0.3)" },
  orange: { background: "rgba(249,115,22,0.1)", color: "#fdba74",  border: "1px solid rgba(249,115,22,0.3)" },
  gris:   { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" },
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  couleur?: CouleurBadge;
}

export function Badge({ className, couleur = "gris", children, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}
      style={{ ...couleurs[couleur], ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
