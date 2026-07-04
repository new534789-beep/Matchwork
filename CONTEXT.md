# Matchwork — Contexte du projet

> Dernière mise à jour : 2026-06-25
> Ce fichier décrit l'état réel du projet pour reprendre le travail rapidement (humain ou IA).

## 1. Vision

**Matchwork** est un SaaS d'aide à la candidature destiné aux candidats d'**Afrique de l'Ouest francophone**.
Il permet de :
1. Découvrir des opportunités (bourses, emplois, concours, résidences…) via un **fil de swipe** ;
2. Construire son **profil** en conversation avec une IA (Amara) ;
3. Générer automatiquement un **dossier complet** (CV + lettre de motivation) taillé pour chaque offre, ancré sur le profil et les pièces réelles, sans rien inventer ;
4. Suivre ses **candidatures**, **deadlines** et **pièces manquantes** depuis un tableau de bord.

Modèle **freemium** : 3 générations gratuites / mois, puis paiement mobile money (MTN MoMo / Moov / BjPay).

## 2. Stack technique

- **Next.js 16.2.9** (App Router, Turbopack) — ⚠️ version à breaking changes, voir `AGENTS.md`.
- **React + TypeScript**.
- **Prisma** + **SQLite** en dev (`prisma/dev.db`). → migrer vers **PostgreSQL** pour la prod.
- **NextAuth v5** (Auth.js) : provider **Credentials** (e-mail + mot de passe, bcrypt) + **Google OAuth**. Sessions **JWT**.
- **Mistral AI** (`@mistralai/mistralai`) pour toute l'IA (modèles `mistral-large-latest`, `mistral-small-latest`, `pixtral-large-latest` pour la vision). Clé `MISTRAL_API_KEY`.
- **Tailwind (v4, via `app/globals.css`)** + **variables CSS** pour le thème clair/sombre.
- Chiffrement des documents du coffre-fort (`lib/chiffrement.ts`, AES-256, clé `ENCRYPTION_KEY`).

## 3. Lancer le projet

```bash
# Variables dans .env.local (voir section 8)
npx prisma db push        # applique le schéma à SQLite + génère le client
npx next dev --turbopack  # serveur de dev sur http://localhost:3000
npx tsc --noEmit          # vérification de types
```

> Astuce : après création d'une **nouvelle route API**, si elle renvoie 404, supprimer `.next` puis relancer (le manifeste de routes peut être périmé).

## 4. Architecture des dossiers

```
app/
  (public)/            # pages non connectées
    page.tsx           # landing (hero, comment ça marche, fonctionnalités+iPhone, tarifs, FAQ)
    connexion/         # design « split » + bouton Google
    inscription/
  (app)/               # espace connecté (protégé par middleware + AppShell)
    layout.tsx         # garde d'auth + <AppShell> (sidebar)
    opportunites/      # fil de swipe (FilSwipe) + détail [id]
    candidatures/      # « Mes candidatures »
    dossiers/[id]/     # page d'un dossier (éditeur, checklist, actions)
    coffre-fort/       # documents chiffrés
    compte/            # abonnement + paiement (CompteClient)
    messages/          # messagerie organisme ↔ candidat (MessagesClient)
    profil/            # édition profil (FormulaireProfil)
    parametres/
    tableau-de-bord/   # accueil connecté (données serveur → TableauBordClient à onglets)
    onboarding/        # chat Amara (InterfaceOnboarding) — plein écran
    coller-offre/      # coller une annonce → analyse IA
  api/
    auth/[...nextauth] # handlers NextAuth
    auth/inscription   # création de compte (bcrypt)
    ia/                # onboarding, lire-offre, traduire, extraire-document (Mistral)
    dossiers/          # generer, [id] (GET/PATCH/DELETE), [id]/regenerer, [id]/documents/[docId], [id]/email
    documents/         # coffre-fort (upload/list/delete)
    opportunites/[id]/interaction  # swipe (interesse/ignore)
    paiement/          # initier, confirmer (stubs)
    profil/            # PUT profil + sessionOnboarding
    messages/          # POST message (candidat)
components/
  navigation/  NavLateral (sidebar), AppShell, EnteteApp, NavMobile
  chat/        InterfaceOnboarding (Amara)
  tableau/     TableauBordClient (stats + onglets)
  opportunites/ CouvertureOffre (visuel d'offre), CollerOffreForm
  messages/    MessagesClient
  auth/        AuthShell, BoutonGoogle
  landing/     SectionTarifs
  coffre-fort/ CoffreFortClient
  profil/      FormulaireProfil
  ui/          carte, champ, bouton, badge
lib/
  auth.ts            # config NextAuth (Credentials + Google conditionnel)
  prisma.ts          # client Prisma
  ia/                # mistral.ts (client + MODELS) + prompts/ (onboarding, lire-offre, generation, extraction)
  paiement/          # types (interface PaymentProvider), factory, stubs/{mtn,moov,bjpay}
  theme/ThemeContext.tsx  # ThemeProvider (clair/sombre, localStorage)
  chiffrement.ts, storage.ts, utils.ts
public/logo.png      # logo M violet (fond transparent), public/apercu-amara.png (capture étape onboarding)
prisma/schema.prisma # SQLite
```

## 5. Modèles de données (Prisma)

