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

// ═══ EMPLOI — ENTREPRISES CHINOISES ═══
E("xiaomi.com","Xiaomi","Xiaomi — Product Manager Afrique 2027","Poste de chef de produit chez Xiaomi pour le marché africain. Smartphones, IoT, écosystème connecté. Expansion en Afrique de l'Ouest.","Master en marketing ou commerce. Connaissance du marché mobile africain.","Anglais courant","2027-06-30","https://careers.xiaomi.com/"),
E("lenovo.com","Lenovo","Lenovo — Channel Sales Manager Afrique 2027","Poste de responsable ventes canal chez Lenovo pour l'Afrique. PC, serveurs, solutions entreprise. Partenariats distribution.","Master en commerce ou marketing. Expérience vente IT.","Anglais courant, français apprécié","2027-06-30","https://jobs.lenovo.com/"),
E("transsion.com","Transsion (Tecno/Infinix)","Transsion — Marketing Director West Africa 2027","Poste de directeur marketing chez Transsion (Tecno, Infinix, itel) pour l'Afrique de l'Ouest. #1 des smartphones en Afrique. Lagos.","Master en marketing. 5+ ans d'expérience FMCG ou tech.","Anglais courant","2027-06-30","https://www.transsion.com/careers"),
E("cnnc.com.cn","CGN/CNNC","CGN — Ingénieur Nucléaire 2027","Poste d'ingénieur nucléaire chez China General Nuclear Power. Centrales nucléaires, énergies propres. Shenzhen et projets internationaux.","Master en génie nucléaire ou physique. Formation sûreté nucléaire.","Anglais ou chinois","2027-06-30","https://en.cgnpc.com.cn/careers/"),
E("crbc.com","CRBC","CRBC — Ingénieur Génie Civil Afrique 2027","Poste d'ingénieur génie civil chez China Road and Bridge Corporation en Afrique. Routes, ponts, chemins de fer. Kenya, Algérie, Congo.","Master en génie civil ou travaux publics.","Anglais et/ou français","2027-06-30","https://www.crbc.com/"),
E("zte.com.cn","ZTE","ZTE — Telecom Engineer Afrique 2027","Poste d'ingénieur télécoms chez ZTE en Afrique. Déploiement 4G/5G, fibre optique, solutions opérateurs. 50+ pays africains.","Master en télécommunications ou réseau.","Anglais courant","2027-06-30","https://www.zte.com.cn/global/about/career.html"),

// ═══ EMPLOI — BELGIQUE & LUXEMBOURG SUPPLÉMENTAIRES ═══
E("proximus.com","Proximus","Proximus — Data Analyst Bruxelles 2027","Poste d'analyste données chez Proximus, opérateur télécoms belge. Analytics client, BI, machine learning. Bruxelles.","Master en data science, statistique ou informatique.","Français et anglais, néerlandais apprécié","2027-06-30","https://www.proximus.com/careers"),
E("bpost.be","bpost","bpost — Supply Chain Analyst 2027","Poste d'analyste supply chain chez bpost, service postal belge. Optimisation logistique, e-commerce, last mile delivery.","Master en logistique ou ingénierie industrielle.","Français et néerlandais, anglais","2027-06-30","https://bpostgroup.com/careers"),
E("rtbf.be","RTBF","RTBF — Journaliste Digital 2027","Poste de journaliste digital à la RTBF, média audiovisuel public belge francophone. Web, réseaux sociaux, vidéo. Bruxelles.","Master en journalisme ou communication.","Français courant","2027-06-30","https://www.rtbf.be/entreprise/emploi"),
E("rtl.lu","RTL Luxembourg","RTL — Développeur Web Luxembourg 2027","Poste de développeur web chez RTL Group au Luxembourg. Plateforme de streaming, CMS, applications mobiles. Kirchberg.","Master en informatique ou développement web. Compétences React, Node.js.","Français et anglais","2027-06-30","https://company.rtl.com/en/careers/"),
E("arcelormittal.lu","ArcelorMittal Luxembourg","ArcelorMittal — R&D Materials Luxembourg 2027","Poste de chercheur en matériaux chez ArcelorMittal au centre R&D d'Esch-sur-Alzette. Aciers avancés, caractérisation, modélisation.","Doctorat en science des matériaux ou métallurgie.","Anglais courant, français apprécié","2027-06-30","https://corporate.arcelormittal.com/careers"),
E("goodyear.lu","Goodyear","Goodyear — Tire Engineer Luxembourg 2027","Poste d'ingénieur pneumatiques chez Goodyear au centre d'innovation de Colmar-Berg, Luxembourg. R&D pneus, matériaux, simulation.","Master en matériaux, mécanique ou chimie des polymères.","Anglais courant","2027-06-30","https://jobs.goodyear.com/"),

