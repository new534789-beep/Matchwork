"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChampTexte } from "@/components/ui/champ";
import { Bouton } from "@/components/ui/bouton";

export default function Inscription() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", motDePasse: "", confirmation: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

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
      if (!res.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
        return;
      }
      // Connexion automatique après inscription
      const { signIn } = await import("next-auth/react");
      await signIn("credentials", {
        email: form.email,
        password: form.motDePasse,
        redirect: false,
      });
      router.push("/onboarding");
    } catch {
      setErreur("Impossible de créer le compte. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center px-5 py-12">
      <div className="max-w-sm mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="block text-center text-indigo-600 font-bold text-2xl mb-8">
          Matchwork
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Créer mon compte</h1>
          <p className="text-sm text-gray-500 mb-6">
            Commencez gratuitement — 3 dossiers offerts
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ChampTexte
              label="Adresse e-mail"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            <ChampTexte
              label="Mot de passe"
              type="password"
              placeholder="Minimum 8 caractères"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              required
              autoComplete="new-password"
            />
            <ChampTexte
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Répétez votre mot de passe"
              value={form.confirmation}
              onChange={(e) => setForm({ ...form, confirmation: e.target.value })}
              required
              autoComplete="new-password"
            />

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {erreur}
              </div>
            )}

            <Bouton type="submit" chargement={chargement} className="w-full mt-1">
              Créer mon compte
            </Bouton>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-indigo-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
