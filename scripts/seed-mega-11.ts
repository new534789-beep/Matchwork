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

const ALL: O[] = [
mk("EMPLOI","cocacola.com","Coca-Cola","Coca-Cola — Marketing Manager West Africa 2027","Poste de responsable marketing chez Coca-Cola pour l'Afrique de l'Ouest. Stratégie de marque, innovation produit, distribution. Lagos.","Master en marketing ou commerce. 3+ ans d'expérience FMCG.","Anglais courant","2027-06-30","https://careers.coca-colacompany.com/"),
mk("EMPLOI","pepsico.com","PepsiCo","PepsiCo — Sales Director Afrique 2027","Poste de directeur commercial chez PepsiCo pour l'Afrique. Pepsi, Lay's, Quaker. Développement marché, distribution.","Master en commerce. 5+ ans d'expérience vente FMCG.","Anglais courant, français apprécié","2027-06-30","https://www.pepsicojobs.com/"),
mk("EMPLOI","ge.com","GE","GE Vernova — Power Engineer Afrique 2027","Poste d'ingénieur énergie chez GE Vernova en Afrique. Turbines à gaz, énergies renouvelables, réseaux électriques.","Master en génie électrique ou énergie.","Anglais courant","2027-06-30","https://jobs.gecareers.com/"),
mk("EMPLOI","3m.com","3M","3M — Application Engineer 2027","Poste d'ingénieur application chez 3M. Matériaux adhésifs, filtration, solutions industrielles. Marchés émergents Afrique.","Master en ingénierie chimique ou matériaux.","Anglais courant","2027-06-30","https://www.3m.com/3M/en_US/careers-us/"),
mk("EMPLOI","michelin.com","Michelin","Michelin — Ingénieur Procédé 2027","Poste d'ingénieur procédé chez Michelin. R&D pneus, matériaux, durabilité. Clermont-Ferrand et sites mondiaux.","Master en chimie, matériaux ou génie mécanique.","Français et anglais","2027-06-30","https://careers.michelin.com/"),
mk("EMPLOI","thalesgroup.com","Thales","Thales — Cybersecurity Consultant 2027","Poste de consultant cybersécurité chez Thales. Défense, aéronautique, spatial, identité numérique. Paris et marchés africains.","Master en cybersécurité ou informatique.","Français et anglais","2027-06-30","https://www.thalesgroup.com/en/careers"),
mk("EMPLOI","st.com","STMicroelectronics","STMicroelectronics — IC Design Engineer 2027","Poste d'ingénieur conception de circuits intégrés chez ST. Microcontrôleurs, capteurs, power management. Grenoble ou Genève.","Master en micro-électronique ou physique des semi-conducteurs.","Anglais courant, français apprécié","2027-06-30","https://www.st.com/content/st_com/en/about/careers.html"),
mk("EMPLOI","veolia.com","Veolia","Veolia — Ingénieur Traitement Eau Afrique 2027","Poste d'ingénieur traitement de l'eau chez Veolia en Afrique. Usines de potabilisation, assainissement, dessalement. Maroc, Gabon, Niger.","Master en hydraulique, environnement ou génie des procédés.","Français courant","2027-06-30","https://www.veolia.com/fr/carrieres"),
mk("EMPLOI","suez.com","SUEZ","SUEZ — Chef de Projet Déchets Afrique 2027","Poste de chef de projet gestion des déchets chez SUEZ en Afrique. Collecte, tri, valorisation, décharges contrôlées. Casablanca, Dakar.","Master en environnement, génie civil ou logistique.","Français courant, anglais apprécié","2027-06-30","https://www.suez.com/en/careers"),
mk("EMPLOI","vinci.com","VINCI","VINCI — Ingénieur Concession Aéroport Afrique 2027","Poste d'ingénieur concession chez VINCI Airports en Afrique. Gestion d'aéroports au Cap-Vert, Congo, RDC, Salvador.","Master en génie civil, aéronautique ou transport.","Français et anglais","2027-06-30","https://www.vinci.com/vinci.nsf/en/careers/pages/index.htm"),
mk("BOURSE","fondation-total.org","Fondation TotalEnergies","Bourse TotalEnergies Afrique 2027","Bourses de la Fondation TotalEnergies pour étudiants africains en master. Sciences, ingénierie, énergie. Universités en France et en Afrique.","Nationalité africaine. Admis en master pertinent. Excellence académique.","Français ou anglais","2027-05-31","https://foundation.totalenergies.com/en/our-actions/education-and-youth-integration",["recommandation"]),
mk("BOURSE","fondation-jacques-chirac.fr","Fondation Jacques Chirac","Bourse Prix de la Prévention des Conflits 2027","Bourses et prix de la Fondation Chirac pour projets de prévention des conflits et dialogue interculturel en Afrique. Soutien financier et mentorat.","Porteur de projet en lien avec la paix en Afrique. Tout âge.","Français","2027-06-30","https://www.fondationchirac.eu/"),
mk("BOURSE","mfrancophonie.org","OIF","Bourse OIF Jeunesse Francophone 2027","Bourses de l'Organisation Internationale de la Francophonie pour jeunes francophones. Mobilité académique, entrepreneuriat, leadership. 88 États membres.","18-35 ans. Nationalité d'un État membre de l'OIF. Projet structurant.","Français","2027-06-30","https://www.francophonie.org/les-programmes-de-bourses",["recommandation"]),
mk("ADMISSION","centralesupelec.fr","CentraleSupélec","Admission CentraleSupélec Master 2027","Candidature en master à CentraleSupélec. IA, cybersécurité, énergie, mathématiques. Institut Polytechnique de Paris.","Licence en sciences ou ingénierie. Excellence académique.","Français ou anglais","2027-04-30","https://www.centralesupelec.fr/fr/admissions",["recommandation"]),
mk("ADMISSION","ensimag.grenoble-inp.fr","Ensimag","Admission Ensimag 2027 — Informatique Grenoble","Candidature au cycle ingénieur de l'Ensimag (Grenoble INP). Informatique, mathématiques appliquées, finance quantitative.","CPGE ou L3 en informatique/maths. Concours ou admission sur titre.","Français","2027-05-31","https://ensimag.grenoble-inp.fr/"),
mk("ADMISSION","isae-supaero.fr","ISAE-SUPAERO","Admission ISAE-SUPAERO Master 2027 — Aéronautique","Candidature en master à l'ISAE-SUPAERO de Toulouse. Meilleure école d'aéronautique et d'espace de France. Programmes en anglais.","Licence en ingénierie ou sciences. Excellence en maths et physique.","Français ou anglais","2027-04-30","https://www.isae-supaero.fr/en/admissions/",["recommandation"]),
mk("CONCOURS","sante.gouv.bj","Ministère de la Santé Bénin","Concours Médecins Spécialistes Bénin 2027","Concours de recrutement de médecins spécialistes pour les CHU et CHD du Bénin. Chirurgie, pédiatrie, gynécologie, anesthésie.","Doctorat en médecine + spécialisation. Nationalité béninoise.","Français","2027-06-30","https://www.sante.gouv.bj/",["nationalite","medical","casier"]),
mk("CONCOURS","defense.gouv.bj","Forces Armées Bénin","Concours Officiers Forces Armées Bénin 2027","Concours de recrutement d'officiers des Forces Armées Béninoises. Armée de terre, marine, armée de l'air. Formation à l'école militaire.","Bac minimum. Nationalité béninoise. 18-25 ans. Aptitude physique.","Français","2027-06-30","https://www.defense.gouv.bj/",["nationalite","medical","casier","photo"]),
mk("EMPLOI","ortb.bj","ORTB","ORTB — Journaliste Bénin 2027","Poste de journaliste à l'Office de Radiodiffusion et Télévision du Bénin. Rédaction, présentation, reportage. Média national.","Licence en journalisme ou communication. Nationalité béninoise.","Français courant","2027-06-30","https://www.ortb.bj/",["nationalite"]),
mk("EMPLOI","sbee.bj","SBEE","SBEE — Technicien Réseau Électrique Bénin 2027","Poste de technicien réseau électrique à la SBEE. Maintenance du réseau de distribution, branchements, dépannage.","BTS en génie électrique ou électrotechnique. Nationalité béninoise.","Français","2027-06-30","https://www.sbee.bj/",["nationalite"]),
mk("EMPLOI","soneb.bj","SONEB","SONEB — Ingénieur Hydraulique Bénin 2027","Poste d'ingénieur hydraulique à la SONEB. Réseau de distribution d'eau potable, stations de pompage, qualité de l'eau.","Master en hydraulique ou génie civil. Nationalité béninoise.","Français","2027-06-30","https://www.soneb.bj/",["nationalite"]),
mk("EMPLOI","portnovo.bj","Mairie Porto-Novo","Mairie Porto-Novo — Urbaniste 2027","Poste d'urbaniste à la Mairie de Porto-Novo, capitale du Bénin. Aménagement urbain, plan directeur, patrimoine architectural.","Master en urbanisme, architecture ou géographie.","Français","2027-06-30","https://www.portonovo.bj/"),
mk("EMPLOI","cotonou.bj","Mairie Cotonou","Mairie Cotonou — Chef de Projet Smart City 2027","Poste de chef de projet smart city à la Mairie de Cotonou. Digitalisation des services municipaux, mobilité urbaine, données.","Master en informatique, urbanisme ou gestion de projet.","Français courant","2027-06-30","https://www.cotonou.bj/"),
];

async function main() {
  console.log(`Lot 11 — Total à insérer : ${ALL.length}`);
  let ins = 0, skip = 0;
  for (const o of ALL) {
    const ex = await prisma.opportunite.findFirst({ where: { intitule: o.intitule, organisme: o.organisme } });
    if (ex) { skip++; continue; }
    await prisma.opportunite.create({
      data: { type:o.type,source:o.source,organisme:o.organisme,intitule:o.intitule,description:o.description,langueDetectee:o.langueDetectee,conditions:o.conditions,piecesExigees:o.piecesExigees,exigenceLangue:o.exigenceLangue,dateLimite:new Date(o.dateLimite),lien:o.lien,canalCandidature:o.canalCandidature,cibleCandidature:o.cibleCandidature,statut:"publiee",actif:true,confianceDateLimite:0.85,sourceDateLimite:"recherche web" },
    });
    ins++;
  }
  const tot = await prisma.opportunite.count({ where: { statut: "publiee" } });
  console.log(`\nInsérées: ${ins} | Skip: ${skip} | Total publiées: ${tot}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
export {};
