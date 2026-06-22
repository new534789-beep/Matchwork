"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface ChampTexteProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erreur?: string;
  aide?: string;
}

export const ChampTexte = forwardRef<HTMLInputElement, ChampTexteProps>(
  ({ className, label, erreur, aide, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500",
            erreur && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        />
        {aide && !erreur && <p className="text-xs text-gray-500">{aide}</p>}
        {erreur && <p className="text-xs text-red-600">{erreur}</p>}
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
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            erreur && "border-red-400",
            className
          )}
          {...props}
        />
        {aide && !erreur && <p className="text-xs text-gray-500">{aide}</p>}
        {erreur && <p className="text-xs text-red-600">{erreur}</p>}
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
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            erreur && "border-red-400",
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.valeur} value={o.valeur}>
              {o.libelle}
            </option>
          ))}
        </select>
        {erreur && <p className="text-xs text-red-600">{erreur}</p>}
      </div>
    );
  }
);
ChampSelect.displayName = "ChampSelect";