// ═══ BOURSES — PROGRAMMES SPÉCIAUX ═══
B("afd.fr","AFD","Bourse AFD — Formation Professionnelle Afrique 2027","Bourses de l'Agence Française de Développement pour formations professionnelles courtes en France et en Afrique. Gestion de projets, finance, énergie.","Professionnel en poste dans un pays partenaire de l'AFD. 2+ ans d'expérience.","Français","2027-06-30","https://www.afd.fr/fr/page-thematique-axe/formation"),
B("csfp.bj","CSFP Bénin","Bourse CSFP Bénin 2027 — Formation Professionnelle","Bourses du Centre Sectoriel de Formation Professionnelle au Bénin. Formations techniques : électricité, plomberie, menuiserie, mécanique auto.","Nationalité béninoise. CEP, BEPC ou BAC selon le niveau. 16-30 ans.","Français","2027-09-30","https://www.travail.gouv.bj/",["nationalite"]),
B("fondation-dior.com","Fondation Dior","Bourse Fondation Dior Jeunes Talents 2027","Bourses de la Fondation Dior pour étudiants en arts et métiers d'art. Mode, joaillerie, parfumerie, design. Écoles partenaires.","Admis dans une école d'art ou de mode partenaire. Projet créatif.","Français ou anglais","2027-06-30","https://www.dior.com/fr_fr/savoir-faire/fondation"),
B("opec.org","OPEP","Bourse OFID Scholars 2027","Bourses du Fonds OPEP pour le développement international. Master en développement, énergie, agriculture dans des universités partenaires.","Nationalité d'un pays en développement. Admis en master pertinent.","Anglais","2027-06-30","https://www.ofid.org/"),

// ═══ EMPLOI — IMMOBILIER & CONSTRUCTION AFRIQUE ═══
E("groupeattia.com","Groupe Attia","Groupe Attia — Architecte Bénin 2027","Poste d'architecte chez Groupe Attia, promoteur immobilier au Bénin. Conception résidentielle et commerciale. Cotonou.","Diplôme d'architecte DPLG ou équivalent.","Français courant","2027-06-30","https://www.groupeattia.com/"),
E("colas.com","Colas Afrique","Colas — Chef de Chantier Routes Afrique 2027","Poste de chef de chantier chez Colas (groupe Bouygues) en Afrique. Construction routière, terrassement, enrobés. 15+ pays africains.","BTS ou licence en travaux publics ou génie civil. Expérience chantier.","Français courant","2027-06-30","https://www.colas.com/carrieres/"),
E("bouygues-construction.com","Bouygues Construction","Bouygues — Ingénieur Bâtiment Afrique 2027","Poste d'ingénieur bâtiment chez Bouygues Construction en Afrique. Projets de bâtiments, hôpitaux, écoles, logements. CI, Cameroun, Congo.","Master en génie civil ou construction.","Français courant","2027-06-30","https://www.bouygues-construction.com/carrieres"),

// ═══ EMPLOI — CYBERSÉCURITÉ ═══
E("orangecyberdefense.com","Orange Cyberdefense","Orange Cyberdefense — Analyste SOC Afrique 2027","Poste d'analyste SOC chez Orange Cyberdefense pour l'Afrique. Surveillance sécurité, détection d'incidents, réponse aux menaces.","Master en cybersécurité ou informatique. Certifications CEH, CompTIA Security+.","Français et anglais","2027-06-30","https://orangecyberdefense.com/fr/careers/"),
E("kaspersky.com","Kaspersky","Kaspersky — Threat Intelligence Analyst 2027","Poste d'analyste renseignement sur les menaces chez Kaspersky. Analyse de malware, APT, cyberespionnage. Moscow ou London.","Master en cybersécurité. Compétences en reverse engineering, analyse de malware.","Anglais courant","2027-06-30","https://www.kaspersky.com/about/careers"),

