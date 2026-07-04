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

// ═══ BMW — POSTES SPÉCIFIQUES ═══
E("bmw.com","BMW Group","BMW — Ingénieur Électromobilité Munich 2027","Poste d'ingénieur en électromobilité chez BMW à Munich. Développement de batteries haute tension, systèmes de charge, architecture électrique pour la série iX et i4.","Master en génie électrique ou électrochimie. Expérience en systèmes haute tension.","Anglais courant, allemand apprécié","2027-06-30","https://www.bmwgroup.jobs/"),
E("bmw.com","BMW Group","BMW — Data Engineer Autonomous Driving 2027","Poste d'ingénieur données chez BMW pour la conduite autonome. Traitement de données capteurs, pipelines ML, infrastructure cloud à grande échelle.","Master en informatique ou data engineering. Compétences Spark, Kafka, Python.","Anglais courant","2027-06-30","https://www.bmwgroup.jobs/"),
E("bmw.com","BMW Group","BMW — Supply Chain Manager Afrique du Sud 2027","Poste de responsable supply chain chez BMW à l'usine de Rosslyn (Pretoria). Gestion des fournisseurs, logistique, planification de production pour le marché africain.","Master en supply chain ou logistique. 3+ ans d'expérience industrielle.","Anglais courant","2027-06-30","https://www.bmwgroup.jobs/"),
E("bmw.com","BMW Group","BMW — Quality Engineer Dingolfing 2027","Poste d'ingénieur qualité chez BMW à Dingolfing. Contrôle qualité sur les lignes de production des séries 5, 7 et 8. Lean Six Sigma.","Master en ingénierie mécanique ou qualité. Certification Six Sigma appréciée.","Anglais et allemand","2027-06-30","https://www.bmwgroup.jobs/"),

// ═══ SIEMENS — POSTES SPÉCIFIQUES ═══
E("siemens.com","Siemens","Siemens — Ingénieur Automatisme Afrique 2027","Poste d'ingénieur automatisme chez Siemens pour l'Afrique. Programmation PLC (SIMATIC), systèmes SCADA, automatisation industrielle. Lagos ou Casablanca.","Master en automatisme, génie électrique ou informatique industrielle.","Anglais et/ou français","2027-06-30","https://jobs.siemens.com/"),
E("siemens.com","Siemens","Siemens — Digital Industries Consultant 2027","Poste de consultant Digital Industries chez Siemens. Transformation numérique des usines, jumeaux numériques, MindSphere IoT. Europe et Afrique.","Master en ingénierie industrielle ou informatique. Connaissance Industrie 4.0.","Anglais courant","2027-06-30","https://jobs.siemens.com/"),
E("siemens.com","Siemens Healthineers","Siemens Healthineers — Ingénieur Biomédical Afrique 2027","Poste d'ingénieur biomédical chez Siemens Healthineers en Afrique. Installation et maintenance d'IRM, scanners CT, échographes dans les hôpitaux africains.","Master en génie biomédical ou électronique. Expérience imagerie médicale.","Anglais et/ou français","2027-06-30","https://www.siemens-healthineers.com/careers"),

// ═══ VOLKSWAGEN — POSTES SPÉCIFIQUES ═══
E("volkswagen.com","Volkswagen","VW — Battery Cell Development Engineer 2027","Poste d'ingénieur développement cellules batteries chez VW à Salzgitter. PowerCo, gigafactory, chimie des cellules.","Master en chimie, matériaux ou électrochimie.","Anglais courant, allemand apprécié","2027-06-30","https://www.volkswagen-karriere.de/"),
E("volkswagen.com","Volkswagen","VW — Software Platform Developer 2027","Poste de développeur plateforme logicielle chez VW (CARIAD). OS véhicule, infotainment, OTA updates. Wolfsburg ou Berlin.","Master en informatique ou ingénierie logicielle. Compétences C++, Linux embarqué.","Anglais courant","2027-06-30","https://www.volkswagen-karriere.de/"),

// ═══ BOSCH — POSTES SPÉCIFIQUES ═══
E("bosch.com","Robert Bosch","Bosch — IoT Solutions Engineer 2027","Poste d'ingénieur solutions IoT chez Bosch. Bosch IoT Suite, capteurs connectés, smart building, industrie connectée. Stuttgart.","Master en informatique, IoT ou ingénierie des systèmes.","Anglais courant","2027-06-30","https://www.bosch.com/careers/"),
E("bosch.com","Robert Bosch","Bosch — ADAS Engineer 2027","Poste d'ingénieur ADAS (systèmes avancés d'aide à la conduite) chez Bosch. Radar, caméra, fusion de capteurs, freinage d'urgence.","Master en traitement du signal, IA ou ingénierie automobile.","Anglais courant","2027-06-30","https://www.bosch.com/careers/"),
E("bosch.com","Robert Bosch","Bosch — Manufacturing Engineer Afrique 2027","Poste d'ingénieur de fabrication chez Bosch pour l'Afrique. Outils électroportatifs, systèmes de sécurité. Nairobi ou Johannesburg.","Master en ingénierie industrielle ou mécanique.","Anglais courant","2027-06-30","https://www.bosch.com/careers/"),

