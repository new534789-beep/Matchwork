/**
 * Seed de sources RSS/scrape pour stages, formations et admissions.
 * Ces sources sont traitées par le recuperateur.ts existant (FluxSource).
 *
 *   npx tsx scripts/seed-sources-stages-formations-admissions.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Src = { nom: string; url: string; type: "rss" | "scrape"; categorie: string };
const rss = (nom: string, url: string, categorie: string): Src => ({ nom, url, type: "rss", categorie });
const scr = (nom: string, url: string, categorie: string): Src => ({ nom, url, type: "scrape", categorie });

const SOURCES: Src[] = [
  // ── STAGE (internships) ──
  rss("Opportunity Desk Internships", "https://opportunitydesk.org/category/internships/feed/", "STAGE"),
  rss("Opportunities For Africans (Internships)", "https://www.opportunitiesforafricans.com/category/internships/feed/", "STAGE"),
  rss("GreatYop Internships", "https://greatyop.com/category/internships/feed/", "STAGE"),
  rss("Youthop Internships", "https://www.youthop.com/internships/feed", "STAGE"),
  scr("AIESEC Opportunities", "https://aiesec.org/search?type=internship", "STAGE"),

  // ── FORMATION (training / fellowships) ──
  rss("Opportunity Desk Fellowships", "https://opportunitydesk.org/category/fellowships/feed/", "FORMATION"),
  rss("Opportunities For Africans (Training)", "https://www.opportunitiesforafricans.com/category/training-workshop/feed/", "FORMATION"),
  rss("GreatYop Training", "https://greatyop.com/category/training/feed/", "FORMATION"),
  scr("AUF Formations", "https://www.auf.org/les_services/formations/", "FORMATION"),

  // ── ADMISSION (university admissions) ──
  rss("Afri-Carrieres Admissions", "https://afri-carrieres.com/category/admission/feed/", "ADMISSION"),
  rss("Opportunity Desk Admissions", "https://opportunitydesk.org/category/admissions/feed/", "ADMISSION"),
  scr("Campus France Formations", "https://www.campusfrance.org/fr/les-formations", "ADMISSION"),
  scr("StudyPortals Masters", "https://www.mastersportal.com/", "ADMISSION"),
];

async function main() {
  let crees = 0, ignores = 0;
  for (const s of SOURCES) {
    const existe = await prisma.fluxSource.findFirst({ where: { url: s.url } });
    if (existe) { ignores++; continue; }
    await prisma.fluxSource.create({ data: { nom: s.nom, url: s.url, type: s.type, categorie: s.categorie, actif: true, etat: "inconnu" } });
    crees++;
  }
  const total = await prisma.fluxSource.count();
  console.log(`OK : ${crees} source(s) ajoutée(s), ${ignores} déjà présente(s). Total en base : ${total}.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
