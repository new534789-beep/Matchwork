/**
 * Seed de sources RÉELLES (candidates, à tester par le robot).
 *   npm run sources:seed-reel
 *
 * Idempotent (ignore une URL déjà présente). État "inconnu" = à tester ;
 * le robot fixera ok/panne au 1er passage. Jamais LinkedIn/Indeed.
 * Méthode : rss = flux /feed/ (souvent WordPress) ; scrape = page liste.
 */
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

type Src = { nom: string; url: string; type: "rss" | "scrape"; categorie: string };
const rss = (nom: string, url: string, categorie = "BOURSE"): Src => ({ nom, url, type: "rss", categorie });
const scr = (nom: string, url: string, categorie: string): Src => ({ nom, url, type: "scrape", categorie });

const SOURCES: Src[] = [
  // ── Bourses & opportunités (blogs → RSS /feed/) ──
  rss("Afri-Carrieres", "https://afri-carrieres.com/feed/"),
  rss("GreatYop", "https://greatyop.com/feed/"),
  rss("Le Boursier", "https://leboursier.net/feed/"),
  rss("CornerLib", "https://cornerlib.com/feed/"),
  rss("Djeli Afrique", "https://djeliafrique.com/feed/"),
  rss("Campus Médias", "https://campusmedias.com/feed/"),
  rss("Étudiant Africain", "https://etudiantafricain.wordpress.com/feed/"),
  rss("Setondji", "https://setondji.org/feed/"),
  scr("Scholar Africa", "https://scholar.africa/", "BOURSE"),
  rss("Opportunity Desk", "https://opportunitydesk.org/feed/"),
  rss("Opportunities For Africans", "https://www.opportunitiesforafricans.com/feed/"),
  rss("Youthop", "https://www.youthop.com/feed"),
  rss("Simoon CV (blog)", "https://simoon-cv.com/blog/feed/"),
  rss("Emploi Togo", "https://emploitogo.info/feed/", "EMPLOI"),

  // ── Bourses — portails officiels (scraping page liste) ──
  scr("Campus France", "https://www.campusfrance.org/fr/les-bourses", "BOURSE"),
  scr("AUF (appels)", "https://www.auf.org/les_services/appels-a-candidatures/", "BOURSE"),
  scr("DAAD", "https://www.daad.de/en/study-and-research-in-germany/scholarships/", "BOURSE"),
  scr("Chevening", "https://www.chevening.org/scholarships/", "BOURSE"),
  scr("ScholarshipPortal", "https://www.scholarshipportal.com/scholarships", "BOURSE"),
  scr("Mastercard Foundation", "https://mastercardfdn.org/all/scholars/", "BOURSE"),
  scr("Banque mondiale (Africa Fellowship)", "https://www.worldbank.org/en/programs/africa-fellowship", "BOURSE"),
  scr("Ashinaga", "https://www.ashinaga.org/en/", "BOURSE"),
  scr("ARES", "https://www.ares-ac.be/fr/cooperation-au-developpement/bourses", "BOURSE"),
  scr("Fondation Roi Baudouin", "https://kbs-frb.be/fr/appels", "BOURSE"),
  scr("UICC (fellowships)", "https://www.uicc.org/what-we-do/capacity-building/fellowships", "BOURSE"),
  scr("VLIR-UOS", "https://www.vliruos.be/en/scholarships/", "BOURSE"),
  scr("Jeunesse Francophonie", "https://jeunesse.francophonie.org/", "BOURSE"),

  // ── Emploi — Bénin ──
  scr("Emploi Bénin", "https://www.emploibenin.com/", "EMPLOI"),
  scr("NovoJob Bénin", "https://www.novojob.com/benin/offres-d-emploi", "EMPLOI"),
  scr("Job Bénin", "https://jobbenin.com/", "EMPLOI"),
  scr("BJ Emploi", "https://bjemploi.com/", "EMPLOI"),
  scr("Offres d'emplois BJ", "https://offresdemplois.bj/", "EMPLOI"),
  scr("WabaJob", "https://wabajob.com/", "EMPLOI"),
  scr("ANPE Bénin", "https://anpe.bj/", "EMPLOI"),
  scr("Gouv.bj (offres)", "https://www.gouv.bj/opportunites/offres-emploi/", "EMPLOI"),
  scr("Emploi Pipeline (gouv.bj)", "https://emploi-pipeline.gouv.bj/", "EMPLOI"),

  // ── Emploi — Afrique francophone & pan-africain ──
  scr("SenJob", "https://www.senjob.com/", "EMPLOI"),
  scr("Emploi Dakar", "https://www.emploidakar.com/", "EMPLOI"),
  scr("Emploi.ci", "https://www.emploi.ci/", "EMPLOI"),
  scr("Emploi.cm", "https://www.emploi.cm/", "EMPLOI"),
  scr("Emploi.cd", "https://www.emploi.cd/", "EMPLOI"),
  scr("AfricaWork", "https://www.africawork.com/", "EMPLOI"),
  scr("Afri-Emploi", "https://www.afri-emploi.com/", "EMPLOI"),
  scr("AfriqueJob", "https://www.afriquejob.com/", "EMPLOI"),
  scr("ProJob Ivoire", "https://www.projobivoire.com/", "EMPLOI"),
  scr("JobAfrique", "https://www.jobafrique.com/", "EMPLOI"),
  scr("SociumJob", "https://sociumjob.com/", "EMPLOI"),
  scr("Jeune Afrique (offres)", "https://www.jeuneafrique.com/emploi-formation/offres/", "EMPLOI"),
  scr("Abidjan.net Emploi", "https://emploi.abidjan.net/", "EMPLOI"),
  scr("GoAfricaOnline Emploi", "https://www.goafricaonline.com/emploi", "EMPLOI"),
  scr("Michael Page Africa", "https://www.michaelpageafrica.com/en/jobs", "EMPLOI"),
  scr("Afrique Emplois", "https://afriqueemplois.com/", "EMPLOI"),
  scr("UMO Interim", "https://umo-interim.com/jobs", "EMPLOI"),
  scr("JobnetAfrica", "https://www.jobnetafrica.com/fr/jobs", "EMPLOI"),
  scr("Expat-Dakar Emploi", "https://www.expat-dakar.com/emploi", "EMPLOI"),
  scr("CA Global", "https://www.caglobalint.com/fr/jobs", "EMPLOI"),
  scr("UNICEF Jobs", "https://jobs.unicef.org/", "EMPLOI"),
  scr("Jooble (FR)", "https://fr.jooble.org/", "EMPLOI"),
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
  console.log("→ Va sur /admin/robot puis « Lancer maintenant » (le robot fixera ok/panne).");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
