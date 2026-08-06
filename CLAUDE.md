@AGENTS.md

# CLAUDE.md - Contexte Matchwork

Memo de contexte pour les agents IA (Claude Code, opencode). Mis a jour apres le chantier performance d'affichage (phases 1-8) + alertes WhatsApp (commit `4775230`), 6 aout 2026.

## Projet

- App connectee **Matchwork** : Next.js 16.2.9 (App Router + Turbopack), React 19.2.4, Prisma 6.19.3 + Neon (Postgres serverless), NextAuth 5 beta, FedaPay, PWA. Prod : `matchworks.app` sur Vercel (region HND).
- **Vrai projet : `C:\Users\hp\reelle mathwork\matchwork`** (git `main`). **NE PAS toucher `C:\Users\hp\matchwork`** : c'est une demo Supabase hors perimetre.
- Compte Neon : `ep-raspy-band-asr91ven` (branche principale, region `eu-central-1`).

## Etat git (CRITIQUE)

- Branche `perf/affichage` : **poussee sur `origin/perf/affichage`** (jamais mergee sur `main`). Vercel sert `origin/main` (`dabb78b`) -> la prod n'est PAS affectee tant qu'on ne merge pas.
- Commits locaux (ordre chronologique) :
  - `6faa61c` p1 (squelettes/loading non bloquant)
  - `b59e18b` p2 (session dedupliquee via `cache()`)
  - `1373a55` p3 (lectures utilisateur dedupliquees + tableau de bord borne)
  - `cc1c9d2` p4 (generalisation aux autres pages)
  - `1078a7d` p5 (cache applicatif des listes + 4 index en base)
  - `ecd387b` p6-7 (recharts lazy + providers deplaces)
  - `1efbe33` p8 (PERF.md)
  - `775c361` (utilisateur) fix barre de progression
  - `4775230` alertes WhatsApp Cloud API (voir section ci-dessous)
- **Travail utilisateur non commite a NE PAS toucher** : `lib/ia/generer.ts` (ajout fournisseur "local" via `lib/ia/local.ts`), `lib/ia/local.ts` et `scripts/vast/` non suivis (endpoint IA local Qwen3/VAST) ; **en cours** : PWA splash (`app/globals.css`, `app/layout.tsx`, `public/manifest.json`, `components/pwa/SplashVideo.tsx`, `public/splash/`). Verifier `git status` avant tout commit et ne jamais les stagier.

## Chantier performance (phases 1-8 terminees, PERF.md a la racine)

- P1 : overlay bloquant remplace par squelettes `loading.tsx` + `BarreProgression` non bloquante (composant `BarreProgression`, layout `(app)`).
- P2 : resolution de session Auth.js dedupliquee par requete (`cache()` dans `lib/auth.ts`) -> 1 resolution par navigation au lieu de 2+.
- P3 : lectures utilisateur Prisma dedupliquees par requete (meme `cache()`), requetes du tableau de bord bornees (take/limit) -> croissance constante avec l'anciennete du compte.
- P4 : recette generalisee aux pages categories, detail offre, candidatures, messagerie, coffre-fort, portail.
- P5 : cache applicatif `lib/opportunites/fil.ts` (`unstable_cache` par type, cle `["fil-opportunites", type]`, revalidate 3600, tags `["opportunites", "opportunites-"+type]`, take 200) + `idsInteragis(userId)` **hors cache** (le filtre par utilisateur reste frais apres swipe). 7 pages categories migrees. Migration `prisma/migrations/20260806100000_ajout_index_perf` **appliquee a Neon** (4 index : `opportunites_type_actif_statut_dateLimite_idx`, `interactions_userId_decision_idx`, `dossiers_userId_updatedAt_idx`, `documents_userId_idx`).
- P6 : audit navigation instantanee -> deja optimiste (MessagesClient envoi optimiste, FilSwipe optimiste, SW ignore navigation, skeletons partout). Rien a changer.
- P7 : recharts extrait dans un chunk lazy de ~376 Ko (composant `GraphiquesCharts.tsx` + `dynamic ssr:false` dans `GraphiqueSuivi.tsx`) ; `GenerationProvider` + `ToastProvider` deplaces de `app/layout.tsx` vers `app/(app)/layout.tsx` (seuls consommateurs dans `(app)`).
- P8 : `PERF.md` = protocol de mesure (0.2), cibles, observations Neon, actions utilisateur restantes.

## Alertes WhatsApp Cloud API (commit 4775230)

