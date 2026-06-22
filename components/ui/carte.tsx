import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Carte({ className, children, padding = true, ...props }: CarteProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        padding && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CarteEntete({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CarteTitre({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-base font-semibold text-gray-900", className)} {...props}>
      {children}
    </h2>
  );
}
