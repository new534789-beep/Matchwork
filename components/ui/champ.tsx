"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const inputStyle: React.CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--text)",
};

interface ChampTexteProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erreur?: string;
  aide?: string;
}

export const ChampTexte = forwardRef<HTMLInputElement, ChampTexteProps>(
  ({ className, label, erreur, aide, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{label}</label>
        )}
        <input
          ref={ref} id={inputId}
          className={cn("w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:opacity-30", erreur && "ring-1 ring-red-500", className)}
          style={inputStyle}
          onFocus={(e) => { e.target.style.border = "1px solid rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)"; }}
          onBlur={(e) => { e.target.style.border = "1px solid var(--input-border)"; e.target.style.boxShadow = "none"; }}
          {...props}
        />
        {aide && !erreur && <p className="text-xs" style={{ color: "var(--text-3)" }}>{aide}</p>}
        {erreur && <p className="text-xs" style={{ color: "#fca5a5" }}>{erreur}</p>}
      </div>
    );
  }
);
ChampTexte.displayName = "ChampTexte";

interface ChampTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  erreur?: string;
  aide?: string;
}

export const ChampTextarea = forwardRef<HTMLTextAreaElement, ChampTextareaProps>(
  ({ className, label, erreur, aide, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{label}</label>
        )}
        <textarea
          ref={ref} id={inputId} rows={3}
          className={cn("w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all placeholder:opacity-30", className)}
          style={inputStyle}
          onFocus={(e) => { e.target.style.border = "1px solid rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)"; }}
          onBlur={(e) => { e.target.style.border = "1px solid var(--input-border)"; e.target.style.boxShadow = "none"; }}
          {...props}
        />
        {aide && !erreur && <p className="text-xs" style={{ color: "var(--text-3)" }}>{aide}</p>}
        {erreur && <p className="text-xs" style={{ color: "#fca5a5" }}>{erreur}</p>}
      </div>
    );
  }
);
ChampTextarea.displayName = "ChampTextarea";

interface ChampSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  erreur?: string;
  options: { valeur: string; libelle: string }[];
}

export const ChampSelect = forwardRef<HTMLSelectElement, ChampSelectProps>(
  ({ className, label, erreur, options, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{label}</label>
        )}
        <select
          ref={ref} id={inputId}
          className={cn("w-full rounded-xl px-4 py-2.5 text-sm outline-none", className)}
          style={inputStyle}
          {...props}
        >
          {options.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
        </select>
        {erreur && <p className="text-xs" style={{ color: "#fca5a5" }}>{erreur}</p>}
      </div>
    );
  }
);
ChampSelect.displayName = "ChampSelect";