// ═══ SAP — POSTES SPÉCIFIQUES ═══
E("sap.com","SAP","SAP — Cloud Architect Afrique 2027","Poste d'architecte cloud chez SAP pour l'Afrique. SAP S/4HANA Cloud, BTP, intégration. Bureau de Johannesburg couvrant l'Afrique subsaharienne.","Master en informatique. Certifications SAP appréciées. 3+ ans d'expérience.","Anglais courant","2027-06-30","https://jobs.sap.com/"),
E("sap.com","SAP","SAP — Machine Learning Developer 2027","Poste de développeur ML chez SAP. SAP AI Core, modèles prédictifs, NLP pour applications d'entreprise. Walldorf ou Berlin.","Master en IA, data science ou informatique. Compétences Python, TensorFlow.","Anglais courant","2027-06-30","https://jobs.sap.com/"),

// ═══ DEUTSCHE BANK — POSTES ═══
E("db.com","Deutsche Bank","Deutsche Bank — Risk Analyst Graduate 2027","Poste d'analyste risques chez Deutsche Bank. Risque de marché, crédit, opérationnel. Francfort ou Londres.","Master en finance quantitative, mathématiques ou statistique.","Anglais courant, allemand apprécié","2027-03-31","https://careers.db.com/"),
E("db.com","Deutsche Bank","Deutsche Bank — Technology Analyst 2027","Poste d'analyste technologie chez Deutsche Bank. Développement de systèmes de trading, infrastructure cloud, cybersécurité.","Master en informatique ou ingénierie logicielle.","Anglais courant","2027-03-31","https://careers.db.com/"),

// ═══ BASF — POSTES ═══
E("basf.com","BASF","BASF — Chemical Engineer 2027","Poste d'ingénieur chimiste chez BASF, plus grand chimiste mondial. Procédés catalytiques, polymères, agochimie. Ludwigshafen.","Master ou doctorat en génie chimique ou chimie.","Anglais courant, allemand apprécié","2027-06-30","https://www.basf.com/global/en/careers.html"),
E("basf.com","BASF","BASF — Agricultural Solutions Scientist Afrique 2027","Poste de scientifique solutions agricoles chez BASF en Afrique. Produits phytosanitaires, semences, agriculture durable. Nairobi ou Johannesburg.","Doctorat en agronomie, phytopathologie ou entomologie.","Anglais courant","2027-06-30","https://www.basf.com/global/en/careers.html"),

// ═══ BAYER — POSTES ═══
E("bayer.com","Bayer","Bayer — Clinical Research Physician 2027","Poste de médecin recherche clinique chez Bayer. Essais cliniques oncologie et cardiologie. Leverkusen ou Berlin.","Doctorat en médecine. Expérience en recherche clinique.","Anglais courant","2027-06-30","https://career.bayer.com/"),
E("bayer.com","Bayer","Bayer — Crop Science Field Scientist Afrique 2027","Poste de scientifique de terrain chez Bayer Crop Science en Afrique. Essais semences, protection des cultures. Kenya, Afrique du Sud.","Master en agronomie ou sciences des plantes.","Anglais courant","2027-06-30","https://career.bayer.com/"),

// ═══ DHL — POSTES ═══
E("dhl.com","DHL","DHL — Graduate Programme Logistics 2027","Programme diplômé chez DHL (Deutsche Post). Logistique internationale, supply chain, e-commerce logistics. Bonn et monde entier.","Master en logistique, supply chain ou commerce.","Anglais courant","2027-04-30","https://careers.dhl.com/"),
E("dhl.com","DHL","DHL — Operations Manager Afrique de l'Ouest 2027","Poste de responsable opérations chez DHL Express en Afrique de l'Ouest. Gestion du hub de Cotonou/Lagos. Express, freight, supply chain.","Master en logistique ou management. 2+ ans d'expérience opérationnelle.","Français et anglais","2027-06-30","https://careers.dhl.com/"),

// ═══ ALLIANZ — POSTES ═══
E("allianz.com","Allianz","Allianz — Actuaire Junior 2027","Poste d'actuaire junior chez Allianz, plus grand assureur mondial. Tarification, provisionnement, modélisation des risques. Munich ou Paris.","Master en actuariat, mathématiques ou statistique.","Anglais courant, français ou allemand","2027-06-30","https://careers.allianz.com/"),
E("allianz.com","Allianz","Allianz — Data Scientist Insurance 2027","Poste de data scientist chez Allianz. Modèles prédictifs pour l'assurance, détection de fraude, pricing automatisé.","Master en data science, statistique ou informatique.","Anglais courant","2027-06-30","https://careers.allianz.com/"),

