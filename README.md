# Matchwork

Plateforme mobile-first pour trouver des bourses d'études et générer des dossiers de candidature complets, personnalisés et jamais génériques.

## Prérequis

- Node.js 20+
- PostgreSQL (local ou cloud — ex. [Neon](https://neon.tech), [Supabase](https://supabase.com))
- Clé API Anthropic ([console.anthropic.com](https://console.anthropic.com))

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env.local
# Puis éditer .env.local avec vos vraies valeurs

# 3. Générer le client Prisma
npx prisma generate

# 4. Appliquer les migrations
npx prisma migrate dev --name init

# 5. (Optionnel) Insérer quelques bourses de départ
npm run db:seed

# 6. Lancer en développement
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement (`.env.local`)

| Variable | Description | Obligatoire |
|---|---|---|
| `DATABASE_URL` | URL PostgreSQL complète | ✓ |
| `AUTH_SECRET` | Secret NextAuth — générer avec `openssl rand -base64 32` | ✓ |
| `AUTH_URL` | URL de base (`http://localhost:3000` en dev) | ✓ |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (Claude) | ✓ |
| `ENCRYPTION_KEY` | Clé AES-256 base64 32 octets — générer avec `openssl rand -base64 32` | ✓ |
| `STORAGE_LOCAL_DIR` | Dossier de stockage local (dev, défaut `.storage/`) | — |
| `QUOTA_GRATUIT_MENSUEL` | Générations gratuites/mois (défaut `3`) | — |

### Générer les clés

```bash
openssl rand -base64 32   # Pour AUTH_SECRET et ENCRYPTION_KEY (deux valeurs distinctes)
```

## Brancher l'API Anthropic

1. Créer un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générer une clé API
3. La coller dans `ANTHROPIC_API_KEY` dans `.env.local`
4. Le modèle utilisé : `claude-sonnet-4-6` (modifiable dans `app/api/ia/*/route.ts`)

## Brancher le paiement mobile money (phase 4)

L'interface `PaymentProvider` est dans `lib/paiement/types.ts`. En v1, le stub dans `lib/paiement/stub.ts` simule les paiements. Pour brancher MTN MoMo / Moov / BjPay, implémenter l'interface et changer `PAYMENT_PROVIDER` dans `.env.local`.

## Structure

```
app/
  (public)/       Landing, inscription, connexion
  (app)/          Tableau de bord, profil, coffre-fort, onboarding
  api/            API Routes (auth, profil, documents, IA)
components/       Composants UI réutilisables
lib/              Prisma, auth, chiffrement, stockage, prompts IA
prisma/           Schéma, migrations, seed
```

## Architecture extensible (phases 2-3)

Le schéma Prisma intègre déjà les entités pour :
- Emploi privé et Concours public (`TypeOpport.EMPLOI_PRIVE`, `CONCOURS_PUBLIC`)
- Espace employeur (source `POSTEE`)
- Quota et paiement (`QuotaUsage`)

Ces entités sont modélisées sans pages/API en v1 — les routes sont des stubs.

## Commandes utiles

```bash
npm run dev              # Dev
npm run build            # Build production
npx prisma studio        # Interface BDD
npx prisma migrate dev   # Nouvelle migration
npm run db:seed          # Insérer les bourses initiales
```
