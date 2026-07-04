"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { BoutonGoogle } from "@/components/auth/BoutonGoogle";

function FormulaireConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/tableau-de-bord";
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const result = await signIn("credentials", { email: form.email, password: form.motDePasse, redirect: false });
      if (result?.error) { setErreur("Email ou mot de passe incorrect."); return; }
      router.push(from);
      router.refresh();
    } catch {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <AuthShell
      titre="Connexion"
      sousTitre="Content de vous revoir."
      bas={<>Pas encore de compte ?{" "}<Link href="/inscription" style={{ color: "#a78bfa", fontWeight: 600 }}>Créer un compte</Link></>}
    >
      <BoutonGoogle callbackUrl={from} label="Se connecter avec Google" />

      <Separateur />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ChampAuth label="Adresse e-mail" type="email" placeholder="vous@exemple.com"
          value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <ChampAuth label="Mot de passe" type="password" placeholder="Votre mot de passe"
          value={form.motDePasse} onChange={(v) => setForm({ ...form, motDePasse: v })} />

        {erreur && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
            {erreur}
          </div>
        )}

        <button
          type="submit"
          disabled={chargement}
          className="w-full py-3.5 rounded-xl font-semibold text-sm mt-1"
          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 6px 22px rgba(124,58,237,0.35)", opacity: chargement ? 0.7 : 1 }}
        >
          {chargement ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  );
}

function Separateur() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>ou par e-mail</span>
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
    </div>
  );
}

function ChampAuth({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
        onFocus={(e) => { e.target.style.border = "1px solid rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
        onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function Connexion() {
  return <Suspense><FormulaireConnexion /></Suspense>;
}