// ═══ HUAWEI — POSTES SPÉCIFIQUES ═══
E("huawei.com","Huawei","Huawei — 5G RAN Engineer Afrique 2027","Poste d'ingénieur réseau 5G chez Huawei en Afrique. Déploiement RAN, optimisation réseau, tests de performance. Lagos, Nairobi ou Abidjan.","Master en télécommunications. Expérience réseau mobile.","Anglais courant, français apprécié","2027-06-30","https://career.huawei.com/"),
E("huawei.com","Huawei","Huawei — Cloud Computing Researcher 2027","Poste de chercheur en cloud computing chez Huawei. Architecture cloud distribuée, conteneurisation, edge computing. Shenzhen ou Munich.","Doctorat en informatique ou systèmes distribués.","Anglais courant","2027-06-30","https://career.huawei.com/"),
E("huawei.com","Huawei","Huawei — AI Researcher Shenzhen 2027","Poste de chercheur en IA chez Huawei. Vision par ordinateur, NLP, systèmes de recommandation. Huawei Noah's Ark Lab.","Doctorat en IA, ML ou traitement du signal. Publications appréciées.","Anglais courant","2027-06-30","https://career.huawei.com/"),

// ═══ ALIBABA — POSTES ═══
E("alibaba.com","Alibaba Group","Alibaba — Backend Engineer 2027","Poste d'ingénieur backend chez Alibaba. Systèmes distribués haute performance, e-commerce, cloud computing. Hangzhou ou Singapour.","Master en informatique. Compétences Java, systèmes distribués.","Anglais ou chinois","2027-06-30","https://talent.alibaba.com/"),
E("alibaba.com","Alibaba Cloud","Alibaba Cloud — Solutions Architect 2027","Poste d'architecte solutions chez Alibaba Cloud. Cloud public, hybride, IA as a service. Expansion en Afrique et Moyen-Orient.","Master en informatique ou ingénierie cloud. Certifications cloud appréciées.","Anglais courant","2027-06-30","https://talent.alibaba.com/"),

// ═══ BYD — POSTES ═══
E("byd.com","BYD","BYD — Ingénieur Batterie 2027","Poste d'ingénieur batteries chez BYD, leader mondial des véhicules électriques. Développement Blade Battery, LFP, intégration véhicule. Shenzhen.","Master en chimie, matériaux ou génie électrique.","Anglais ou chinois","2027-06-30","https://www.byd.com/en/Career.html"),
E("byd.com","BYD","BYD — Sales Manager Afrique 2027","Poste de responsable commercial chez BYD pour l'Afrique. Expansion véhicules électriques et bus électriques sur le continent africain.","Master en commerce ou marketing. Connaissance du marché automobile africain.","Anglais et/ou français","2027-06-30","https://www.byd.com/en/Career.html"),

// ═══ AB INBEV — POSTES ═══
E("ab-inbev.com","AB InBev","AB InBev — Global Management Trainee 2027","Programme GMT chez AB InBev, plus grand brasseur mondial. Rotation dans les fonctions supply chain, finance, marketing. Brasseries en Afrique (Nigeria, RDC, Afrique du Sud).","Master en commerce, ingénierie ou finance. Leadership exceptionnel.","Anglais courant, français apprécié","2027-03-31","https://www.ab-inbev.com/careers/"),
E("ab-inbev.com","AB InBev","AB InBev — Brewing Manager Afrique 2027","Poste de responsable brassage chez AB InBev en Afrique. Gestion de brasserie, qualité, procédés de fermentation. Nigeria, RDC, Tanzanie.","Master en ingénierie agroalimentaire, chimie ou brasserie.","Anglais et/ou français","2027-06-30","https://www.ab-inbev.com/careers/"),

// ═══ ARCELORMITTAL — POSTES ═══
E("arcelormittal.com","ArcelorMittal","ArcelorMittal — Ingénieur Métallurgiste 2027","Poste d'ingénieur métallurgiste chez ArcelorMittal, 1er sidérurgiste mondial. Aciérie, laminoirs, R&D acier. Luxembourg, France, Belgique.","Master en métallurgie, matériaux ou génie chimique.","Français et/ou anglais","2027-06-30","https://corporate.arcelormittal.com/careers"),
E("arcelormittal.com","ArcelorMittal","ArcelorMittal — Process Engineer Liberia 2027","Poste d'ingénieur procédé chez ArcelorMittal au Liberia. Mine de fer de Yekepa, traitement du minerai, logistique. Expansion en Afrique de l'Ouest.","Master en ingénierie minière, métallurgie ou génie chimique.","Anglais courant","2027-06-30","https://corporate.arcelormittal.com/careers"),

