import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { LegalLayout } from "@/components/public/LegalLayout";

export function generateMetadata(): Metadata {
  const url = `${getSiteUrl()}/legal/confidentialite`;
  return {
    title: { absolute: "Politique de confidentialité | Matchwork" },
    description: "Comment Matchwork collecte, utilise et protège vos données personnelles.",
    alternates: { canonical: url },
    robots: { index: true },
  };
}

export default function PageConfidentialite() {
  return (
    <LegalLayout titre="Politique de confidentialité" majAJour="19 juillet 2026">
      <p>
        La présente politique décrit comment Matchwork (« nous », « le Service »), exploité par{" "}
        <strong>[Nom légal de l&apos;entité exploitant Matchwork — à compléter]</strong>, collecte, utilise, conserve et protège les données personnelles des utilisateurs (« vous », « l&apos;utilisateur ») du site matchworks.app et de ses services associés.
      </p>
      <p>
        En créant un compte ou en utilisant le Service, vous reconnaissez avoir pris connaissance de cette politique.
      </p>

      <h2>1. Données que nous collectons</h2>
      <h3>1.1 Données de compte</h3>
      <ul>
        <li>Adresse e-mail et mot de passe (stocké de façon chiffrée, jamais en clair) ;</li>
        <li>Identifiant de connexion Google, si vous choisissez cette méthode de connexion.</li>
      </ul>
      <h3>1.2 Données de profil (renseignées volontairement par vous)</h3>
      <ul>
        <li>Identité : nom complet, date et lieu de naissance, nationalité ;</li>
        <li>Coordonnées : adresse postale, téléphone, e-mail, profil LinkedIn ;</li>
        <li>Parcours : formations, expériences professionnelles, compétences, langues parlées, objectifs de carrière.</li>
      </ul>
      <h3>1.3 Documents que vous déposez ou générez</h3>
      <p>
        Les pièces que vous déposez dans votre coffre-fort (diplômes, relevés, pièces d&apos;identité, etc.) et les documents générés pour vos candidatures (CV, lettres de motivation, notes conceptuelles). Ces documents sont stockés de façon chiffrée.
      </p>
      <h3>1.4 Données de paiement</h3>
      <p>
        Matchwork ne stocke <strong>jamais</strong> vos coordonnées bancaires ou vos identifiants Mobile Money. Ces informations sont saisies directement chez notre prestataire de paiement (FedaPay), qui nous transmet uniquement la confirmation et le montant de la transaction.
      </p>
      <h3>1.5 Données d&apos;usage</h3>
      <p>
        Historique de vos candidatures, offres consultées ou mises de côté, durée de connexion, et — si vous y consentez — le cookie d&apos;attribution décrit dans notre{" "}
        <a href="/legal/cookies">politique de cookies</a>.
      </p>

      <h2>2. Pourquoi nous utilisons vos données</h2>
      <ul>
        <li>Vous proposer des offres pertinentes (bourses, emplois, stages, formations, appels à projets) ;</li>
        <li>Générer, à partir de votre profil réel, des documents de candidature adaptés à chaque offre ;</li>
        <li>Gérer votre compte, votre abonnement et vos paiements ;</li>
        <li>Vous contacter au sujet de votre compte ou de vos candidatures ;</li>
        <li>Assurer la sécurité du Service et prévenir la fraude ;</li>
        <li>Mesurer, avec votre consentement, l&apos;efficacité de nos canaux d&apos;acquisition.</li>
      </ul>
      <p>
        Nous n&apos;utilisons jamais vos données pour de la publicité tierce, et nous ne les vendons à personne.
      </p>

      <h2>3. Avec qui vos données sont partagées</h2>
      <p>Vos données sont transmises, dans la stricte mesure nécessaire, aux prestataires suivants :</p>
      <ul>
        <li><strong>Mistral AI</strong> — analyse des offres et génération de vos documents de candidature à partir des informations de votre profil ;</li>
        <li><strong>Resend</strong> — envoi des e-mails transactionnels (confirmation de compte, envoi de dossier) ;</li>
        <li><strong>FedaPay</strong> — traitement des paiements (Mobile Money, carte) ;</li>
        <li><strong>Vercel</strong> et <strong>Neon</strong> — hébergement de l&apos;application et de la base de données.</li>
      </ul>
      <p>
        Ces prestataires n&apos;ont accès qu&apos;aux données strictement nécessaires à leur fonction et sont contractuellement tenus de les protéger. Certains d&apos;entre eux hébergent des données hors d&apos;Afrique de l&apos;Ouest (Europe, Amérique du Nord) : nous veillons à ne travailler qu&apos;avec des prestataires offrant des garanties de sécurité reconnues.
      </p>

      <h2>4. Durée de conservation</h2>
      <p>
        Vos données sont conservées tant que votre compte est actif. Si vous supprimez votre compte, vos données personnelles et documents sont supprimés dans un délai raisonnable, sauf obligation légale de conservation plus longue (notamment en matière comptable pour les paiements effectués).
      </p>

      <h2>5. Vos droits</h2>
      <p>Vous disposez, sur vos données personnelles, d&apos;un droit :</p>
      <ul>
        <li>d&apos;accès et de rectification ;</li>
        <li>de suppression (« droit à l&apos;oubli ») ;</li>
        <li>de retrait de votre consentement à tout moment, pour les traitements fondés sur celui-ci ;</li>
        <li>de portabilité de vos données ;</li>
        <li>d&apos;opposition, pour motif légitime.</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à l&apos;adresse indiquée à l&apos;article 11. Vous pouvez aussi supprimer votre compte directement depuis les paramètres de votre profil.
      </p>

      <h2>6. Sécurité</h2>
      <p>
        Les échanges avec le Service sont chiffrés (HTTPS), les mots de passe sont hachés (jamais stockés en clair), et vos documents sensibles sont chiffrés au repos. Aucun système n&apos;étant infaillible, nous ne pouvons garantir une sécurité absolue, mais nous mettons en œuvre les mesures raisonnables de l&apos;état de l&apos;art pour protéger vos données.
      </p>

      <h2>7. Mineurs</h2>
      <p>
        Le Service s&apos;adresse à des personnes en âge de candidater à des bourses, stages ou emplois. Si vous êtes mineur au regard de la loi qui vous est applicable, l&apos;utilisation du Service doit se faire avec l&apos;accord de votre représentant légal.
      </p>

      <h2>8. Limites de responsabilité</h2>
      <p>Cette section précise ce que Matchwork garantit — et ce qu&apos;il ne garantit pas.</p>
      <ul>
        <li>
          <strong>Documents générés par IA :</strong> les CV, lettres et autres documents sont générés automatiquement à partir des informations que vous fournissez. Matchwork ne garantit pas l&apos;absence totale d&apos;erreur, et il vous appartient de relire et vérifier chaque document avant de l&apos;envoyer à un tiers. Vous restez seul responsable du contenu final que vous soumettez.
        </li>
        <li>
          <strong>Offres publiées :</strong> Matchwork agrège des opportunités provenant de sources publiques et de partenaires. Nous ne garantissons ni l&apos;exactitude, ni la disponibilité continue, ni la légitimité de chaque offre affichée, et nous vous recommandons de vérifier toute information sensible directement auprès de l&apos;organisme concerné avant de candidater ou de transmettre des documents.
        </li>
        <li>
          <strong>Aucune garantie de résultat :</strong> Matchwork est un outil d&apos;aide à la candidature. Nous ne garantissons en aucun cas l&apos;obtention d&apos;une bourse, d&apos;un emploi, d&apos;un stage ou de tout autre résultat auprès d&apos;un tiers.
        </li>
        <li>
          <strong>Disponibilité du Service :</strong> nous nous efforçons d&apos;assurer un service continu, sans pouvoir garantir une disponibilité ininterrompue (maintenance, panne technique, cas de force majeure).
        </li>
        <li>
          <strong>Limitation :</strong> dans la mesure permise par la loi applicable, la responsabilité de Matchwork envers un utilisateur, toutes causes confondues, est limitée au montant effectivement payé par cet utilisateur au cours des douze derniers mois, et exclut tout dommage indirect (perte d&apos;opportunité, préjudice moral, manque à gagner).
        </li>
        <li>
          <strong>Usage responsable :</strong> vous vous engagez à fournir des informations exactes dans votre profil, et à ne pas utiliser le Service pour produire de fausses déclarations à l&apos;attention d&apos;un tiers. Vous acceptez de garantir Matchwork contre toute réclamation résultant d&apos;informations inexactes que vous auriez fournies ou d&apos;un usage du Service contraire à cette politique.
        </li>
      </ul>

      <h2>9. Modifications de cette politique</h2>
      <p>
        Nous pouvons mettre à jour cette politique pour refléter une évolution du Service ou de la réglementation. La date de dernière mise à jour figure en haut de cette page. En cas de changement substantiel, nous vous en informerons par e-mail ou via le Service.
      </p>

      <h2>10. Droit applicable</h2>
      <p>
        Cette politique est régie par le droit béninois. Tout litige relatif à son interprétation ou son exécution relève, à défaut de résolution amiable, de la compétence des juridictions de Cotonou, Bénin.
      </p>

      <h2>11. Contact</h2>
      <p>
        Pour toute question relative à vos données personnelles ou à cette politique : <strong>matchwork.app@gmail.com</strong>.
      </p>
    </LegalLayout>
  );
}
