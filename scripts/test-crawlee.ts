/**
 * Test de capacité — Crawlee comme alternative Node-native à Scrapling pour
 * scraper des jobboards ouest-africains sans API publique (Jobberman, Emploi.ci).
 *
 * Deux crawlers testés :
 * - CheerioCrawler : HTTP simple + parsing HTML, rapide, pas de JS.
 * - PlaywrightCrawler : navigateur headless réel, passe les protections
 *   anti-bot type Cloudflare ("Un instant…" vu sur emploi.ci en prod).
 *
 * Jetable — pas branché à la base ni à l'ingestion. Juste pour évaluer si
 * Crawlee arrive à extraire des offres réelles avant d'investir dans un
 * scraper de prod pour ces sites.
 *
 *   npx tsx scripts/test-crawlee.ts
 */
import { CheerioCrawler, Configuration } from "@crawlee/cheerio";

// Pas de stockage disque persistant pour un test jetable.
Configuration.getGlobalConfig().set("persistStorage", false);

type Resultat = { site: string; methode: string; ok: boolean; nbOffres: number; echantillon: string[]; erreur?: string };

const resultats: Resultat[] = [];

async function testerCheerio(nom: string, url: string, selecteurOffre: string): Promise<void> {
  const titres: string[] = [];
  let erreur: string | undefined;

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 1,
    requestHandlerTimeoutSecs: 30,
    async requestHandler({ $, response }) {
      if ((response.statusCode ?? 200) >= 400) {
        erreur = `HTTP ${response.statusCode}`;
        return;
      }
      $(selecteurOffre).each((_, el) => {
        const t = $(el).text().trim();
        if (t) titres.push(t.slice(0, 100));
      });
    },
    failedRequestHandler({ request }, err) {
      erreur = err instanceof Error ? err.message.slice(0, 200) : String(err);
    },
  });

  try {
    // uniqueKey distinct : évite que la file de requêtes par défaut (partagée
    // entre crawlers dans le même process) ignore cette URL comme "déjà vue"
    // si un autre crawler (Playwright) l'a déjà traitée dans ce run.
    await crawler.run([{ url, uniqueKey: `${url}::cheerio` }]);
  } catch (e) {
    erreur = e instanceof Error ? e.message.slice(0, 200) : String(e);
  }

  resultats.push({
    site: nom,
    methode: "CheerioCrawler (HTTP simple)",
    ok: titres.length > 0,
    nbOffres: titres.length,
    echantillon: titres.slice(0, 5),
    erreur,
  });
}

async function testerPlaywright(nom: string, url: string, selecteurOffre: string): Promise<void> {
  const titres: string[] = [];
  let erreur: string | undefined;

  // Import dynamique : si le paquet `playwright` n'est pas installé, on veut
  // un échec propre et isolé à ce test, pas un crash de tout le script (import
  // statique de crawlee entraîne `require('playwright')` au chargement du module).
  let PlaywrightCrawler: typeof import("@crawlee/playwright").PlaywrightCrawler;
  try {
    ({ PlaywrightCrawler } = await import("@crawlee/playwright"));
  } catch (e) {
    resultats.push({
      site: nom,
      methode: "PlaywrightCrawler (navigateur headless)",
      ok: false,
      nbOffres: 0,
      echantillon: [],
      erreur: `paquet playwright indisponible : ${e instanceof Error ? e.message.slice(0, 150) : String(e)}`,
    });
    return;
  }

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 1,
    requestHandlerTimeoutSecs: 45,
    launchContext: { launchOptions: { headless: true } },
    async requestHandler({ page }) {
      // Laisse le temps à un éventuel challenge anti-bot / JS de se résoudre.
      await page.waitForTimeout(4000);
      const elements = await page.locator(selecteurOffre).allTextContents();
      for (const t of elements) {
        const trimmed = t.trim();
        if (trimmed) titres.push(trimmed.slice(0, 100));
      }
      if (titres.length === 0) {
        // Diagnostic : le sélecteur n'a rien trouvé — on log le titre de page
        // et un extrait du texte visible pour comprendre ce qui a été rendu
        // (page de challenge anti-bot ? structure différente de nos suppositions ?).
        const pageTitle = await page.title();
        const bodyText = await page.locator("body").innerText().catch(() => "");
        console.log(`  [diag ${nom}] titre de page: "${pageTitle}" — ${bodyText.length} car. de texte visible`);
        console.log(`  [diag ${nom}] extrait: ${bodyText.replace(/\s+/g, " ").slice(0, 300)}`);
      }
    },
    failedRequestHandler({ request }, err) {
      erreur = err instanceof Error ? err.message.slice(0, 200) : String(err);
    },
  });

  try {
    await crawler.run([{ url, uniqueKey: `${url}::playwright` }]);
  } catch (e) {
    erreur = e instanceof Error ? e.message.slice(0, 200) : String(e);
  }

  resultats.push({
    site: nom,
    methode: "PlaywrightCrawler (navigateur headless)",
    ok: titres.length > 0,
    nbOffres: titres.length,
    echantillon: titres.slice(0, 5),
    erreur,
  });
}

async function main() {
  console.log("=== Test de capacité Crawlee sur jobboards ouest-africains ===\n");

  // Cheerio d'abord pour les deux sites (aucune dépendance sur playwright) :
  // on garantit des résultats même si le navigateur headless est indisponible.
  await testerCheerio("Emploi.ci", "https://www.emploi.ci/recherche-jobs-cote-ivoire", "article, .job-item, .job-list-item");
  await testerCheerio("Jobberman NG", "https://www.jobberman.com.ng/jobs", "[class*='job'], article");

  // Emploi.ci et Emploi Bénin ont affiché un interstitiel "Un instant…"
  // (probable anti-bot) en navigation manuelle : bon cas de test pour
  // Playwright (navigateur réel).
  await testerPlaywright("Emploi.ci", "https://www.emploi.ci/recherche-jobs-cote-ivoire", "article, .job-item, .job-list-item, [class*='job']");
  await testerPlaywright("Jobberman NG", "https://www.jobberman.com.ng/jobs", "[class*='job'], article");
  await testerPlaywright("Emploi Bénin", "https://www.emploibenin.com/recherche-jobs-benin", "article, .job-item, .job-list-item, [class*='job']");

  console.log("\n=== Résultats ===\n");
  for (const r of resultats) {
    console.log(`${r.ok ? "OK" : "ECHEC"} — ${r.site} via ${r.methode}`);
    console.log(`  offres trouvées: ${r.nbOffres}`);
    if (r.erreur) console.log(`  erreur: ${r.erreur}`);
    if (r.echantillon.length) r.echantillon.forEach((t) => console.log(`    - ${t}`));
    console.log("");
  }
}

main();