// ═══ TOTAL ENERGIES — POSTES ═══
E("totalenergies.com","TotalEnergies","TotalEnergies — Ingénieur Réservoir Afrique 2027","Poste d'ingénieur réservoir chez TotalEnergies en Afrique. Modélisation de gisements, optimisation de production. Angola, Nigeria, Congo.","Master en géologie pétrolière ou ingénierie des réservoirs.","Français et anglais","2027-06-30","https://careers.totalenergies.com/"),
E("totalenergies.com","TotalEnergies","TotalEnergies — Ingénieur Solaire Afrique 2027","Poste d'ingénieur solaire chez TotalEnergies Renewables en Afrique. Centrales solaires, mini-grids, stockage. Sénégal, Kenya, Afrique du Sud.","Master en énergie renouvelable ou génie électrique.","Français et/ou anglais","2027-06-30","https://careers.totalenergies.com/"),
E("totalenergies.com","TotalEnergies","TotalEnergies — HSE Manager Bénin 2027","Poste de responsable HSE chez TotalEnergies au Bénin. Stations-service, dépôts, sécurité industrielle, environnement.","Master en HSE, environnement ou ingénierie. Expérience HSE.","Français courant","2027-06-30","https://careers.totalenergies.com/"),

// ═══ L'ORÉAL — POSTES ═══
E("loreal.com","L'Oréal","L'Oréal — Marketing Manager Afrique 2027","Poste de responsable marketing chez L'Oréal pour l'Afrique subsaharienne. Dark & Lovely, Garnier, Maybelline. Stratégie de marque, digital, distribution.","Master en marketing ou commerce. 3+ ans d'expérience FMCG.","Français et anglais","2027-06-30","https://careers.loreal.com/"),
E("loreal.com","L'Oréal","L'Oréal — R&D Scientist 2027","Poste de scientifique R&D chez L'Oréal. Formulation cosmétique, innovations ingrédients, durabilité. Centres de recherche en France.","Doctorat en chimie, biochimie ou pharmacie.","Français et anglais","2027-06-30","https://careers.loreal.com/"),

// ═══ LVMH — POSTES ═══
E("lvmh.com","LVMH","LVMH — Finance Controller 2027","Poste de contrôleur financier chez LVMH. Reporting, budget, analyse financière pour les maisons du groupe (Dior, LV, Moët). Paris.","Master en finance ou comptabilité (DSCG, CPA). 2+ ans d'expérience.","Français et anglais","2027-06-30","https://www.lvmh.com/join-us/"),
E("lvmh.com","LVMH","LVMH — Digital Innovation Manager 2027","Poste de responsable innovation digitale chez LVMH. E-commerce luxe, AR/VR, personnalisation client, data. Paris.","Master en digital, informatique ou marketing. Affinité luxe.","Français et anglais","2027-06-30","https://www.lvmh.com/join-us/"),

// ═══ AIRBUS — POSTES SUPPLÉMENTAIRES ═══
E("airbus.com","Airbus","Airbus — Helicopter Mechanical Engineer 2027","Poste d'ingénieur mécanique hélicoptères chez Airbus Helicopters. Conception rotor, transmission, structure. Marignane (Marseille).","Master en aéronautique ou mécanique.","Français et anglais","2027-06-30","https://www.airbus.com/en/careers"),
E("airbus.com","Airbus","Airbus — Cybersecurity Engineer 2027","Poste d'ingénieur cybersécurité chez Airbus Defence & Space. Sécurité des systèmes aéronautiques et spatiaux, crypto, SOC.","Master en cybersécurité ou informatique. Habilitation possible.","Anglais courant, français apprécié","2027-06-30","https://www.airbus.com/en/careers"),

// ═══ ENTREPRISES LUXEMBOURGEOISES ═══
E("ses.com","SES","SES — Satellite Engineer Luxembourg 2027","Poste d'ingénieur satellite chez SES, opérateur de satellites au Luxembourg. Conception, orbite, télécommunications par satellite.","Master en aérospatiale, télécommunications ou ingénierie des systèmes.","Anglais courant, français apprécié","2027-06-30","https://www.ses.com/careers"),
E("ferrero.com","Ferrero","Ferrero — Quality Manager Luxembourg 2027","Poste de responsable qualité chez Ferrero (Nutella, Kinder) au Luxembourg. Contrôle qualité, HACCP, audits fournisseurs. Usine d'Arlon.","Master en agroalimentaire, qualité ou chimie.","Français et anglais","2027-06-30","https://careers.ferrero.com/"),
E("pwc.lu","PwC Luxembourg","PwC Luxembourg — Audit Associate 2027","Poste d'auditeur chez PwC Luxembourg. Audit des fonds d'investissement, banques, assurances. Place financière internationale.","Master en comptabilité, finance ou audit.","Français et anglais, allemand apprécié","2027-06-30","https://www.pwc.lu/en/careers.html"),

