import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { Carte } from "@/components/ui/carte";
import { Bouton } from "@/components/ui/bouton";
import { Badge } from "@/components/ui/badge";

export default async function TableauDeBord() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const [profil, dossiers] = await Promise.all([
    prisma.profil.findUnique({ where: { userId: session.user.id } }),
    prisma.dossier.findMany({
      where: { userId: session.user.id },
      include: { opportunite: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  // Rediriger vers l'onboarding si le profil n'est pas complété
  if (!profil?.complete) {
    redirect("/onboarding");
  }

  const quota = await prisma.quotaUsage.findUnique({
    where: {
      userId_mois: {
        userId: session.user.id,
        mois: new Date().toISOString().slice(0, 7),
      },
    },
  });
  const quotaRestant = Math.max(
    0,
    (parseInt(process.env.QUOTA_GRATUIT_MENSUEL ?? "3") - (quota?.utilisations ?? 0))
  );

  return (
    <>
      <EnteteApp />
      <main className="flex-1 px-4 py-6 space-y-5 max-w-lg mx-auto w-full">
        {/* Bienvenue */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bonjour 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">{session.user.email}</p>
        </div>

        {/* Quota */}
        <Carte>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Dossiers gratuits ce mois</p>
              <p className="text-2xl font-bold text-indigo-600 mt-0.5">{quotaRestant}</p>
              <p className="text-xs text-gray-400">restant{quotaRestant !== 1 ? "s" : ""}</p>
            </div>
            {quotaRestant === 0 && (
              <Link href="/compte">
                <Bouton taille="sm">Recharger</Bouton>
              </Link>
            )}
          </div>
        </Carte>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/opportunites" className="block">
            <div className="bg-indigo-600 text-white rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">🎓</div>
              <p className="text-sm font-semibold">Voir les bourses</p>
            </div>
          </Link>
          <Link href="/coffre-fort" className="block">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-sm font-semibold text-gray-700">Coffre-fort</p>
            </div>
          </Link>
        </div>

        {/* Derniers dossiers */}
        {dossiers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Mes candidatures</h2>
              <Link href="/candidatures" className="text-xs text-indigo-600">Tout voir</Link>
            </div>
            <div className="space-y-2">
              {dossiers.map((d) => (
                <Link key={d.id} href={`/dossiers/${d.id}`}>
                  <Carte className="hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {d.opportunite.intitule}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{d.opportunite.organisme}</p>
                      </div>
                      <Badge
                        couleur={
                          d.statut === "GENERE"
                            ? "vert"
                            : d.statut === "SOUMIS"
                            ? "indigo"
                            : "gris"
                        }
                      >
                        {d.statut === "A_PREPARER"
                          ? "À préparer"
                          : d.statut === "GENERE"
                          ? "Généré"
                          : "Soumis"}
                      </Badge>
                    </div>
                  </Carte>
                </Link>
              ))}
            </div>
          </div>
        )}

        {dossiers.length === 0 && (
          <Carte className="text-center py-8">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm font-medium text-gray-700">Pas encore de candidature</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Parcourez les bourses et swipez celles qui vous intéressent
            </p>
            <Link href="/opportunites">
              <Bouton taille="sm">Voir les bourses</Bouton>
            </Link>
          </Carte>
        )}
      </main>
    </>
  );
}
