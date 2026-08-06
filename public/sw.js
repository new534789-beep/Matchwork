// Service worker Matchwork.
//
// Stratégie par type de requête — la règle générale est : ne jamais faire
// attendre le réseau pour quelque chose dont on a déjà une copie valable.
//
//   /_next/static/*   cache d'abord, sans revalidation. Ces fichiers portent
//                     une empreinte dans leur nom : un contenu modifié change
//                     de nom. Une copie en cache est donc valable pour
//                     toujours, et l'attendre du réseau est du temps perdu.
//   fichiers publics  cache d'abord, revalidation en arrière-plan (icônes,
//                     logos, images) : affichage immédiat, mise à jour
//                     silencieuse pour la fois suivante.
//   navigations       réseau, avec repli sur /offline. Le HTML des pages
//                     connectées contient des données personnelles : il n'est
//                     JAMAIS mis en cache (voir plus bas).
//
// Version du cache : à incrémenter pour forcer la purge chez les utilisateurs
// ayant déjà l'application installée.
const VERSION = "mw-v2";
const CACHE_IMMUABLE = `${VERSION}-immuable`;
const CACHE_PUBLIC = `${VERSION}-public`;

// Ressources indispensables au premier affichage.
//
// /lancement est le `start_url` du manifeste : c'est la page qu'ouvre un appui
// sur l'icône. La précharger permet de l'afficher depuis le téléphone, sans
// attendre le réseau — c'est ce qui rend l'ouverture immédiate.
const PRECACHE = ["/lancement", "/offline", "/icons/icon-192.png", "/logo.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_PUBLIC)
      // `addAll` est atomique : un seul fichier manquant fait échouer TOUT
      // l'événement d'installation, et le service worker n'est jamais activé —
      // donc plus aucun cache, plus de mode hors ligne, silencieusement. C'est
      // exactement ce qui se passait ici : la liste référençait
      // /icons/icon-192.svg, qui n'existe pas (le dossier ne contient que des
      // .png). On met donc chaque ressource en cache indépendamment, et un
      // échec isolé ne compromet plus l'installation.
      .then((c) =>
        Promise.all(
          PRECACHE.map((url) =>
            c.add(url).catch((err) => {
              console.warn(`[sw] préchargement ignoré pour ${url}`, err);
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cles) =>
        Promise.all(
          // Purge tout ce qui n'appartient pas à la version courante, y compris
          // l'ancien cache "mw-v1" qui stockait du HTML personnalisé.
          cles
            .filter((k) => k !== CACHE_IMMUABLE && k !== CACHE_PUBLIC)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Fichiers à empreinte : leur nom change dès que leur contenu change. */
function estImmuable(url) {
  return url.pathname.startsWith("/_next/static/");
}

/** Fichiers servis depuis /public : stables, mais peuvent être remplacés. */
function estRessourcePublique(url) {
  return /\.(?:png|jpe?g|svg|webp|avif|gif|ico|woff2?|mp4|webm)$/i.test(url.pathname);
}

/** Cache d'abord : on ne va sur le réseau que si la copie locale n'existe pas. */
async function cacheDAbord(requete, nomCache) {
  const cache = await caches.open(nomCache);
  const enCache = await cache.match(requete);
  if (enCache) return enCache;

  const reponse = await fetch(requete);
  if (reponse.ok) cache.put(requete, reponse.clone());
  return reponse;
}

/**
 * Cache d'abord, puis revalidation en arrière-plan : la copie locale est
 * renvoyée immédiatement, et le réseau met le cache à jour pour la prochaine
 * fois. L'utilisateur n'attend jamais.
 */
async function cacheEtRevalidation(requete, nomCache) {
  const cache = await caches.open(nomCache);
  const enCache = await cache.match(requete);

  const reseau = fetch(requete)
    .then((reponse) => {
      if (reponse.ok) cache.put(requete, reponse.clone());
      return reponse;
    })
    .catch(() => null);

  if (enCache) return enCache;
  const reponse = await reseau;
  if (reponse) return reponse;
  return new Response("", { status: 503 });
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Requêtes internes de navigation Next.js (RSC / prefetch) : ne jamais les
  // intercepter. Sur un raté réseau, on renvoyait une réponse vide (503) —
  // Next.js abandonnait alors la navigation en silence, sans jamais réessayer
  // nativement. En les laissant passer, une vraie erreur réseau remonte
  // normalement et Next.js peut gérer/réessayer comme prévu.
  if (e.request.headers.has("RSC") || e.request.headers.has("Next-Router-Prefetch")) return;

  if (estImmuable(url)) {
    e.respondWith(cacheDAbord(e.request, CACHE_IMMUABLE));
    return;
  }

  if (estRessourcePublique(url)) {
    e.respondWith(cacheEtRevalidation(e.request, CACHE_PUBLIC));
    return;
  }

  // Page de démarrage : servie depuis le téléphone, immédiatement.
  //
  // C'est la seule navigation mise en cache, et elle peut l'être sans risque
  // parce qu'elle ne contient aucune donnée personnelle — ni session, ni accès
  // à la base, uniquement un squelette identique pour tout le monde. C'est ce
  // qui permet à l'application d'apparaître à l'appui sur l'icône sans attendre
  // le réseau. La version fraîche est récupérée en arrière-plan pour la fois
  // suivante.
  if (url.pathname === "/lancement") {
    e.respondWith(cacheEtRevalidation(e.request, CACHE_PUBLIC));
    return;
  }

  // Navigations et tout le reste : réseau, repli sur la page hors ligne.
  //
  // La réponse n'est volontairement PAS mise en cache. La version précédente le
  // faisait pour toute réponse de même origine, ce qui stockait sur l'appareil
  // le HTML de pages connectées — donc des données personnelles (dossiers,
  // pièces du coffre-fort, quotas). Sur un téléphone partagé, ces pages
  // pouvaient réapparaître pour quelqu'un d'autre après une coupure réseau.
  e.respondWith(
    fetch(e.request).catch(async () => {
      if (e.request.mode === "navigate") {
        const horsLigne = await caches.match("/offline");
        if (horsLigne) return horsLigne;
      }
      return new Response("", { status: 503 });
    })
  );
});

self.addEventListener("push", (e) => {
  let data = { title: "Matchwork", body: "Nouvelle notification", url: "/tableau-de-bord" };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      // .png et non .svg : /icons/icon-192.svg n'existe pas, l'icône et le
      // badge des notifications push étaient donc absents sur le téléphone.
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes(url) && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