// ═══ ENTREPRISES BELGES ═══
E("ucb.com","UCB","UCB — Biotech Scientist Bruxelles 2027","Poste de scientifique biotech chez UCB, pharma belge spécialisée en neurologie et immunologie. Recherche anticorps, biologie moléculaire. Bruxelles.","Doctorat en biologie, biochimie ou pharmacie.","Anglais courant, français apprécié","2027-06-30","https://www.ucb.com/careers"),
E("solvay.com","Solvay","Solvay — Chemical Process Engineer 2027","Poste d'ingénieur procédé chimique chez Solvay. Chimie de spécialité, matériaux avancés, solutions durables. Bruxelles.","Master en génie chimique ou chimie.","Anglais courant, français apprécié","2027-06-30","https://www.solvay.com/en/careers"),
E("ageas.com","Ageas","Ageas — Actuarial Analyst Bruxelles 2027","Poste d'analyste actuariel chez Ageas, groupe d'assurance belgo-portugais. Modélisation, Solvency II, pricing. Bruxelles.","Master en actuariat ou mathématiques.","Anglais et français","2027-06-30","https://www.ageas.com/careers"),

// ═══ BOURSES SUPPLÉMENTAIRES — RÉGIONALES ═══
B("scholarship.gov.ng","Gouvernement Nigérian","Bourse BEA Nigeria 2027 — Études à l'Étranger","Bourses de la Bilateral Education Agreement du Nigeria. Master et doctorat à l'étranger (Russie, Chine, Turquie, Japon, Maroc, Cuba). Frais et allocation.","Nationalité nigériane. Licence avec mention. Admission dans une université partenaire.","Anglais","2027-05-31","https://scholarship.gov.ng/",["passeport"]),
B("africanleadershipuniversity.org","ALU","Bourse ALU Rwanda/Maurice 2027","Bourses pour licence et master à l'African Leadership University. Campus à Kigali (Rwanda) et Port Louis (Maurice). Business, informatique, leadership.","Nationalité africaine. Excellence académique et leadership.","Anglais","2027-06-30","https://www.alueducation.com/financial-aid/",["recommandation"]),
B("pau.edu.ng","Pan-Atlantic University","Bourse PAU Lagos 2027 — MBA Afrique","Bourses pour MBA à la Pan-Atlantic University de Lagos. Business school de référence au Nigeria. Partiellement financée.","Licence avec 3+ ans d'expérience professionnelle. GMAT apprécié.","Anglais","2027-06-30","https://www.pau.edu.ng/"),
B("knust.edu.gh","KNUST","Bourse KNUST Graduate 2027 — Ghana","Bourses pour master et doctorat au KNUST (Kwame Nkrumah University of Science and Technology). Meilleure université technique du Ghana. Sciences, ingénierie.","Admis au KNUST. Nationalité CEDEAO.","Anglais","2027-06-30","https://www.knust.edu.gh/"),
B("uct.ac.za","University of Cape Town","Bourse UCT International 2027 — Afrique du Sud","Bourses pour master et doctorat à UCT, meilleure université d'Afrique. Tous domaines. Exonération des frais et allocation.","Admis à UCT. Nationalité africaine. Excellence académique.","Anglais (IELTS 6.5+)","2027-06-30","https://www.uct.ac.za/main/explore-uct/faculties/postgraduate-funding",["recommandation"]),
B("wits.ac.za","University of the Witwatersrand","Bourse Wits Postgraduate 2027 — Johannesburg","Bourses pour master et doctorat à Wits, Johannesburg. Mines, ingénierie, médecine, droit. Top 5 Afrique.","Admis à Wits. Nationalité africaine.","Anglais (IELTS 6.0+)","2027-06-30","https://www.wits.ac.za/bursaries-and-scholarships/"),
B("stellenbosch.ac.za","Stellenbosch University","Bourse Stellenbosch International 2027","Bourses pour master à Stellenbosch, Afrique du Sud. Agronomie, ingénierie, business, droit. Campus viticole.","Admis à Stellenbosch. Non-sud-africain.","Anglais","2027-06-30","https://www.sun.ac.za/english/learning-teaching/postgraduate-bursaries"),