- **User** : email, motDePasse (vide pour comptes Google), `plan` (`gratuit` | `payant`), relations.
- **Profil** : `nomComplet`, bio, formations/experiences/competences/langues (JSON string), objectifs, tonSouhaite, `complete`, `sessionOnboarding`.
- **Document** (coffre-fort) : type, nomFichier, refStockage (chiffré), infosExtraites (JSON), extraitParIa.
- **Opportunite** : type (`BOURSE`…), source, organisme, intitule, description, langueDetectee, conditions, piecesExigees (JSON `[{nom,obligatoire}]`), exigenceLangue, dateLimite, lien, actif.
- **Interaction** : userId + opportuniteId, decision (`interesse` | `ignore`), unique (user, opp).
- **Dossier** : userId, opportuniteId, **statut** (`a_preparer` → `genere` → `utilise`), checklist, relations docsGeneres.
- **DocumentGenere** : type (`cv` | `lettre` | …), contenu, langue, `accroches` (JSON — anti-répétition).
- **QuotaUsage** : userId + mois (`YYYY-MM`), `generationsUtilisees`. Unique (user, mois).
- **Paiement** : userId, montant, fournisseur, statut, reference.
- **Message** : userId, auteur (`candidat` | `organisme` | `systeme`), nomAuteur, contenu, lu.

## 6. Flux clés

- **Auth** : middleware (`middleware.ts`, Edge — ne pas y importer Prisma) protège les routes privées ; redirige connectés hors de /connexion. Google : à la connexion, upsert User + Profil dans le callback `signIn` (Node), `jwt` reste sans Prisma (sinon casse le bundle Edge → 404 global).
- **Onboarding** : Amara (Mistral, JSON structuré) collecte le profil section par section ; la route tolère tout type renvoyé (coercition vers chaîne/JSON) pour ne jamais planter Prisma.
- **Génération** : déclenchée **automatiquement au swipe-droite** (en arrière-plan). Le dossier est créé en `a_preparer`, puis passe à `genere` (CV + lettre Mistral, anti-répétition, langue de l'offre, zéro invention). Quota atteint → reste `a_preparer`.
- **Cycle de vie dossier** : `genere` = annulable (DELETE rend +1 crédit le mois courant si plan gratuit) ; **Postuler / Télécharger / Recevoir e-mail** → `utilise` (verrouillé, crédit consommé).
- **Checklist de conformité** : compare `piecesExigees` ↔ documents du coffre (mapping par mots-clés) + deadline.
- **Paiement** : `PaymentProvider` (interface) + stubs sandbox MTN/Moov/BjPay ; `confirmer` réussi → `plan = payant` (quota levé). Aucune donnée de paiement sensible stockée.

## 7. Règles de design (NON négociables)

- **Palette stricte** : **violet `#7c3aed`** (+ clair `#a78bfa`, lavande `#c4b5fd`), **noir pur `#0a0a0a`**, **blanc**. Pas de vert/bleu/orange « décoratifs ». Rouge réservé aux messages d'erreur.
- **Aucun emoji** : icônes en **SVG** uniquement.
- **Thème clair ET sombre** via variables CSS (`var(--bg)`, `var(--text)`, `var(--text-2/3/4)`, `var(--border)`, `var(--bg-card)`…). En clair, le texte est **noir** (pas gris pâle).
- **Mobile-first**, interface **100 % en français**.
- **Sidebar latérale** (NavLateral) : icônes violet pur, item actif = pilule violette pleine + icône/texte blancs (inversion).
- La section « Aura » de la landing garde son **dégradé violet** dans les deux thèmes.

## 8. Variables d'environnement (`.env.local`)

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | `file:./dev.db` (SQLite dev) |
| `AUTH_SECRET` | secret de signature des sessions (rotation = déconnecte tout le monde) |
| `AUTH_URL` | `http://localhost:3000` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth Google (redirect : `/api/auth/callback/google`) |
| `MISTRAL_API_KEY` | clé Mistral (IA) |
| `ENCRYPTION_KEY` | chiffrement des documents du coffre |
| `QUOTA_GRATUIT_MENSUEL` | quota gratuit (défaut 3) |
| `PAYMENT_PROVIDER` | `stub` en v1 |
| `RESEND_API_KEY` | *(à fournir)* envoi d'e-mails — sinon « Recevoir par e-mail » reste un stub gracieux |

> ⚠️ Ne jamais committer de secrets. Les valeurs réelles vivent uniquement dans `.env.local`.

## 9. État v1 & points à brancher avant lancement

**Fonctionne (dev/stub) :** auth e-mail + Google, onboarding IA, coffre chiffré, fil de swipe + couverture d'offre, lecture/traduction d'offre, génération auto CV+lettre, checklist, éditeur + export PDF (impression navigateur), cycle `a_preparer`/`genere`/`utilise` + annulation/remboursement, quota + blocage, paiement stub, page Compte, tableau de bord à onglets, messagerie.

**Conformité étape 2 (swipe) — fait le 2026-06-26 :** flèches clavier (→ intéressé / ← passer), carte élargie (~576 px), « Ça m'intéresse » crée le dossier + déclenche la génération auto, **bouton « Générer » retiré** de la page détail (génération 100 % auto au swipe).

**À brancher pour de vrai (avant lancement) :**
- **Paiement réel** : vraies API MTN/Moov/BjPay derrière `PaymentProvider` (comptes marchands, redirections, webhooks).
- **Envoi e-mail réel** : `RESEND_API_KEY` (ou SMTP) — Postuler/Recevoir par e-mail.
- **Vraies bourses** : remplacer le seed par une source/curation réelle d'opportunités.
- **Base de production** : PostgreSQL au lieu de SQLite.
- **Hébergement / déploiement** + nom de domaine.
- **Pages légales** : CGU, politique de confidentialité, mentions légales (SaaS traitant des données personnelles).
- **Tier IA renforcé** pour les documents sensibles (confidentialité).
- *(optionnel / polish)* rafraîchissement auto de « Mes candidatures » pendant la génération ; notifications ; tableau de bord organisme.
