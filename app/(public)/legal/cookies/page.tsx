import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { LegalLayout } from "@/components/public/LegalLayout";

export function generateMetadata(): Metadata {
  const url = `${getSiteUrl()}/legal/cookies`;
  return {
    title: { absolute: "Politique de cookies | Matchwork" },
    description: "Quels cookies Matchwork utilise, pourquoi, et comment les gérer.",
    alternates: { canonical: url },
    robots: { index: true },
  };
}

export default function PageCookies() {
  return (
    <LegalLayout titre="Politique de cookies" majAJour="19 juillet 2026">
      <p>
        Cette page explique, simplement, quels cookies Matchwork dépose sur votre appareil quand vous visitez ou utilisez le site, et pourquoi.
      </p>

      <h2>Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé par un site dans votre navigateur, qui permet de reconnaître votre appareil lors de vos visites suivantes.
      </p>

      <h2>Les cookies essentiels (toujours actifs)</h2>
      <p>Ces cookies sont indispensables au fonctionnement du site — Matchwork ne peut pas fonctionner sans eux, et ils ne sont donc pas soumis à votre consentement :</p>
      <ul>
        <li><strong>Cookie de session (connexion)</strong> — vous garde connecté à votre compte pendant votre navigation.</li>
        <li><strong>Cookie de sécurité (anti-fraude / CSRF)</strong> — protège les formulaires du site contre les attaques.</li>
        <li><strong>Cookie de préférence de consentement (mw_consent)</strong> — mémorise votre choix concernant les cookies ci-dessous, pour ne pas vous redemander à chaque visite.</li>
      </ul>

      <h2>Le cookie non-essentiel (soumis à votre choix)</h2>
      <ul>
        <li>
          <strong>mw_ref</strong> — posé uniquement si vous arrivez sur le site via un lien spécifique (par exemple depuis une fiche d&apos;offre publique ou une page de catégorie). Il permet à Matchwork de savoir quelle page vous a amené à créer un compte, à des fins statistiques internes uniquement. Durée de vie : 30 minutes. Il n&apos;est jamais partagé avec un tiers, ni utilisé pour de la publicité.
        </li>
      </ul>
      <p>
        Matchwork n&apos;utilise aucun cookie publicitaire, aucun outil d&apos;analyse tiers (type Google Analytics), et ne revend aucune donnée de navigation.
      </p>

      <h2>Gérer votre choix</h2>
      <p>
        Une bannière vous propose d&apos;accepter, refuser, ou personnaliser ces cookies lors de votre première visite. Vous pouvez à tout moment effacer les cookies de Matchwork depuis les réglages de votre navigateur pour que la bannière réapparaisse et modifier votre choix.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question sur cette politique, contactez-nous à l&apos;adresse indiquée dans notre{" "}
        <a href="/legal/confidentialite">politique de confidentialité</a>.
      </p>
    </LegalLayout>
  );
}
