"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";

function Formulaire() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (motDePasse !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    setChargement(true);
    try {
      const res = await fetch("/api/auth/reinitialiser-mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) { setErreur(data.erreur ?? "Une erreur est survenue."); return; }
      setSucces(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } catch {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
        Lien invalide. <Link href="/mot-de-passe-oublie" style={{ color: "#a78bfa", fontWeight: 600 }}>Refaire une demande</Link>.
      </div>
    );
  }

  if (succes) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd" }}>
        Mot de passe mis à jour. Redirection vers la connexion…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Nouveau mot de passe</label>
        <input
          type="password"
          placeholder="Au moins 8 caractères"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Confirmer le mot de passe</label>
        <input
          type="password"
          placeholder="Retapez le mot de passe"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
        />
      </div>

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
        {chargement ? "Mise à jour…" : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}

export default function ReinitialiserMotDePasse() {
  return (
    <Suspense>
      <AuthShell
        titre="Nouveau mot de passe"
        sousTitre="Choisissez un mot de passe pour votre compte."
        bas={<Link href="/connexion" style={{ color: "#a78bfa", fontWeight: 600 }}>Retour à la connexion</Link>}
      >
        <Formulaire />
      </AuthShell>
    </Suspense>
  );
}