- `lib/whatsapp/envoyer.ts` : `envoyerAlerteOffre(to, {score,intitule,organisme,url})` = envoi **template** (messages business-initiated, obligatoire chez Meta) ; `envoyerTexte` = message libre (réponses webhook 24 h) ; `normaliserTelephone` = E.164 strict (null si pas d'indicatif +/00, on ne devine pas le pays) ; `lienOffreWhatsapp(id)` = `/opportunites/{id}?via=whatsapp`.
- Cron `app/api/cron/alertes-intelligentes/route.ts` : si `User.notifWhatsapp` ET téléphone E.164 sur le profil actif -> template WhatsApp, **sinon push Web** (comportement historique inchangé). Un seul `alerteEnvoyee` par utilisateur+offre (dédup inchangée).
- Schéma : `User.notifWhatsapp Boolean @default(false)` (opt-in explicite) + migration `20260806120000_add_whatsapp_notif` (IF NOT EXISTS) **appliquée à Neon** (même pattern que l'index phase 5 : appliquée en db execute, non enregistrée dans `_prisma_migrations` — idempotente, safe pour `migrate deploy`).
- **Env requis côté Meta (action utilisateur)** : `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NOM` (défaut `alerte_offre_correspondance`), `WHATSAPP_TEMPLATE_LANGUE` (défaut `fr`), `WHATSAPP_VERIFY_TOKEN` (webhook). **Template à créer dans Meta Business Manager avec 4 variables : {{1}} score, {{2}} intitulé, {{3}} organisme, {{4}} lien.** Sans template approuvé, l'API refuse (erreur HTTP).
- Le webhook `/api/whatsapp/webhook` utilise `envoyerTexte` (dédoublonné).

## Decouvertes / points sensibles

- **Fuite de secret** : `run-all-bots.mjs:3` (git-tracke) contient une URL Neon avec mot de passe en clair -> **tourner le mot de passe Neon** (action utilisateur en attente).
- **Neon cold-start** : pooler/host injoignables pendant le reveil (mesure locale : 1,6 s chaud / 6,1 s froid). Deux `next build` ont echoue sur le prerender `/offres` puis reussi apres rechauffement. Rechauffer la base avant un build si erreur `Can't reach database server`.
- **Pas de Server Action** dans le code (`"use server"` introuvable). Tout passe par des APIs fetch ; invalidation = `revalidateTag(tag, "max")` dans `lib/prisma.ts` (Next 16 : la forme mono-argument est depreciee).
- **`lucide-react@0.469.0` jamais importee** -> jamais bundlee. Ne pas l'ajouter.
- **`react-markdown`/`remark-gfm`** uniquement dans `components/public/BlogLayout.tsx` (serveur ISR) ; absents des chunks clients.
- **53 composants `"use client"`**, aucun sous `lib/` ni `app/api/`.
- **Route legacy** `app/api/opportunites/fil/route.ts` (GET publique, sans appelant) conservee volontairement.
- **`justSignedUp`** conserve : le layout `(app)` resout deja l'utilisateur via `cache()` ; passer en cookie ne gagnerait rien et menacerait le flux OAuth Google.
- **`proxy.ts`** : canonicalisation 308 vers matchworks.app + anti-scraping `/offres/*` (60 req/min). NE PAS DEFAIRE (correctif incident OAuth historique).
- Corrections de prod a ne pas defaire (plan section 8.6) : desinscription SW en dev, en-tete `no-cache` sur `/sw.js`, reprise sur erreur Neon transitoire dans `lib/auth.ts`.
- **Migration** : `prisma migrate dev` inutilisable (P3006, base fantome). Toute modif schema : `migrate diff` + fichier SQL + `prisma db execute` / `migrate deploy`. La migration de perf embarque aussi le champ fonctionnel `User.generationsBonus` non encore deploye en prod (attendu).
- **Piege rollback Vercel** : verifier `vercel alias ls` avant toute recette en prod.

## Environnement de dev (Windows)

- PowerShell 5.1 : pas de `<<<` heredoc ; `Set-Content -Encoding utf8` ajoute un BOM (utiliser `[System.IO.File]::WriteAllText` ou un Write tool sans BOM).
- Node v25.9.0. `process.loadEnvFile('.env.local')` fonctionne (utiliser pour tout script Node standalone).
- `node_modules/pg` absent -> connexions Prisma via `@prisma/client` uniquement.
- `.env.local` : 28 lignes / 21 cles, valide, sans BOM. `DATABASE_URL` = pooler (`ep-raspy-band-asr91ven-pooler.c-4.eu-central-1.aws.neon.tech`) avec `pgbouncer=true&connection_limit=1` ; `DIRECT_URL` = host direct (`ep-raspy-band-asr91ven.c-4.eu-central-1.aws.neon.tech`). **Copier `pgbouncer=true&connection_limit=1` sur la variable Vercel de prod (action utilisateur en attente).**
- Verification base (script valide) : `node C:\Users\hp\AppData\Local\Temp\opencode\warm-pooler.cjs` (test SELECT 1 sur pooler + direct) ; index verifiables via `C:\Users\hp\AppData\Local\Temp\opencode\check-indexes.cjs`.
- Build : `npx next build` (pas `npm run build`). Vérifs : `npm test` (101 tests, `tsx --test`) + `npx tsc --noEmit` + `npx eslint .`. Attention : le serveur local (`next start -p 3001`) verrouille le DLL du query engine — `prisma generate` peut échouer en EPERM dessus (le DLL est identique, les types .d.ts sont bien écrits, ignorez).

## Ce qui reste (actions utilisateur, detail dans PERF.md)

1. Merger/PR `perf/affichage` -> `main` (la branche est poussee sur `origin/perf/affichage`).
2. Vercel : corriger `DATABASE_URL` prod (pgbouncer + connection_limit) + `DIRECT_URL` + invalider le cache des variables.
3. Tourner le mot de passe Neon (fuite `run-all-bots.mjs`).
4. **WhatsApp** : créer le compte/app Business Meta + le template `alerte_offre_correspondance` (4 variables) + poser les `WHATSAPP_*` sur Vercel et `.env.local` ; option des alertes à exposer dans les paramètres utilisateur (non fait).
5. Tests fonctionnels 3G + controles post-deploiement (PWA/SW, `ChunkLoadError`, fumee `/offres/categorie/bourses`).
6. Mesures RUM post-deploiement selon protocol PERF.md (les baselines Lighthouse de la phase 0 n'ont jamais ete sauvegardees).
