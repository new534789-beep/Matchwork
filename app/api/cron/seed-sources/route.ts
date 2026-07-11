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

  // ── Bourses (supplément) ──
  { nom: "ScholarshipsTree", url: "https://scholarshipstree.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "AfterSchool Africa Scholarships", url: "https://www.afterschoolsafrica.com/scholarships/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "HowToAbroad", url: "https://howtoabroad.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "FullyFundedScholarships", url: "https://fullyfundedscholarships.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipsIn", url: "https://scholarshipsin.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "WorldScholarshipForum", url: "https://worldscholarshipforum.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "OpportunityInfo", url: "https://opportunityinfo.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "DiscoverPhDs Scholarships", url: "https://www.discoverphds.com/feed", categorie: "BOURSE_ETUDE" },
  { nom: "StudentScholarshipSearch", url: "https://studentscholarshipsearch.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipsHub", url: "https://scholarshipshub.net/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "FreeScholarships", url: "https://www.freescholarships.net/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "FindAScholarship", url: "https://www.findascholarship.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "BoursesDAfrique", url: "https://www.boursesdafrique.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "EtudesEnFrance", url: "https://www.etudes-en-france.net/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "BoursesEtudes Net", url: "https://boursesetudes.net/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "TopScholarships", url: "https://topscholarships.org/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "MBBSAbroad", url: "https://mbbsabroad.in/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipOwl Blog", url: "https://scholarshipowl.com/blog/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "AfricaGrantmakers", url: "https://africagrantmakers.org/feed/", categorie: "BOURSE_ETUDE" },

  // ── Bourses (lot 3 — portails WordPress connus) ──
  { nom: "ScholarshipRoar", url: "https://scholarshiproar.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "FindAJobInAfrica Scholarships", url: "https://findajobinafrica.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Education Ghana", url: "https://educationghana.org/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Advance Africa", url: "https://www.advance-africa.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarship Tab", url: "https://www.scholarshiptab.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarship Set", url: "https://www.scholarshipset.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Current School News", url: "https://currentschoolnews.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "CareersNGR", url: "https://www.careersngr.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Nigerian Scholars", url: "https://nigerianscholars.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipsFor Net", url: "https://www.scholarshipsfor.net/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "IOScholarships", url: "https://www.ioscholarships.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Gilman Scholarship", url: "https://www.gilmanscholarship.org/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarship System", url: "https://thescholarshipsystem.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "LeapScholar Scholarships", url: "https://leapscholar.com/blog/category/scholarships/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Asante Africa Foundation", url: "https://asanteafrica.org/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "World Education Blog Africa", url: "https://world-education-blog.org/category/africa/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipAndGrants", url: "https://www.scholarshipsandgrants.us/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarship Union", url: "https://scholarshipunion.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ApplyBuddy", url: "https://applybuddy.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "BursariesPortal SA", url: "https://www.bursariesportal.co.za/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "MyFunding SA", url: "https://www.myfunding.co.za/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipCare", url: "https://www.scholarshipcare.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Scholarships Hall", url: "https://scholarshipshall.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Study In Germany", url: "https://www.studying-in-germany.org/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Maroc Bourses", url: "https://www.marocbourses.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Bourse Etudiant FR", url: "https://www.bourseetudiant.fr/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Concouria", url: "https://concouria.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "OpportunityBag", url: "https://www.opportunitybag.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "ScholarshipPlus", url: "https://scholarshipplus.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "TargetStudy Scholarships", url: "https://targetstudy.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "DAAD Scholarships", url: "https://www.daad.de/en/rss/", categorie: "BOURSE_ETUDE" },
  { nom: "StudyInEurope", url: "https://www.studyineurope.eu/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "StudyInTurkey", url: "https://www.studyinturkey.com/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Chevening Feed", url: "https://www.chevening.org/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Commonwealth Scholarships", url: "https://cscuk.fcdo.gov.uk/feed/", categorie: "BOURSE_ETUDE" },
  { nom: "Erasmus Plus Feed", url: "https://erasmus-plus.ec.europa.eu/rss.xml", categorie: "BOURSE_ETUDE" },

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
  { nom: "Jobberman Ghana", url: "https://www.jobberman.com.gh/feed", categorie: "EMPLOI" },
  { nom: "Jobberman Nigeria", url: "https://www.jobberman.com/feed", categorie: "EMPLOI" },
  { nom: "MyJobMag", url: "https://www.myjobmag.com/feed", categorie: "EMPLOI" },
  { nom: "BrighterMonday Kenya", url: "https://www.brightermonday.co.ke/feed", categorie: "EMPLOI" },
  { nom: "Careers24 SA", url: "https://www.careers24.com/rss/", categorie: "EMPLOI" },
  { nom: "Afribaba CI Jobs", url: "https://www.afribaba.ci/emploi/feed/", categorie: "EMPLOI" },
  { nom: "CadreOnline Mali", url: "https://www.cadreonline.ml/feed/", categorie: "EMPLOI" },
  { nom: "GuineeJobs", url: "https://guineejobs.com/feed/", categorie: "EMPLOI" },
  { nom: "Offre Emploi Africa", url: "https://www.offreemploi.africa/feed/", categorie: "EMPLOI" },
  { nom: "SenCadre Emploi", url: "https://sencadre.com/feed/", categorie: "EMPLOI" },
  { nom: "JobInforme", url: "https://www.jobinforme.com/feed/", categorie: "EMPLOI" },
  { nom: "EmploiPartner CI", url: "https://emploipartner.ci/feed/", categorie: "EMPLOI" },
  { nom: "ReliefWeb Jobs", url: "https://reliefweb.int/updates/rss.xml?source=job", categorie: "EMPLOI" },
  { nom: "DevJobs Africa", url: "https://devjobsafrica.com/feed/", categorie: "EMPLOI" },

  // ── Emplois (lot 2 — international + ONG) ──
  { nom: "ReliefWeb All", url: "https://reliefweb.int/updates/rss.xml", categorie: "EMPLOI" },
  { nom: "Devex Jobs", url: "https://www.devex.com/jobs/rss", categorie: "EMPLOI" },
  { nom: "UNJobs Feed", url: "https://unjobs.org/rss", categorie: "EMPLOI" },
  { nom: "Careers In Africa", url: "https://www.careersinafrica.com/feed/", categorie: "EMPLOI" },
  { nom: "Optioncarriere Cameroun", url: "https://www.optioncarriere.cm/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Mali", url: "https://www.optioncarriere.ml/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere BF", url: "https://www.optioncarriere.bf/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Guinee", url: "https://www.optioncarriere.gn/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Benin", url: "https://www.optioncarriere.bj/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Togo", url: "https://www.optioncarriere.tg/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Niger", url: "https://www.optioncarriere.ne/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Madagascar", url: "https://www.optioncarriere.mg/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere RDC", url: "https://www.optioncarriere.cd/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Maroc", url: "https://www.optioncarriere.ma/emploi.rss", categorie: "EMPLOI" },
  { nom: "Optioncarriere Tunisie", url: "https://www.optioncarriere.tn/emploi.rss", categorie: "EMPLOI" },
  { nom: "Go Africa CI Jobs", url: "https://www.goafricaonline.com/ci/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa CM Jobs", url: "https://www.goafricaonline.com/cm/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa BF Jobs", url: "https://www.goafricaonline.com/bf/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa ML Jobs", url: "https://www.goafricaonline.com/ml/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa GN Jobs", url: "https://www.goafricaonline.com/gn/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa BJ Jobs", url: "https://www.goafricaonline.com/bj/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa TG Jobs", url: "https://www.goafricaonline.com/tg/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa NE Jobs", url: "https://www.goafricaonline.com/ne/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa MG Jobs", url: "https://www.goafricaonline.com/mg/emploi/rss", categorie: "EMPLOI" },
  { nom: "Go Africa CD Jobs", url: "https://www.goafricaonline.com/cd/emploi/rss", categorie: "EMPLOI" },
  { nom: "BrighterMonday Uganda", url: "https://www.brightermonday.co.ug/feed", categorie: "EMPLOI" },
  { nom: "BrighterMonday Tanzania", url: "https://www.brightermonday.co.tz/feed", categorie: "EMPLOI" },
  { nom: "NGO Jobs Africa", url: "https://ngojobsinafrica.com/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Togo", url: "https://www.emploi.tg/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Burkina", url: "https://www.emploiburkina.com/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Benin", url: "https://www.emploibenin.com/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Niger", url: "https://www.emploiniger.com/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Guinee", url: "https://www.emploiguinee.com/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Mali", url: "https://www.emploimali.com/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Cameroun", url: "https://www.emploi.cm/feed/", categorie: "EMPLOI" },
  { nom: "Emploi Congo", url: "https://www.emploi.cg/feed/", categorie: "EMPLOI" },
  { nom: "CamerJobs", url: "https://camerjobs.com/feed/", categorie: "EMPLOI" },
  { nom: "TalentAfrique", url: "https://talentafrique.com/feed/", categorie: "EMPLOI" },

  // ── Stages ──
  { nom: "AIESEC Opportunities", url: "https://aiesec.org/feed", categorie: "STAGE" },
  { nom: "UNV Volunteer Opportunities", url: "https://www.unv.org/rss.xml", categorie: "STAGE" },
  { nom: "InternAbroad", url: "https://www.internabroad.com/feed", categorie: "STAGE" },
  { nom: "GoAbroad Internships", url: "https://www.goabroad.com/intern-abroad/feed", categorie: "STAGE" },
  { nom: "UN Careers", url: "https://careers.un.org/lbw/home.aspx?viewtype=rss", categorie: "STAGE" },
  { nom: "Idealist Jobs", url: "https://www.idealist.org/en/rss/jobs", categorie: "STAGE" },
  { nom: "DevNet Jobs", url: "https://www.devnetjobs.org/rss.xml", categorie: "STAGE" },
  { nom: "Bond UK Jobs", url: "https://www.bond.org.uk/jobs/feed/", categorie: "STAGE" },

  // ── Formations ──
  { nom: "Coursera Blog", url: "https://blog.coursera.org/feed/", categorie: "FORMATION" },
  { nom: "Class Central", url: "https://www.classcentral.com/report/feed/", categorie: "FORMATION" },
  { nom: "MOOC Francophone", url: "https://www.mooc-francophone.com/feed/", categorie: "FORMATION" },
  { nom: "EdX Blog", url: "https://www.edx.org/blog/feed", categorie: "FORMATION" },
  { nom: "FutureLearn Blog", url: "https://www.futurelearn.com/info/feed", categorie: "FORMATION" },
  { nom: "Alison Courses", url: "https://alison.com/blog/feed/", categorie: "FORMATION" },
  { nom: "OpenClassrooms Blog", url: "https://blog.openclassrooms.com/feed/", categorie: "FORMATION" },
  { nom: "Khan Academy Blog", url: "https://blog.khanacademy.org/feed/", categorie: "FORMATION" },
  { nom: "MIT OpenCourseWare", url: "https://ocw.mit.edu/rss/new/rss.xml", categorie: "FORMATION" },
  { nom: "Distance Ed Africa", url: "https://www.deafrica.org/feed/", categorie: "FORMATION" },
  { nom: "Education Intl Africa", url: "https://regions.ei-ie.org/africa/feed/", categorie: "FORMATION" },

  // ── Appels à projets ──
  { nom: "Calls for Proposals Africa", url: "https://www.fundsforngos.org/feed/", categorie: "APPEL_PROJET" },
  { nom: "Devex Funding", url: "https://www.devex.com/news/rss", categorie: "APPEL_PROJET" },
  { nom: "GlobalGiving", url: "https://www.globalgiving.org/dy/v2/pe-xml/projects.xml", categorie: "APPEL_PROJET" },
  { nom: "GrantWatch", url: "https://www.grantwatch.com/grantrss.php", categorie: "APPEL_PROJET" },
  { nom: "Grants.gov New Opps", url: "https://grants.gov/rss/GG_NewOppByAgency.xml", categorie: "APPEL_PROJET" },
  { nom: "FundsForNGOs Latest", url: "https://www2.fundsforngos.org/feed/", categorie: "APPEL_PROJET" },
  { nom: "Open Society Foundations", url: "https://www.opensocietyfoundations.org/rss.xml", categorie: "APPEL_PROJET" },

  // ── Admissions ──
  { nom: "MasterPortal RSS", url: "https://www.mastersportal.com/rss/scholarships", categorie: "ADMISSION" },
  { nom: "StudyPortals News", url: "https://www.studyportals.com/feed/", categorie: "ADMISSION" },
  { nom: "TopUniversities", url: "https://www.topuniversities.com/rss.xml", categorie: "ADMISSION" },
  { nom: "TimesHigherEd", url: "https://www.timeshighereducation.com/rss/feed", categorie: "ADMISSION" },
  { nom: "ScholarshipPortal", url: "https://www.scholarshipportal.com/rss/scholarships", categorie: "ADMISSION" },
  { nom: "BachelorPortal", url: "https://www.bachelorsportal.com/rss/scholarships", categorie: "ADMISSION" },
  { nom: "PhDPortal", url: "https://www.phdportal.com/rss/scholarships", categorie: "ADMISSION" },
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