// ═══ ADMISSION — UNIVERSITÉS EUROPÉENNES ═══
A("tum.de","TU Munich","Admission TU Munich Master 2027","Candidature en master à la TU Munich, meilleure université technique d'Allemagne. Informatique, ingénierie, sciences. Programmes en anglais.","Licence en sciences ou ingénierie. GPA compétitif.","Anglais ou allemand","2027-05-31","https://www.tum.de/en/studies/application"),
A("rwth-aachen.de","RWTH Aachen","Admission RWTH Aachen Master 2027","Candidature en master à RWTH Aachen, top ingénierie en Allemagne. Mécanique, informatique, électrique. Programmes en anglais.","Licence en ingénierie. GPA compétitif.","Anglais ou allemand","2027-03-01","https://www.rwth-aachen.de/go/id/bkqz"),
A("kit.edu","KIT Karlsruhe","Admission KIT Master 2027","Candidature en master au KIT (Karlsruher Institut für Technologie). Informatique, mécanique, physique, chimie. Top technique.","Licence en sciences ou ingénierie.","Anglais ou allemand","2027-03-15","https://www.kit.edu/english/studying.php"),
A("tu-berlin.de","TU Berlin","Admission TU Berlin Master 2027","Candidature en master à la TU Berlin. Informatique, ingénierie, architecture, planification urbaine. Programmes en anglais.","Licence pertinente.","Anglais ou allemand","2027-04-15","https://www.tu.berlin/en/studying/applying-and-enrolling"),
A("lmu.de","LMU Munich","Admission LMU Munich Master 2027","Candidature en master à la Ludwig-Maximilians-Universität de Munich. Sciences, médecine, droit, économie, lettres. Top 50 mondial.","Licence pertinente.","Allemand ou anglais selon le programme","2027-05-15","https://www.lmu.de/en/study/all-degrees-and-programs/"),
A("uni-heidelberg.de","Universität Heidelberg","Admission Heidelberg Master 2027","Candidature en master à l'Université de Heidelberg, plus ancienne d'Allemagne. Sciences, médecine, philosophie. Top 60 mondial.","Licence pertinente avec excellence.","Allemand ou anglais","2027-04-15","https://www.uni-heidelberg.de/en/study/all-subjects"),

// ═══ EMPLOI — TECH BÉNIN ═══
E("wari.com","Wari","Wari — Développeur Backend Dakar 2027","Poste de développeur backend chez Wari, plateforme de transfert d'argent en Afrique de l'Ouest. APIs paiement, systèmes distribués. Dakar.","Licence en informatique. Compétences Java, Spring Boot, PostgreSQL.","Français courant","2027-06-30","https://www.wari.com/"),
E("spacedev.bj","SpaceDev Bénin","SpaceDev — Développeur Full Stack Cotonou 2027","Poste de développeur full stack chez SpaceDev, ESN béninoise. Projets web et mobile pour clients locaux et internationaux.","Licence en informatique. React, Node.js, Flutter.","Français courant","2027-06-30","https://www.spacedev.bj/"),
E("etrilabs.com","Etrilabs","Etrilabs — Tech Lead Cotonou 2027","Poste de tech lead chez Etrilabs, incubateur tech béninois. Encadrement d'équipes, architecture logicielle, mentorat de startups.","3+ ans d'expérience en développement. Leadership technique.","Français courant, anglais apprécié","2027-06-30","https://www.etrilabs.com/"),
E("blolab.org","BloLab","BloLab — Fab Lab Manager Cotonou 2027","Poste de gestionnaire du Fab Lab BloLab à Cotonou. Impression 3D, prototypage, ateliers communautaires, formation.","Diplôme technique. Expérience en fabrication numérique et maker movement.","Français courant","2027-06-30","https://www.blolab.org/"),

