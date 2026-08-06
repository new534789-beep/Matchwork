"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    try {
      await fetch("/api/auth/mot-de-passe-oublie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setChargement(false);
      setEnvoye(true);
    }
  }

  return (
    <AuthShell
      titre="Mot de passe oublié"
      sousTitre="Recevez un lien pour en choisir un nouveau."
      bas={<>Vous vous souvenez ? <Link href="/connexion" style={{ color: "#a78bfa", fontWeight: 600 }}>Retour à la connexion</Link></>}
    >
      {envoye ? (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd" }}>
          Si un compte existe avec cet e-mail, un lien de réinitialisation vient d&apos;être envoyé. Vérifiez votre boîte de réception (et les spams).
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Adresse e-mail</label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
            />
          </div>
          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3.5 rounded-xl font-semibold text-sm mt-1"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 6px 22px rgba(124,58,237,0.35)", opacity: chargement ? 0.7 : 1 }}
          >
            {chargement ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
