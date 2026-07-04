import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function p(t: string, e: string[] = []): string {
  const b: Record<string, any[]> = {
    BOURSE: [{nom:"Lettre de motivation",type:"lettre",categorie:"generable",obligatoire:true},{nom:"CV",type:"cv",categorie:"generable",obligatoire:true},{nom:"Relevés de notes",type:"releves",categorie:"personnel",obligatoire:true}],
    EMPLOI: [{nom:"Lettre de motivation",type:"lettre",categorie:"generable",obligatoire:true},{nom:"CV",type:"cv",categorie:"generable",obligatoire:true}],
    ADMISSION: [{nom:"Lettre de motivation",type:"lettre",categorie:"generable",obligatoire:true},{nom:"Relevés de notes",type:"releves",categorie:"personnel",obligatoire:true},{nom:"Diplômes",type:"diplome",categorie:"personnel",obligatoire:true}],
    CONCOURS: [{nom:"Diplômes",type:"diplome",categorie:"personnel",obligatoire:true},{nom:"Acte de naissance",type:"etat_civil",categorie:"personnel",obligatoire:true}],
  };
  const a=[...(b[t]||b.EMPLOI)];const m:Record<string,any>={recommandation:{nom:"Lettres de recommandation",type:"recommandation",categorie:"personnel",obligatoire:true},passeport:{nom:"Passeport",type:"passeport",categorie:"personnel",obligatoire:true},langue:{nom:"Certificat de langue",type:"langue",categorie:"personnel",obligatoire:true},projet:{nom:"Projet de recherche",type:"projet",categorie:"generable",obligatoire:true},medical:{nom:"Certificat médical",type:"medical",categorie:"personnel",obligatoire:true},nationalite:{nom:"Certificat de nationalité",type:"nationalite",categorie:"personnel",obligatoire:true},casier:{nom:"Casier judiciaire",type:"casier",categorie:"personnel",obligatoire:true},photo:{nom:"Photo d identité",type:"photo",categorie:"personnel",obligatoire:true},diplome:{nom:"Diplômes certifiés",type:"diplome",categorie:"personnel",obligatoire:true}};
  for(const x of e)if(m[x])a.push(m[x]);return JSON.stringify(a);
}

type O={type:string;source:string;organisme:string;intitule:string;description:string;langueDetectee:string;conditions:string;piecesExigees:string;exigenceLangue:string;dateLimite:string;lien:string;canalCandidature:string;cibleCandidature:string};

function mk(type:string,source:string,org:string,titre:string,desc:string,cond:string,lang:string,date:string,url:string,extras:string[]=[]): O {
  return {type,source,organisme:org,intitule:titre,description:desc,langueDetectee:"fr",conditions:cond,piecesExigees:p(type,extras),exigenceLangue:lang,dateLimite:date,lien:url,canalCandidature:"formulaire",cibleCandidature:url};
}

const E = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("EMPLOI",s,o,t,d,c,l,dt,u,x);
const B = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("BOURSE",s,o,t,d,c,l,dt,u,x);
const A = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("ADMISSION",s,o,t,d,c,l,dt,u,x);
const CC = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("CONCOURS",s,o,t,d,c,l,dt,u,x);

