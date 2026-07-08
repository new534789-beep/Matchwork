import { PrismaClient } from '@prisma/client';

const p = new PrismaClient({
  datasourceUrl: 'postgresql://neondb_owner:npg_RDgAmsG3nZi9@ep-empty-grass-as9bylpg.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

const SOURCES = [
  { nom: "Opportunity Desk Internships", url: "https://opportunitydesk.org/category/internships/feed/", type: "rss", categorie: "STAGE" },
  { nom: "Opportunities For Africans (Internships)", url: "https://www.opportunitiesforafricans.com/category/internships/feed/", type: "rss", categorie: "STAGE" },
  { nom: "GreatYop Internships", url: "https://greatyop.com/category/internships/feed/", type: "rss", categorie: "STAGE" },
  { nom: "Youthop Internships", url: "https://www.youthop.com/internships/feed", type: "rss", categorie: "STAGE" },
  { nom: "AIESEC Opportunities", url: "https://aiesec.org/search?type=internship", type: "scrape", categorie: "STAGE" },
  { nom: "Opportunity Desk Fellowships", url: "https://opportunitydesk.org/category/fellowships/feed/", type: "rss", categorie: "FORMATION" },
  { nom: "Opportunities For Africans (Training)", url: "https://www.opportunitiesforafricans.com/category/training-workshop/feed/", type: "rss", categorie: "FORMATION" },
  { nom: "GreatYop Training", url: "https://greatyop.com/category/training/feed/", type: "rss", categorie: "FORMATION" },
  { nom: "AUF Formations", url: "https://www.auf.org/les_services/formations/", type: "scrape", categorie: "FORMATION" },
  { nom: "Afri-Carrieres Admissions", url: "https://afri-carrieres.com/category/admission/feed/", type: "rss", categorie: "ADMISSION" },
  { nom: "Opportunity Desk Admissions", url: "https://opportunitydesk.org/category/admissions/feed/", type: "rss", categorie: "ADMISSION" },
  { nom: "Campus France Formations", url: "https://www.campusfrance.org/fr/les-formations", type: "scrape", categorie: "ADMISSION" },
  { nom: "StudyPortals Masters", url: "https://www.mastersportal.com/", type: "scrape", categorie: "ADMISSION" },
];

try {
  let crees = 0, ignores = 0;
  for (const s of SOURCES) {
    const existe = await p.fluxSource.findFirst({ where: { url: s.url } });
    if (existe) { ignores++; continue; }
    await p.fluxSource.create({ data: { ...s, actif: true, etat: "inconnu" } });
    crees++;
  }
  const total = await p.fluxSource.count();
  console.log(`OK: ${crees} sources ajoutees, ${ignores} deja presentes. Total: ${total}.`);
} catch (e) {
  console.error(e);
} finally {
  await p.$disconnect();
}
