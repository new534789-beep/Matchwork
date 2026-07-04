/**
 * Insère un jeu de sources de flux (idempotent — ignore celles déjà présentes).
 *   npm run sources:seed
 *
 * RSS = flux confirmés. SCRAPE = sites sans flux (à tester, le rendu dépend du site).
 * Toutes les offres récupérées passent par la file de validation (jamais publié auto).
 */
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

type Src = { nom: string; url: string; type: "rss" | "scrape"; categorie: string };

const SOURCES: Src[] = [
  // ── RSS confirmés ──────────────────────────────────────────────
  { nom: "ReliefWeb (emplois)", url: "https://reliefweb.int/jobs/rss.xml", type: "rss", categorie: "EMPLOI" },
  { nom: "Scholarship Region", url: "https://scholarshipregion.com/feed", type: "rss", categorie: "BOURSE" },
  { nom: "Nigerian Scholars", url: "https://nigerianscholars.com/feed", type: "rss", categorie: "BOURSE" },
  { nom: "MySchoolGist", url: "https://feeds.feedburner.com/myschoolgist", type: "rss", categorie: "BOURSE" },
  { nom: "Current School News", url: "https://currentschoolnews.com/feed", type: "rss", categorie: "BOURSE" },
  { nom: "Scholars4Dev", url: "https://www.scholars4dev.com/feed/", type: "rss", categorie: "BOURSE" },
  { nom: "AfterSchoolAfrica", url: "https://www.afterschoolafrica.com/feed/", type: "rss", categorie: "BOURSE" },
  { nom: "Opportunity Desk", url: "https://opportunitydesk.org/feed/", type: "rss", categorie: "BOURSE" },
  { nom: "Opportunities For Africans", url: "https://www.opportunitiesforafricans.com/feed/", type: "rss", categorie: "BOURSE" },
  // ── Scraping (sites sans RSS) — exemples à tester ──────────────
  { nom: "Chevening (scraping)", url: "https://www.chevening.org/scholarships/", type: "scrape", categorie: "BOURSE" },
  { nom: "DAAD bourses (scraping)", url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/", type: "scrape", categorie: "BOURSE" },
];

async function main() {
  let crees = 0;
  let ignores = 0;
  for (const s of SOURCES) {
    const existe = await prisma.fluxSource.findFirst({ where: { url: s.url } });
    if (existe) {
      ignores++;
      continue;
    }
    await prisma.fluxSource.create({ data: { nom: s.nom, url: s.url, type: s.type, categorie: s.categorie, actif: true } });
    crees++;
  }
  console.log(`OK : ${crees} source(s) ajoutée(s), ${ignores} déjà présente(s). Va sur /admin/sources puis « Récupérer maintenant ».`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