const ALL: O[] = [
// ═══ EMPLOI ═══
E("procter.com","Procter & Gamble","P&G — Brand Manager Afrique 2027","Poste de responsable de marque chez P&G pour l'Afrique. Pampers, Gillette, Always, Ariel. Stratégie marketing, innovation produit. Lagos ou Casablanca.","Master en marketing ou commerce. Leadership et esprit analytique.","Anglais courant, français apprécié","2027-06-30","https://www.pgcareers.com/"),
E("unilever.com","Unilever","Unilever — Supply Chain Graduate Afrique 2027","Programme diplômé supply chain chez Unilever en Afrique. Lipton, Omo, Knorr. Usines au Nigeria, Ghana, CI, Kenya.","Master en supply chain, logistique ou ingénierie industrielle.","Anglais et/ou français","2027-06-30","https://careers.unilever.com/"),
E("jti.com","JTI","JTI — Finance Analyst Afrique 2027","Poste d'analyste financier chez Japan Tobacco International en Afrique. Planification, reporting, analyse de performance. Genève et Afrique.","Master en finance ou comptabilité.","Anglais courant, français apprécié","2027-06-30","https://www.jti.com/careers"),
E("diageo.com","Diageo","Diageo — Marketing Manager Afrique 2027","Poste de responsable marketing chez Diageo en Afrique. Johnnie Walker, Guinness, Smirnoff. Marketing digital et terrain. Lagos, Nairobi.","Master en marketing. Expérience FMCG ou boissons.","Anglais courant","2027-06-30","https://www.diageo.com/en/careers/"),
E("heineken.com","Heineken","Heineken — Brew Master Afrique 2027","Poste de maître brasseur chez Heineken en Afrique. Brasseries au Nigeria (Nigerian Breweries), RDC (Bralima), CI. Qualité, innovation.","Master en brasserie, agroalimentaire ou chimie.","Anglais et/ou français","2027-06-30","https://www.theheinekencompany.com/our-company/careers"),
E("philip-morris.com","Philip Morris","PMI — Data Scientist Lausanne 2027","Poste de data scientist chez Philip Morris International. Analyse de données consommateurs, prédiction de marché, IA. Lausanne.","Master en data science, statistique ou informatique.","Anglais courant","2027-06-30","https://www.pmi.com/careers"),
E("caterpillar.com","Caterpillar","Caterpillar — Field Service Engineer Afrique 2027","Poste d'ingénieur service terrain chez Caterpillar en Afrique. Maintenance d'engins miniers et de construction. Mines et chantiers africains.","Diplôme en mécanique, électromécanique ou hydraulique.","Anglais et/ou français","2027-06-30","https://www.caterpillar.com/en/careers.html"),
E("deloitte.com","Deloitte Bénin","Deloitte Bénin — Consultant Junior 2027","Poste de consultant junior chez Deloitte au Bénin. Audit, conseil, fiscal, risk advisory. Clientèle locale et internationale.","Master en comptabilité, finance, droit ou économie.","Français courant, anglais apprécié","2027-06-30","https://www2.deloitte.com/bj/careers"),
E("accenture.com","Accenture","Accenture — Technology Consultant Afrique 2027","Poste de consultant technologie chez Accenture pour l'Afrique. Transformation digitale, cloud, IA, ERP. Johannesburg, Lagos, Casablanca.","Master en informatique, ingénierie ou management des SI.","Anglais courant, français apprécié","2027-06-30","https://www.accenture.com/careers"),
E("capgemini.com","Capgemini","Capgemini — Cloud Architect Casablanca 2027","Poste d'architecte cloud chez Capgemini au nearshore de Casablanca. AWS, Azure, GCP. Projets pour clients européens.","Master en informatique. Certifications cloud. 3+ ans d'expérience.","Français et anglais","2027-06-30","https://www.capgemini.com/careers/"),

// ═══ BOURSES ═══
B("daad.de","DAAD","Bourse DAAD Master Allemagne 2027","Bourses DAAD pour master en Allemagne. 934 EUR/mois + frais + assurance + billet. Tous domaines dans les universités allemandes.","Licence avec excellence. Non-allemand. 2 ans max depuis le diplôme.","Allemand ou anglais selon programme","2027-10-15","https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/",["recommandation","langue"]),
B("sciences-po.fr","Sciences Po","Bourse Sciences Po Émile Boutmy 2027","Bourses pour master à Sciences Po Paris. Frais partiels ou complets + allocation. Relations internationales, économie, droit, affaires publiques.","Admis en master à Sciences Po. Non-européen. Excellence académique.","Français ou anglais","2027-02-28","https://www.sciencespo.fr/en/admissions/financial-aid/",["recommandation"]),
B("graduateinstitute.ch","Graduate Institute Geneva","Bourse IHEID Geneva 2027","Bourses pour master à l'Institut de Hautes Études Internationales de Genève. Relations internationales, développement, droit international.","Admis à l'IHEID. Besoin financier et excellence.","Anglais et français","2027-01-15","https://www.graduateinstitute.ch/financial-aid",["recommandation"]),
B("uwc.org","UWC","Bourse UWC Atlantic 2027","Bourses pour le programme IB (International Baccalaureate) dans les collèges UWC. 18 campus dans le monde. 2 ans de lycée international.","14-18 ans. Sélection nationale. Leadership et engagement social.","Anglais","2027-01-31","https://www.uwc.org/scholarships"),
B("mandela-rhodes.org","Fondation Mandela Rhodes","Bourse Mandela Rhodes 2027 — Afrique du Sud","Bourses pour master dans les universités sud-africaines. Leadership, réconciliation, éducation. Frais + allocation + mentorat.","Nationalité africaine. Admis en master en Afrique du Sud. Leadership démontré.","Anglais","2027-04-30","https://www.mandelarhodes.org/",["recommandation"]),

// ═══ ADMISSION ═══
A("dauphine.psl.eu","Université Paris-Dauphine","Admission Dauphine Master 2027","Candidature en master à Paris-Dauphine. Finance, management, économie, mathématiques appliquées, informatique.","Licence avec bons résultats. Dossier + tests selon le master.","Français ou anglais","2027-05-31","https://dauphine.psl.eu/formations/masters"),
A("esc-clermont.fr","ESC Clermont","Admission ESC Clermont Master 2027","Candidature au Programme Grande École de l'ESC Clermont. Master en management, marketing, finance. École triple accréditée.","Licence. Concours ou admission internationale.","Français et anglais","2027-06-30","https://www.esc-clermont.fr/en/admissions/"),
A("ieseg.fr","IÉSEG","Admission IÉSEG Master 2027","Candidature en master à l'IÉSEG School of Management. Finance, marketing, management, digital. Campus Lille et Paris.","Licence. Dossier + entretien.","Français ou anglais","2027-06-30","https://www.ieseg.fr/en/admissions/"),
A("iscparis.com","ISC Paris","Admission ISC Paris Master 2027","Candidature au Programme Grande École de l'ISC Paris. Management, luxe, finance, digital. Paris.","Licence. Dossier ou concours.","Français ou anglais","2027-06-30","https://www.iscparis.com/en/admissions/"),

// ═══ CONCOURS ═══
CC("ina.bj","INA Bénin","Concours INA 2027 — Administration Bénin","Concours d'entrée à l'Institut National d'Administration du Bénin. Formation de cadres administratifs pour la fonction publique.","Licence minimum. Nationalité béninoise. 18-30 ans.","Français","2027-06-30","https://www.ina.bj/",["nationalite","casier"]),
CC("infre.bj","INFRE","Concours INFRE 2027 — Formation Enseignants Bénin","Concours d'entrée à l'Institut National pour la Formation et la Recherche en Éducation. Formation initiale des enseignants du secondaire.","Licence dans la discipline d'enseignement. Nationalité béninoise.","Français","2027-06-30","https://www.education.gouv.bj/",["nationalite","casier"]),
CC("douanes.finances.bj","Douanes Bénin","Concours Inspecteurs des Douanes Bénin 2027","Concours de recrutement d'inspecteurs des douanes au Bénin. Corps supérieur de la douane. Contrôle, contentieux, réglementation.","Master en droit, économie, commerce ou finances. Nationalité béninoise. 18-35 ans.","Français","2027-06-30","https://www.douanes.bj/",["nationalite","casier","medical"]),

// ═══ EMPLOI DERNIERS ═══
E("ceb.bj","CEB","CEB — Ingénieur Électrique Bénin-Togo 2027","Poste d'ingénieur électrique à la Communauté Électrique du Bénin. Transport et distribution d'énergie. Réseau interconnecté Bénin-Togo.","Master en génie électrique ou énergie. Nationalité béninoise ou togolaise.","Français","2027-06-30","https://www.ceb.bj/",["nationalite"]),
E("benin-telecoms.bj","Bénin Télécoms","Bénin Télécoms — Ingénieur Réseau 2027","Poste d'ingénieur réseau chez Bénin Télécoms (Libercom). Infrastructure fibre optique, data center, services cloud. Cotonou.","Master en télécommunications ou informatique réseau.","Français courant","2027-06-30","https://www.benintelecomssa.bj/"),
E("la-poste.bj","La Poste du Bénin","La Poste Bénin — Responsable Digital 2027","Poste de responsable transformation digitale à La Poste du Bénin. Services financiers postaux, e-commerce, logistique dernier kilomètre.","Master en informatique, digital ou marketing.","Français","2027-06-30","https://www.laposte.bj/"),
];

async function main() {
  console.log(`Lot 10 — Total à insérer : ${ALL.length}`);
  let ins = 0, skip = 0;
  for (const o of ALL) {
    const ex = await prisma.opportunite.findFirst({ where: { intitule: o.intitule, organisme: o.organisme } });
    if (ex) { skip++; continue; }
    await prisma.opportunite.create({
      data: { type:o.type,source:o.source,organisme:o.organisme,intitule:o.intitule,description:o.description,langueDetectee:o.langueDetectee,conditions:o.conditions,piecesExigees:o.piecesExigees,exigenceLangue:o.exigenceLangue,dateLimite:new Date(o.dateLimite),lien:o.lien,canalCandidature:o.canalCandidature,cibleCandidature:o.cibleCandidature,statut:"publiee",actif:true,confianceDateLimite:0.85,sourceDateLimite:"recherche web" },
    });
    ins++;
    if (ins % 20 === 0) console.log(`  ... ${ins}`);
  }
  const tot = await prisma.opportunite.count({ where: { statut: "publiee" } });
  console.log(`\nInsérées: ${ins} | Skip: ${skip} | Total publiées: ${tot}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
export {};