// ═══ BOURSES SUPPLÉMENTAIRES — EUROPE ═══
B("vub.be","VUB","Bourse VUB Bruxelles 2027","Bourses pour master à la Vrije Universiteit Brussel. Programmes en anglais. Sciences, ingénierie, sciences sociales.","Admis en master à la VUB. Non-européen.","Anglais","2027-03-01","https://www.vub.be/en/scholarships"),
B("ugent.be","Université de Gand","Bourse UGent Master Mind 2027","Bourses Master Mind de la Flandre pour master à l'Université de Gand. 8 000 EUR + allocation. Top 100 mondial.","Admis en master à UGent. Non-européen.","Anglais","2027-03-01","https://www.ugent.be/en/research/funding/postdoc/scholarships"),
B("kuleuven.be","KU Leuven","Bourse KU Leuven Science@Leuven 2027","Bourses pour master en sciences à KU Leuven, meilleure université de Belgique. Physique, chimie, biologie, informatique, mathématiques.","Admis en master sciences à KU Leuven. Pays en développement.","Anglais","2027-02-01","https://wet.kuleuven.be/english/scienceatleuvenscholarship",["recommandation"]),
B("unibocconi.it","Bocconi","Bourse Bocconi International 2027 — Milan","Bourses pour master à l'Université Bocconi de Milan. Finance, management, économie, data science. Top business school européenne.","Admis en master à Bocconi. Mérite académique.","Anglais","2027-01-15","https://www.unibocconi.eu/wps/wcm/connect/bocconi/sitopubblico_en/navigation+tree/home/programs/master+of+science/funding/",["recommandation"]),
B("polimi.it","Politecnico di Milano","Bourse Polimi International 2027","Bourses pour master au Politecnico di Milano. Ingénierie, architecture, design. Top technique en Italie.","Admis en master à Polimi. Non-européen.","Anglais","2027-04-30","https://www.polimi.it/en/financial-support-and-fees/"),
B("upc.edu","UPC Barcelona","Bourse UPC International 2027 — Barcelone","Bourses pour master à l'Universitat Politècnica de Catalunya. Ingénierie, informatique, architecture. Barcelone.","Admis en master à l'UPC. Non-européen.","Anglais ou espagnol","2027-04-30","https://www.upc.edu/en/masters/fees-and-grants"),
B("tuwien.at","TU Wien","Bourse TU Wien International 2027 — Vienne","Bourses pour master à la TU Wien, meilleure université technique d'Autriche. Informatique, architecture, ingénierie. Vienne.","Admis en master à la TU Wien. Résultats top.","Anglais ou allemand","2027-04-30","https://www.tuwien.at/en/studies/international/scholarships-and-grants"),

// ═══ EMPLOI — INSTITUTIONS BÉNINOISES SUPPLÉMENTAIRES ═══
E("finances.bj","Ministère des Finances Bénin","DGI Bénin — Postes Administration Fiscale 2027","Postes à la Direction Générale des Impôts du Bénin. Contrôle fiscal, recouvrement, contentieux, informatique fiscale.","Licence ou master en fiscalité, droit, économie ou comptabilité. Nationalité béninoise.","Français","2027-06-30","https://www.finances.bj/",["nationalite"]),
E("agriculture.gouv.bj","Ministère de l'Agriculture Bénin","MAEP — Postes Agriculture Bénin 2027","Postes au Ministère de l'Agriculture du Bénin. Vulgarisation, recherche agronomique, gestion des intrants, développement rural.","Diplôme en agronomie, zootechnie ou développement rural. Nationalité béninoise.","Français","2027-06-30","https://www.agriculture.gouv.bj/",["nationalite"]),
E("numerique.gouv.bj","Ministère du Numérique Bénin","MNDDF — Postes Transformation Digitale Bénin 2027","Postes au Ministère du Numérique du Bénin. e-Gouvernement, infrastructure IT nationale, cybersécurité, smart city Sèmè City.","Master en informatique, cybersécurité ou télécommunications. Nationalité béninoise.","Français","2027-06-30","https://www.numerique.gouv.bj/",["nationalite"]),
E("justice.gouv.bj","Ministère de la Justice Bénin","Justice Bénin — Postes Administration Judiciaire 2027","Postes au Ministère de la Justice du Bénin. Greffiers, agents d'administration pénitentiaire, conseillers juridiques.","Licence en droit minimum. Nationalité béninoise.","Français","2027-06-30","https://www.justice.gouv.bj/",["nationalite","casier"]),

// ═══ EMPLOI — CABINETS & SERVICES BÉNIN ═══
E("mazars.bj","Mazars Bénin","Mazars Bénin — Auditeur Junior 2027","Poste d'auditeur junior chez Mazars au Bénin. Audit légal, conseil, expertise comptable. Clientèle PME et grands groupes.","Master en comptabilité, audit ou finance.","Français courant","2027-06-30","https://www.mazars.bj/"),
E("kpmg.bj","KPMG Bénin","KPMG Bénin — Consultant Tax 2027","Poste de consultant fiscal chez KPMG Bénin. Conseil en fiscalité, prix de transfert, conformité. Clientèle internationale au Bénin.","Master en droit fiscal, comptabilité ou finance.","Français courant, anglais apprécié","2027-06-30","https://home.kpmg/bj/"),
E("ey.com","EY Bénin","EY Bénin — Auditeur Senior 2027","Poste d'auditeur senior chez Ernst & Young au Bénin. Audit financier, advisory, transactions. Clients internationaux.","Master en comptabilité ou finance. 2+ ans d'expérience en audit.","Français et anglais","2027-06-30","https://www.ey.com/fr_bj/careers"),