// ═══ CONCOURS DERNIERS ═══
CC("minef.gouv.bj","Ministère des Finances Bénin","Concours Contrôleurs Financiers Bénin 2027","Concours de recrutement de contrôleurs financiers au Bénin. Contrôle budgétaire, vérification des dépenses publiques.","Licence en finance, comptabilité ou économie. Nationalité béninoise. 18-35 ans.","Français","2027-06-30","https://www.finances.bj/",["nationalite","casier"]),
CC("justice.gouv.bj","Ministère de la Justice Bénin","Concours Notariat Bénin 2027","Concours d'accès au notariat au Bénin. Formation et exercice de la fonction notariale.","Maîtrise en droit. Nationalité béninoise. Stage notarial requis.","Français","2027-06-30","https://www.justice.gouv.bj/",["nationalite","casier"]),
CC("sante.gouv.bj","Ministère de la Santé Bénin","Concours Pharmaciens Hospitaliers Bénin 2027","Concours de recrutement de pharmaciens pour les hôpitaux publics du Bénin. Pharmacie hospitalière, gestion des médicaments.","Doctorat en pharmacie. Nationalité béninoise.","Français","2027-06-30","https://www.sante.gouv.bj/",["nationalite","medical","casier"]),

// ═══ BOURSES FINALES ═══
B("cud.be","CUD/ARES","Bourse CUD PRD 2027 — Belgique","Bourses de projets de recherche pour le développement. Financement de thèses de doctorat en co-tutelle Belgique-pays du Sud. 4 ans.","Avoir un directeur de thèse belge et un du pays d'origine. Nationalité pays partenaire.","Français","2027-01-31","https://www.ares-ac.be/fr/cooperation-au-developpement/bourses/prd",["projet","recommandation"]),
B("ciuf.be","Wallonie-Bruxelles","Bourse WBI Excellence 2027 — Belgique","Bourses d'excellence Wallonie-Bruxelles International. Master, doctorat ou post-doc dans les universités francophones de Belgique.","Nationalité d'un pays partenaire. Excellence académique démontrée.","Français","2027-03-01","https://www.wbi.be/bourses",["recommandation"]),
B("cne.fr","CNRS","Bourse CNRS International 2027 — France","Bourses pour doctorants internationaux dans les laboratoires du CNRS en France. Tous domaines scientifiques. 3 ans de financement.","Master en sciences. Accepté dans un laboratoire CNRS. Projet de recherche.","Français ou anglais","2027-04-30","https://www.cnrs.fr/fr/rejoindre-le-cnrs",["projet","recommandation"]),
B("cirad.fr","CIRAD","Bourse CIRAD Doctorat 2027 — Agriculture Tropicale","Bourses doctorales du CIRAD pour recherche en agronomie tropicale. Sécurité alimentaire, changement climatique, biodiversité. France et tropiques.","Master en agronomie, biologie ou environnement. Projet de thèse défini.","Français ou anglais","2027-06-30","https://www.cirad.fr/en/about-us/jobs-and-training",["projet","recommandation"]),
B("ird.fr","IRD","Bourse IRD ARTS 2027 — Recherche Développement","Bourses doctorales ARTS de l'IRD. Recherche en partenariat avec les pays du Sud. Santé, environnement, sociétés. Laboratoires en France et dans les pays partenaires.","Master. Accepté dans un laboratoire IRD. Nationalité d'un pays du Sud.","Français ou anglais","2027-05-31","https://www.ird.fr/les-bourses-de-these",["projet","recommandation"]),
];

async function main() {
  console.log(`Lot 9 — Total à insérer : ${ALL.length}`);
  let ins = 0, skip = 0;
  for (const o of ALL) {
    const ex = await prisma.opportunite.findFirst({ where: { intitule: o.intitule, organisme: o.organisme } });
    if (ex) { skip++; continue; }
    await prisma.opportunite.create({
      data: { type:o.type,source:o.source,organisme:o.organisme,intitule:o.intitule,description:o.description,langueDetectee:o.langueDetectee,conditions:o.conditions,piecesExigees:o.piecesExigees,exigenceLangue:o.exigenceLangue,dateLimite:new Date(o.dateLimite),lien:o.lien,canalCandidature:o.canalCandidature,cibleCandidature:o.cibleCandidature,statut:"publiee",actif:true,confianceDateLimite:0.85,sourceDateLimite:"recherche web" },
    });
    ins++;
    if (ins % 50 === 0) console.log(`  ... ${ins}`);
  }
  const tot = await prisma.opportunite.count({ where: { statut: "publiee" } });
  console.log(`\nInsérées: ${ins} | Skip: ${skip} | Total publiées: ${tot}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
export {};
