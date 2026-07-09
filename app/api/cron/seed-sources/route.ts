import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const SOURCES_RSS = [
  // ── Bourses (Afrique / International) ──
  { nom: "Opportunities for Africans", url: "https://www.opportunitiesforafricans.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "After School Africa", url: "https://www.afterschoolsafrica.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarship Region", url: "https://scholarshipregion.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Opportunity Desk", url: "https://opportunitydesk.org/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholars4Dev", url: "https://www.scholars4dev.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipsAds", url: "https://www.scholarshipsads.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ASAF Africa Online", url: "https://asafricaonline.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarship Positions", url: "https://scholarship-positions.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "StudyAbroad Aid", url: "https://www.studyabroadaid.com/feed", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipsCorner", url: "https://scholarshipscorner.website/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "MySchoolGist Scholarships", url: "https://www.myschoolgist.com/ng/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Bourses Etudes FR", url: "https://www.boursesetude.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Campus Bourses", url: "https://campusbourses.campusfrance.org/fria/bourse/rss", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarship Fellow", url: "https://scholarshipfellow.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Youth Opportunities Hub", url: "https://www.youthop.com/feed", categorie: "BOURSE_ETUDE" },
  { nom: "OYA Opportunities", url: "https://oyaop.com/feed/", categorie: "BOURSE_ETUDE" },

  // ── Emplois (Afrique) ──
  { nom: "Emploi Dakar", url: "https://www.emploidakar.com/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Senegal", url: "https://emploisenegal.com/feed/", categorie: "EMPLOI" },
  { nom: "Go Africa Online Jobs", url: "https://www.goafricaonline.com/sn/emploi/rss", categorie: "EMPLOI" },
  { nom: "Novafrica Jobs", url: "https://novafrica.net/feed/", categorie: "EMPLOI" },
  { nom: "Concoursn Senegal", url: "https://concoursn.com/feed/", categorie: "EMPLOI" },
  { nom: "Kerawa Africa Jobs", url: "https://www.kerawa.com/emploi/feed/", categorie: "EMPLOI" },
  { nom: "Abidjan.net Emploi", url: "https://emploi.abidjan.net/rss/offres", categorie: "EMPLOI" },
  { nom: "Optioncarriere Senegal", url: "https://www.optioncarriere.sn/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere CI", url: "https://www.optioncarriere.ci/emploi.rss", categorie: "EMPLOI" },

  // ── Stages ──
  { nom: "AIESEC Opportunities", url: "https://aiesec.org/feed", categorie: "STAGE" },
  { nom: "UNV Volunteer Opportunities", url: "https://www.unv.org/rss.xml", categorie: "STAGE" },

  // ── Formations ──
  { nom: "Coursera Blog", url: "https://blog.coursera.org/feed/", categorie: "FORMATION" },
  { nom: "Class Central", url: "https://www.classcentral.com/report/feed/", categorie: "FORMATION" },
  { nom: "MOOC Francophone", url: "https://www.mooc-francophone.com/feed/", categorie: "FORMATION" },

  // ── Appels à projets ──
  { nom: "Calls for Proposals Africa", url: "https://www.fundsforngos.org/feed/", categorie: "APPEL_PROJET" },
  { nom: "Devex Funding", url: "https://www.devex.com/news/rss", categorie: "APPEL_PROJET" },

  // ── Admissions ──
  { nom: "MasterPortal RSS", url: "https://www.mastersportal.com/rss/scholarships", categorie: "ADMISSION" },
  { nom: "StudyPortals News", url: "https://www.studyportals.com/feed/", categorie: "ADMISSION" },
];

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  let ajoutees = 0;
  let existantes = 0;

  for (const s of SOURCES_RSS) {
    const existe = await prisma.fluxSource.findFirst({ where: { url: s.url } });
    if (existe) {
      existantes++;
      continue;
    }
    await prisma.fluxSource.create({
      data: { nom: s.nom, url: s.url, type: "rss", categorie: s.categorie },
    });
    ajoutees++;
  }

  const total = await prisma.fluxSource.count({ where: { actif: true } });

  return NextResponse.json({ ok: true, ajoutees, existantes, totalActives: total });
}