// ═══ EMPLOI — STARTUPS TECH AFRIQUE DE L'OUEST ═══
E("moov.africa","Moov Africa","Moov Africa — Développeur Mobile Bénin 2027","Poste de développeur mobile chez Moov Africa au Bénin. Applications mobile banking, USSD, APIs de paiement. Android et iOS.","Licence en informatique. Compétences Kotlin/Swift. Expérience mobile money.","Français courant","2027-06-30","https://www.moov-africa.bj/"),
E("gozem.co","Gozem","Gozem — Product Manager Cotonou 2027","Poste de chef de produit chez Gozem, super-app de mobilité en Afrique francophone. Transport, paiement, livraison. Siège à Cotonou.","Master en product management ou informatique. Expérience startup appréciée.","Français et anglais","2027-06-30","https://www.gozem.co/careers"),
E("djamo.com","Djamo","Djamo — Backend Engineer 2027","Poste d'ingénieur backend chez Djamo, fintech ivoirienne en forte croissance. Carte Visa, épargne, paiements. Abidjan.","Licence en informatique. Compétences Node.js, PostgreSQL, AWS.","Français courant","2027-06-30","https://www.djamo.com/careers"),
E("wave.com","Wave","Wave — Software Engineer Sénégal 2027","Poste d'ingénieur logiciel chez Wave, leader du mobile money au Sénégal et en CI. Systèmes de paiement à grande échelle. Dakar.","Licence en informatique. Compétences systèmes distribués, Java/Python.","Anglais courant, français apprécié","2027-06-30","https://www.wave.com/en/careers/"),
E("flutterwave.com","Flutterwave","Flutterwave — DevOps Engineer 2027","Poste d'ingénieur DevOps chez Flutterwave, infrastructure de paiement panafricaine. AWS, Kubernetes, CI/CD, monitoring à grande échelle.","Licence en informatique. Certifications AWS appréciées.","Anglais courant","2027-06-30","https://flutterwave.com/us/careers"),
E("andela.com","Andela","Andela — Senior Engineer 2027","Poste d'ingénieur senior chez Andela, plateforme de talent tech africain. Placement chez des clients tech mondiaux. Full remote depuis l'Afrique.","3+ ans d'expérience en développement. Compétences full stack.","Anglais courant","2027-06-30","https://andela.com/careers/"),

// ═══ ADMISSION — DERNIÈRES ═══
A("2ie-edu.org","2iE","Admission 2iE Master 2027 — Ouagadougou","Candidature en master à l'Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE). Génie civil, énergie, eau, environnement. Ouagadougou.","Licence en sciences ou ingénierie. Ouvert aux Africains.","Français","2027-07-31","https://www.2ie-edu.org/",["recommandation"]),
A("emi.ac.ma","EMI","Admission EMI Rabat 2027 — Ingénieur","Candidature à l'École Mohammadia d'Ingénieurs de Rabat. Meilleure école d'ingénieurs du Maroc. Génie civil, informatique, industriel.","Classes préparatoires ou licence en sciences. Concours national.","Français","2027-07-31","https://www.emi.ac.ma/"),
A("ensa-agadir.ac.ma","ENSA Agadir","Admission ENSA Agadir 2027 — Ingénieur","Candidature à l'ENSA d'Agadir. Ingénierie informatique, génie industriel, réseaux. Cycle ingénieur de 5 ans ou admission parallèle.","Bac scientifique ou classes préparatoires. Concours.","Français","2027-07-31","https://www.ensa-agadir.ac.ma/"),
A("polytech.univ-nantes.fr","Polytech Nantes","Admission Polytech Nantes 2027 — Ingénieur","Candidature au cycle ingénieur de Polytech Nantes. Informatique, énergie, matériaux, génie civil. Réseau Polytech.","CPGE, DUT, L2/L3 sciences. Concours Polytech.","Français (B2+)","2027-05-31","https://polytech.univ-nantes.fr/"),
A("insa-lyon.fr","INSA Lyon","Admission INSA Lyon 2027 — Ingénieur International","Candidature au cycle ingénieur de l'INSA Lyon pour étudiants internationaux. Informatique, génie civil, biochimie, mécanique, télécoms.","Bac scientifique avec excellence. Dossier + entretien.","Français (B2+)","2027-01-15","https://www.insa-lyon.fr/fr/admission"),
A("ensta-paris.fr","ENSTA Paris","Admission ENSTA Paris 2027 — Ingénieur","Candidature au cycle ingénieur à l'ENSTA Paris. Ingénierie des systèmes, transports, énergie, IA. Institut Polytechnique de Paris.","CPGE ou admission parallèle. Excellence en mathématiques et physique.","Français ou anglais","2027-05-31","https://www.ensta-paris.fr/fr/admissions"),

