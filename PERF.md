# PERF - Performance d'affichage Matchwork

Document de reference du chantier de performance d'affichage (plan `Plan-Performance-Matchwork.pdf`).
Branche de travail : `perf/affichage`. Production : `matchworks.app` sur Vercel (`origin/main`).

## Etat au moment de la redaction (6 aout 2026)

Phases 1 a 7 realisees, verifiees et commitees sur `perf/affichage` (jamais poussee) :

| Commit | Phase | Contenu |
|---|---|---|
| `6faa61c` | 1 | Suppression de l'ecran de chargement bloquant -> squelettes `loading.tsx` + `BarreProgression` non bloquante |
| `b59e18b` | 2 | Resolution de session Auth.js dedupliquee par requete (`cache()`), une seule fois par navigation |
| `1373a55` | 3 | Lectures utilisateur Prisma dedupliquees par requete + requetes du tableau de bord bornees |
| `cc1c9d2` | 4 | Generalisation aux autres pages (categories, detail, candidatures, messagerie, coffre-fort...) |
| `1078a7d` | 5 | Cache applicatif des listes d'opportunites (`unstable_cache` par type) + 4 index en base (migration appliquee a Neon) |
| `ecd387b` | 6-7 | Navigation instantanee auditee (deja optimiste) + recharts charge a la demande + providers generiques restreints a l'espace connecte |

Verifications en local (toutes vertes a `ecd387b`) : `npm test` 95/95, `tsc` 0 erreur, `eslint` 0 erreur, `next build` 151 routes OK.

## Mesure - etat de reference

> Avertissement : les mesures Lighthouse de la phase 0 (tache 0.2/0.3) n'ont pas ete sauvegardees a l'epoque.
> Elles ne peuvent donc pas etre reconstruites retroactivement. La procedure ci-dessous est celle a suivre
> apres deploiement ; les chiffres obtenus deviendront la reference et seront compares au cible du plan.

### Protocole a reproduire (tache 0.2 du plan)

- Meme compte utilisateur avec un historique fourni (plusieurs centaines d'interactions ; un compte neuf ne
  revele jamais la cause "requetes non bornees").
