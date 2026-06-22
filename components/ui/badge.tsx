import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type CouleurBadge = "indigo" | "vert" | "rouge" | "orange" | "gris";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  couleur?: CouleurBadge;
}

const couleurs: Record<CouleurBadge, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  vert: "bg-green-50 text-green-700 ring-green-200",
  rouge: "bg-red-50 text-red-700 ring-red-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  gris: "bg-gray-50 text-gray-700 ring-gray-200",
};

export function Badge({ className, couleur = "gris", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        couleurs[couleur],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