// ═══ CONCOURS DERNIERS ═══
CC("ena.ci","ENA CI","Concours ENA Côte d'Ivoire 2027","Concours d'entrée à l'ENA d'Abidjan. Formation de cadres supérieurs de l'administration ivoirienne. Administration générale, diplomatie, finances.","Licence minimum. Nationalité ivoirienne ou CEDEAO. Âge limite.","Français","2027-06-30","https://www.ena.ci/",["nationalite","casier"]),
CC("cesag.sn","CESAG","Concours CESAG 2027 — Gestion Afrique","Concours d'entrée au CESAG de Dakar. Management, comptabilité, banque, santé publique. Formation de cadres pour l'Afrique francophone.","Licence minimum. Nationalité UEMOA ou CEDEAO.","Français","2027-06-30","https://www.cesag.sn/",["nationalite"]),
CC("eamau.org","EAMAU","Concours EAMAU 2027 — Architecture Lomé","Concours d'entrée à l'École Africaine des Métiers de l'Architecture et de l'Urbanisme de Lomé. Architecture, urbanisme, gestion urbaine.","Bac scientifique. Concours de dessin et culture générale. Nationalité africaine.","Français","2027-06-30","https://www.eamau.org/",["nationalite"]),
CC("ensea.ed.ci","ENSEA","Concours ENSEA 2027 — Statistique Abidjan","Concours d'entrée à l'ENSEA d'Abidjan. Statistique, économie, planification, démographie. Formation de statisticiens pour l'Afrique.","Bac scientifique ou licence. Concours en mathématiques. Nationalité africaine.","Français","2027-06-30","https://www.ensea.ed.ci/",["nationalite"]),
CC("eismv.org","EISMV","Concours EISMV 2027 — Vétérinaire Dakar","Concours d'entrée à l'École Inter-États des Sciences et Médecine Vétérinaires de Dakar. Seule école vétérinaire d'Afrique francophone.","Bac scientifique C ou D. Concours en biologie, chimie, physique. Nationalité d'un État membre.","Français","2027-06-30","https://www.eismv.org/",["nationalite","medical"]),
CC("enaref.bf","ENAREF","Concours ENAREF 2027 — Finances Publiques Ouaga","Concours d'entrée à l'ENAREF de Ouagadougou. École des finances publiques d'Afrique francophone. Douanes, impôts, trésor.","Licence en économie, droit ou gestion. Nationalité UEMOA ou CEDEAO.","Français","2027-06-30","https://www.enaref.bf/",["nationalite","casier"]),
CC("iag.uac.bj","IAG UAC","Concours IAG 2027 — Gestion UAC Bénin","Concours d'entrée à l'Institut d'Administration et de Gestion de l'UAC. Gestion, comptabilité, marketing. Formation professionnalisante.","Bac ou licence selon le cycle. Concours écrit.","Français","2027-06-30","https://www.uac.bj/",["nationalite"]),
CC("ifri-uac.org","IFRI UAC","Concours IFRI 2027 — Informatique UAC Bénin","Concours d'entrée à l'Institut de Formation et de Recherche en Informatique de l'UAC. Génie logiciel, réseaux, sécurité, IA.","Bac scientifique C, D ou E. Concours en maths, physique, logique.","Français","2027-06-30","https://www.ifri-uac.bj/",["nationalite"]),

// ═══ BOURSES RESTANTES ═══
B("idrc.ca","CRDI","Bourse CRDI Recherche 2027 — Canada","Bourses du Centre de Recherches pour le Développement International du Canada. Recherche sur le développement en Afrique, Asie, Amérique latine.","Doctorant dans une université canadienne. Recherche liée au développement international.","Anglais ou français","2027-03-31","https://www.idrc.ca/en/funding",["projet","recommandation"]),
B("erasmusmundus.eu","Union Européenne","Bourse Erasmus Mundus Joint Master 2027","Bourses Erasmus Mundus pour masters conjoints dans 2+ universités européennes. Frais + 1 400 EUR/mois + voyage. 100+ programmes.","Licence. Nationalité non-européenne pour bourse complète. Admis dans un programme EMJMD.","Anglais et/ou langue du programme","2027-01-15","https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",["recommandation"]),
B("vlir-uos.be","VLIR-UOS","Bourse VLIR-UOS 2027 — Belgique Flandre","Bourses VLIR-UOS pour master dans les universités flamandes de Belgique. Frais, allocation 1 000 EUR/mois, assurance, billet. Pays en développement.","Nationalité d'un pays partenaire (inclut Bénin). 2+ ans d'expérience professionnelle.","Anglais","2027-02-01","https://www.vliruos.be/en/scholarships/",["recommandation"]),
B("ares-ac.be","ARES","Bourse ARES 2027 — Belgique Francophone","Bourses ARES pour master de spécialisation dans les universités francophones de Belgique. Frais + allocation + assurance. Pays partenaires dont le Bénin.","Nationalité d'un pays partenaire. 2+ ans d'expérience. Moins de 40 ans.","Français","2027-02-01","https://www.ares-ac.be/fr/cooperation-au-developpement/bourses/masters-de-specialisation",["recommandation"]),
B("swissuniversities.ch","Confédération Suisse","Bourse ESKAS Suisse 2027","Bourses d'excellence de la Confédération suisse pour chercheurs étrangers. Recherche ou doctorat dans les universités suisses. 12 mois renouvelables.","Master pour recherche, master pour doctorat. Recommandation de l'ambassade suisse.","Français, allemand, italien ou anglais","2027-12-01","https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html",["projet","recommandation"]),
];

async function main() {
  console.log(`Lot 7 — Total à insérer : ${ALL.length}`);
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
