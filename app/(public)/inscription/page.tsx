"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { BoutonGoogle } from "@/components/auth/BoutonGoogle";
import { COOKIE_REF } from "@/lib/attribution";

function FormulaireInscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", motDePasse: "", confirmation: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  // Attribution funnel SEO → inscription : le CTA d'une fiche publique porte
  // ?ref=offre:<slug> (ou categorie:/pays:) → posé en cookie court, lu une
  // seule fois à la création du compte (credentials ou Google).
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) document.cookie = `${COOKIE_REF}=${encodeURIComponent(ref)}; path=/; max-age=1800; SameSite=Lax`;
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (form.motDePasse.length < 8) {
      setErreur("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (form.motDePasse !== form.confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);
    try {
      const res = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, motDePasse: form.motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) { setErreur(data.erreur ?? "Une erreur est survenue."); return; }

      const { signIn } = await import("next-auth/react");
      await signIn("credentials", { email: form.email, password: form.motDePasse, redirect: false });
      router.push("/tableau-de-bord");
    } catch {
      setErreur("Impossible de créer le compte. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <AuthShell
      titre="Créer mon compte"
      sousTitre="3 dossiers complets offerts, sans carte bancaire."
      bas={<>Déjà inscrit ?{" "}<Link href="/connexion" style={{ color: "#a78bfa", fontWeight: 600 }}>Se connecter</Link></>}
    >
      <BoutonGoogle callbackUrl="/tableau-de-bord" label="S'inscrire avec Google" />

      <Separateur />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ChampAuth label="Adresse e-mail" type="email" placeholder="vous@exemple.com"
          value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <ChampAuth label="Mot de passe" type="password" placeholder="Minimum 8 caractères"
          value={form.motDePasse} onChange={(v) => setForm({ ...form, motDePasse: v })} />
        <ChampAuth label="Confirmer le mot de passe" type="password" placeholder="Répétez votre mot de passe"
          value={form.confirmation} onChange={(v) => setForm({ ...form, confirmation: v })} />

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
          {chargement ? "Création en cours…" : "Créer mon compte"}
        </button>

        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5 }}>
          En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
        </p>
      </form>
    </AuthShell>
  );
}

// useSearchParams() doit être sous une frontière <Suspense> pour permettre le
// prérendu statique de la page (sinon échec de build « missing-suspense-with-csr
// -bailout »). Même patron que /connexion.
export default function Inscription() {
  return (
    <Suspense>
      <FormulaireInscription />
    </Suspense>
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
