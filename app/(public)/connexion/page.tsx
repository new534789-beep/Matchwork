"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChampTexte } from "@/components/ui/champ";
import { Bouton } from "@/components/ui/bouton";
import { Suspense } from "react";

function FormulaireConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.motDePasse,
        redirect: false,
      });

      if (result?.error) {
        setErreur("Email ou mot de passe incorrect.");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center px-5 py-12">
      <div className="max-w-sm mx-auto w-full">
        <Link href="/" className="block text-center text-indigo-600 font-bold text-2xl mb-8">
          Matchwork
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Connexion</h1>
          <p className="text-sm text-gray-500 mb-6">Content de vous revoir !</p>

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
              placeholder="Votre mot de passe"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              required
              autoComplete="current-password"
            />

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {erreur}
              </div>
            )}

            <Bouton type="submit" chargement={chargement} className="w-full mt-1">
              Se connecter
            </Bouton>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-indigo-600 font-medium hover:underline">
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function Connexion() {
  return (
    <Suspense>
      <FormulaireConnexion />
    </Suspense>
  );
}
