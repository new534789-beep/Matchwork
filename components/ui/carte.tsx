import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Carte({ className, children, padding = true, ...props }: CarteProps) {
  return (
    <div
      className={cn("rounded-2xl", padding && "p-5", className)}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CarteEntete({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props}>{children}</div>;
}

export function CarteTitre({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-base font-semibold", className)} style={{ color: "var(--text)" }} {...props}>
      {children}
    </h2>
  );
}
