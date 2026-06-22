import Link from "next/link";
import { Bouton } from "@/components/ui/bouton";

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Entête */}
      <header className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto">
        <span className="text-indigo-600 font-bold text-xl tracking-tight">Matchwork</span>
        <div className="flex gap-2">
          <Link href="/connexion">
            <Bouton variante="secondaire" taille="sm">Connexion</Bouton>
          </Link>
          <Link href="/inscription">
            <Bouton taille="sm">S&apos;inscrire</Bouton>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-10 pb-16 max-w-lg mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          🎓 Bourses d&apos;études · Afrique de l&apos;Ouest
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
          Votre dossier de bourse,{" "}
          <span className="text-indigo-600">complet et personnalisé</span>
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-8">
          Matchwork découvre les bourses adaptées à votre profil et génère automatiquement
          votre CV, votre lettre de motivation et votre checklist — taillés pour chaque opportunité.
          Jamais génériques, jamais identiques.
        </p>
        <Link href="/inscription" className="block">
          <Bouton taille="lg" className="w-full">
            Créer mon profil gratuitement
          </Bouton>
        </Link>
        <p className="text-xs text-gray-400 mt-3">3 dossiers complets offerts · Sans carte bancaire</p>
      </section>

      {/* Comment ça marche */}
      <section className="px-5 pb-16 max-w-lg mx-auto">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-6">
          Comment ça marche
        </h2>
        <div className="space-y-4">
          {etapes.map((e, i) => (
            <div key={i} className="flex gap-4 items-start bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                {e.icone}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{e.titre}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Points forts */}
      <section className="px-5 pb-20 max-w-lg mx-auto">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white">
          <h2 className="font-bold text-lg mb-4">Ce qui nous différencie</h2>
          <ul className="space-y-3 text-sm">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-indigo-300 mt-0.5">✓</span>
                <span className="text-indigo-100">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA bas */}
      <section className="px-5 pb-12 max-w-lg mx-auto text-center">
        <Link href="/inscription" className="block">
          <Bouton taille="lg" className="w-full">
            Commencer maintenant — c&apos;est gratuit
          </Bouton>
        </Link>
      </section>
    </main>
  );
}

const etapes = [
  {
    icone: "💬",
    titre: "1. Construisez votre profil avec l'IA",
    desc: "Notre assistante Amara vous pose des questions une par une pour construire votre profil complet — formations, expériences, langues, objectifs.",
  },
  {
    icone: "🎓",
    titre: "2. Parcourez les bourses",
    desc: "Swipez les opportunités adaptées à votre profil. Les offres en langue étrangère sont traduites automatiquement.",
  },
  {
    icone: "📄",
    titre: "3. Générez votre dossier complet",
    desc: "CV, lettre de motivation, checklist des pièces requises — générés dans la langue de la bourse, personnalisés pour cette opportunité uniquement.",
  },
];

const points = [
  "Jamais de contenu inventé : chaque mot vient de votre vrai profil",
  "Anti-répétition : chaque lettre est unique, même pour le même candidat",
  "Checklist et alertes deadline pour ne rien oublier",
  "Paiement mobile money (MTN, Moov, BjPay)",
  "Interface 100 % en français, conçue pour mobiles",
];