- Mode mobile, bridage reseau identique, cache navigateur vide.
- Trois executions consecutives, mediane retenue (le premier hit serverless n'est pas representatif).
- Mesure en production ou preview Vercel, jamais en dev local (Turbopack dev ne reflete rien).

Pages : `/tableau-de-bord`, `/opportunites/bourses`, `/candidatures`, `/offres`.
Valeurs a relever : LCP, TTFB, TBT, CLS.

Cibles du plan :

| Indicateur | Avant (plan) | Cible |
|---|---|---|
| Overlay de chargement modal | a chaque clic sur lien interne | supprime (fait) |
| Duree max d'interface gelee | jusqu'a 6000 ms | 0 ms (fait) |
| Delai clic -> premier retour visuel | depend du serveur | < 200 ms |
| Resolutions de session par navigation | >= 2 | 1 (fait) |
| Requetes Prisma du layout | 1 systematique | 0 (fait) |
| LCP du tableau de bord (mobile) | a mesurer | < 1200 ms |
| recharts dans le bundle admin | inclus partout | charge a la demande (fait) |
| Fichiers `loading.tsx` | 0 sur 42 routes | toutes les routes de donnees (fait) |

### Observations deja mesurees en local (a confirmer en prod)

- **Latence Neon (tache 0.4)** : test `SELECT 1` depuis cette machine (Windows, Node 25, Prisma 6.19.3) :
  pooler `ep-raspy-band-asr91ven-pooler...` = 1,6 s a chaud / 6,1 s a froid ; host direct = 1,6 s a chaud.
  Le pooler **cold-start peut depasser le timeout du prerender** : deux builds ont echoue sur `/offres`
  puis reussi apres rechauffement. Ce phenomene doit etre mesure depuis une fonction Vercel (region HND) et
  le budget de temps verifie avant d'incriminer autre chose que la base.
- **Chaine de connexion (tache 0.5)** : `.env.local` valide avec `DATABASE_URL` = pooler +
  `pgbouncer=true&connection_limit=1`, `DIRECT_URL` = host direct. **A recopier tel quel sur Vercel**
  (action utilisateur, voir plus bas). La valeur Vercel en production doit etre verifiee/corrigee.
- **First Load JS admin** : apres phase 7, recharts est isole dans un chunk dynamique de ~376 Ko
  (`2yuowa2vp06n9.js` dans `.next/static/chunks` du build) charge uniquement quand le graphique monte.
  `react-markdown`/`remark-gfm` ne sont presents dans aucun chunk cote client (blog serveur ISR uniquement).
  Relever la table route -> ko du `next build` apres deploiement (le build Turbopack ne l'affiche plus
  directement en console).

## Actions restantes

### Utilisateur (necessaires avant/au deploiement)

1. **Pousser la branche** `perf/affichage` puis merger/PR sur `main` (travail local jamais pousse a ce jour).
2. **Vercel - variables d'environnement** : verifier que `DATABASE_URL` (pooler) porte
   `pgbouncer=true&connection_limit=1` et que `DIRECT_URL` pointe sur le host direct (meme correction que
   `.env.local`). Puis invalider le cache des variables (settings) avant deploiement.
3. **Fuite de secret** : `run-all-bots.mjs:3` (suivi par git) contient une URL Neon avec mot de passe en
   clair -> **tourner le mot de passe Neon** et remplacer la valeur dans le fichier.
4. **Verifier le piege du rollback Vercel** (risque 8.1 du plan) : `vercel alias ls` avant toute recette pour
   s'assurer que `matchworks.app` pointe sur le nouveau deploiement.
5. **Tests fonctionnels en 3G simulee** (tache 8.3) : connexion, tableau de bord, swipe, consultation d'une
   offre, generation d'un dossier, messagerie.
6. **Controles post-deploiement** : aucune donnee privee dans le HTML rendu / squelettes (8.4) ; PWA Android :
   mise a jour du service worker, absence de `ChunkLoadError` (8.5) ; fumee sur `/offres/categorie/bourses`
   (8.7) ; domaine pointe sur le dernier deploiement (8.6).

### Points de vigilance du plan

- **Ne pas defaire** : desinscription du SW en dev (ChunkLoadError en boucle), en-tete `no-cache` sur
  `/sw.js`, reprise sur erreur Neon transitoire dans `lib/auth.ts`, canonicalisation d'hote dans `proxy.ts`.
- **Migrer via SQL** : `prisma migrate dev` est inutilisable (P3006, base fantome). Toute migration passe par
  `migrate diff` + `migrate deploy`. La migration `20260806100000_ajout_index_perf` est deja appliquee a Neon.
- **La migration embarque** le champ fonctionnel `User.generationsBonus` non encore deploye en prod (risque 8.3) :
  c'est attendu.
- **Route legacy** `app/api/opportunites/fil/route.ts` (publique, sans appelant) conservee volontairement :
  suppression sans gain, risque au deploiement.
- **`justSignedUp`** conserve sous sa forme actuelle : le layout de l'espace connecte resout deja l'utilisateur
  une seule fois (deduplique par `cache()`), le passer en cookie ne gagnerait rien et menacerait le flux Google.
- **Neon** : cold-start transitoire observee (refus de connexion pendant le prerender). A surveiller en RUM ;
  si la latence mediane depuis Vercel depasse 250 ms, le cache applicatif (phase 5) est deja en place.

## Methode de comparaison avant / apres

1. Deployer, verifier `vercel alias ls`.
2. Executer le protocole 0.2 sur les 4 pages, consigner les 16 valeurs dans ce fichier (tableau ci-dessous).
3. Comparer aux cibles du plan et aux valeurs d'une preview basee sur `main` si elle existe encore.
4. Journaliser dans ce fichier la table route -> ko du build.

| Page | LCP (avant) | LCP (apres) | TTFB (avant) | TTFB (apres) | TBT (avant) | TBT (apres) | CLS (avant) | CLS (apres) |
|---|---|---|---|---|---|---|---|---|
| `/tableau-de-bord` | n/a |  | n/a |  | n/a |  | n/a |  |
| `/opportunites/bourses` | n/a |  | n/a |  | n/a |  | n/a |  |
| `/candidatures` | n/a |  | n/a |  | n/a |  | n/a |  |
| `/offres` | n/a |  | n/a |  | n/a |  | n/a |  |
