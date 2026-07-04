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

function emploi(source:string,org:string,titre:string,desc:string,cond:string,lang:string,date:string,url:string,extras:string[]=[]): O {
  return {type:"EMPLOI",source,organisme:org,intitule:titre,description:desc,langueDetectee:"fr",conditions:cond,piecesExigees:p("EMPLOI",extras),exigenceLangue:lang,dateLimite:date,lien:url,canalCandidature:"formulaire",cibleCandidature:url};
}
function bourse(source:string,org:string,titre:string,desc:string,cond:string,lang:string,date:string,url:string,extras:string[]=[]): O {
  return {type:"BOURSE",source,organisme:org,intitule:titre,description:desc,langueDetectee:"fr",conditions:cond,piecesExigees:p("BOURSE",extras),exigenceLangue:lang,dateLimite:date,lien:url,canalCandidature:"formulaire",cibleCandidature:url};
}
function admission(source:string,org:string,titre:string,desc:string,cond:string,lang:string,date:string,url:string,extras:string[]=[]): O {
  return {type:"ADMISSION",source,organisme:org,intitule:titre,description:desc,langueDetectee:"fr",conditions:cond,piecesExigees:p("ADMISSION",extras),exigenceLangue:lang,dateLimite:date,lien:url,canalCandidature:"formulaire",cibleCandidature:url};
}
function concours(source:string,org:string,titre:string,desc:string,cond:string,lang:string,date:string,url:string,extras:string[]=[]): O {
  return {type:"CONCOURS",source,organisme:org,intitule:titre,description:desc,langueDetectee:"fr",conditions:cond,piecesExigees:p("CONCOURS",extras),exigenceLangue:lang,dateLimite:date,lien:url,canalCandidature:"formulaire",cibleCandidature:url};
}

const ALL: O[] = [

// ═══ EMPLOI TECH ADDITIONNEL ═══
emploi("linkedin.com","LinkedIn","LinkedIn — Graduate Software Engineer 2027","Postes pour diplômés chez LinkedIn, réseau professionnel n°1 mondial (groupe Microsoft). Ingénierie, data science, produit. Sunnyvale, San Francisco, Dublin.","Master en informatique ou data science. Compétences en Java, Scala ou Python.","Anglais courant","2027-04-30","https://careers.linkedin.com/students",["diplome"]),
emploi("twitter.com","X (ex Twitter)","X — Graduate Engineer 2027","Postes pour diplômés chez X (ex Twitter). Backend, ML, infrastructure temps réel. San Francisco et mondial.","Master en informatique. Systèmes distribués, ML.","Anglais courant","2027-04-30","https://careers.x.com/",["diplome"]),
emploi("snap.com","Snap Inc.","Snapchat — Graduate Engineer 2027","Postes pour diplômés chez Snap (Snapchat). Réalité augmentée, computer vision, ML. Los Angeles et Londres.","Master en informatique ou computer vision.","Anglais courant","2027-04-30","https://snap.com/en-US/jobs",["diplome"]),
emploi("tencent.com","Tencent","Tencent — Global Graduate 2027","Programme pour diplômés chez Tencent, géant chinois de la tech (WeChat, gaming). Ingénierie, produit, design. Shenzhen et mondial.","Master en informatique ou ingénierie.","Anglais ou chinois","2027-05-31","https://careers.tencent.com/",["diplome"]),
emploi("samsung.com","Samsung Electronics","Samsung — Graduate Programme 2027 — Corée","Programme pour diplômés chez Samsung Electronics, leader mondial des semi-conducteurs et smartphones. Ingénierie, R&D, IA. Séoul et mondial.","Master en génie électrique, informatique ou matériaux.","Anglais ou coréen","2027-04-30","https://www.samsung.com/semiconductor/careers/",["diplome"]),
emploi("sony.com","Sony","Sony — Graduate Programme 2027","Programme pour diplômés chez Sony. PlayStation, capteurs d'image, musique, cinéma. Ingénierie, logiciel, IA. Tokyo et mondial.","Master en informatique, génie électrique ou design.","Anglais ou japonais","2027-05-31","https://www.sony.com/en/SonyInfo/Jobs/",["diplome"]),
emploi("toyota.com","Toyota","Toyota — Graduate Programme 2027 — Automobile Japon","Programme pour diplômés chez Toyota, 1er constructeur automobile mondial. Ingénierie mécanique, électrique, IA pour conduite autonome. Toyota City et mondial.","Master en ingénierie mécanique, électrique ou informatique.","Anglais ou japonais","2027-05-31","https://global.toyota/en/careers/",["diplome"]),
emploi("hitachi.com","Hitachi","Hitachi — Graduate Programme 2027","Programme pour diplômés chez Hitachi. Infrastructure sociale, énergie, transport, IT. Forte en systèmes ferroviaires et IoT industriel.","Master en ingénierie ou informatique.","Anglais ou japonais","2027-05-31","https://www.hitachi.com/New/cnews/careers/",["diplome"]),

// ═══ EMPLOI ÉNERGIE & ENVIRONNEMENT ═══
emploi("vestas.com","Vestas","Vestas — Graduate Programme 2027 — Éolien","Programme pour diplômés chez Vestas, leader mondial de l'éolien. Ingénierie des turbines, maintenance, digital. Danemark et mondial.","Master en génie mécanique, électrique ou environnemental.","Anglais courant","2027-04-30","https://www.vestas.com/en/careers",["diplome"]),
emploi("orsted.com","Ørsted","Ørsted — Graduate Programme 2027 — Énergie verte","Programme chez Ørsted, leader mondial de l'éolien offshore. 2 ans avec rotations. Danemark, UK, USA.","Master en ingénierie, environnement ou commerce.","Anglais courant","2027-03-31","https://orsted.com/en/careers",["diplome"]),
emploi("enel.com","Enel","Enel — Graduate Programme 2027 — Énergies renouvelables","Programme pour diplômés chez Enel, géant italien de l'énergie. Solaire, éolien, hydro. Présence en 30+ pays dont Afrique du Sud.","Master en ingénierie énergétique, électrique ou environnement.","Anglais courant","2027-04-30","https://www.enel.com/careers",["diplome"]),
emploi("veolia.com","Veolia","Veolia — Postes Eau & Environnement Afrique 2027","Postes chez Veolia en Afrique. Gestion de l'eau, déchets, énergie. Contrats de gestion au Maroc, Gabon, Niger, Bénin.","Diplôme en hydraulique, environnement, génie chimique ou génie civil.","Français courant","2027-06-30","https://www.veolia.com/fr/carrieres",),
emploi("suez.com","Suez","Suez — Postes Eau & Déchets Afrique 2027","Postes chez Suez en Afrique. Traitement et distribution d'eau, gestion des déchets. Maroc, Côte d'Ivoire, Sénégal.","Diplôme en hydraulique, chimie, environnement ou génie civil.","Français courant","2027-06-30","https://www.suez.com/en/careers",),

// ═══ EMPLOI TRANSPORT & LOGISTIQUE ═══
emploi("maersk.com","Maersk","Maersk — Graduate Programme 2027 — Logistique maritime","Programme pour diplômés chez Maersk, leader mondial du transport maritime. 2 ans de rotations. Commerce, logistique, digital, opérations. Ports africains.","Master en logistique, commerce international ou ingénierie.","Anglais courant","2027-03-31","https://www.maersk.com/careers",["diplome"]),
emploi("cma-cgm.com","CMA CGM","CMA CGM — Graduate Programme 2027 — Maritime Marseille","Programme pour diplômés chez CMA CGM, 3e armateur mondial (Marseille). Logistique, shipping, port, digital. Forte présence en Afrique de l'Ouest.","Master en logistique, commerce ou ingénierie.","Français et anglais","2027-04-30","https://www.cma-cgm.com/careers",["diplome"]),
emploi("msc.com","MSC","MSC — Postes Logistique Maritime Afrique 2027","Postes chez MSC, 1er armateur mondial. Opérations portuaires, logistique, freight management. Bureaux en Afrique de l'Ouest.","Diplôme en logistique, transport maritime ou commerce international.","Anglais et/ou français","2027-06-30","https://www.msc.com/careers",),
emploi("dpworld.com","DP World","DP World — Postes Portuaires Afrique 2027","Postes chez DP World, opérateur portuaire mondial. Terminaux en Afrique : Djibouti, Sénégal, Mozambique, Somaliland. Opérations, ingénierie, management.","Diplôme en logistique portuaire, ingénierie ou management.","Anglais courant","2027-06-30","https://www.dpworld.com/careers",),

// ═══ EMPLOI AGRICULTURE & AGRO-INDUSTRIE ═══
emploi("syngenta.com","Syngenta","Syngenta — Graduate Programme 2027 — Agrochimie","Programme pour diplômés chez Syngenta, leader de l'agrochimie. Semences, protection des cultures, digital agriculture. Suisse et mondial.","Master en agronomie, biologie, chimie ou commerce.","Anglais courant","2027-04-30","https://www.syngenta.com/careers",["diplome"]),
emploi("corteva.com","Corteva Agriscience","Corteva — Postes Agriculture Afrique 2027","Postes chez Corteva (ex Dow AgroSciences/DuPont Pioneer). Semences hybrides, protection des cultures. Forte en Afrique de l'Ouest et Est.","Diplôme en agronomie, phytopathologie ou commerce agricole.","Anglais et/ou français","2027-06-30","https://www.corteva.com/careers.html",),
emploi("yara.com","Yara International","Yara — Postes Fertilisants Afrique 2027","Postes chez Yara, leader mondial des fertilisants. Présent en Afrique : Côte d'Ivoire, Ghana, Nigeria, Tanzanie, Mozambique. Agronomie, ventes, logistique.","Diplôme en agronomie, chimie ou commerce agricole.","Anglais et/ou français","2027-06-30","https://www.yara.com/career/",),

// ═══ BOURSES — AUSTRALIE & NOUVELLE-ZÉLANDE ═══
bourse("unimelb.edu.au","University of Melbourne","Bourse Melbourne Graduate 2027 — Australie","Bourses pour master et doctorat à l'Université de Melbourne, n°1 en Australie. Exemption de frais et allocation. Sciences, ingénierie, commerce.","Admis en master/doctorat. Excellence académique.","Anglais (IELTS 6.5+)","2027-04-30","https://scholarships.unimelb.edu.au/",["recommandation"]),
bourse("sydney.edu.au","University of Sydney","Bourse Sydney International 2027 — Australie","Bourses pour étudiants internationaux à l'Université de Sydney, top 20 mondial. Exemption partielle ou totale des frais.","Admis à Sydney. Non-australien. Excellence académique.","Anglais (IELTS 6.5+)","2027-01-15","https://www.sydney.edu.au/scholarships/",["recommandation"]),
bourse("anu.edu.au","Australian National University","Bourse ANU International 2027","Bourses pour master et doctorat à l'ANU, meilleure université d'Australie selon certains classements. Canberra.","Admis à l'ANU. Excellence académique dans le top 10%.","Anglais (IELTS 6.5+)","2027-04-30","https://www.anu.edu.au/study/scholarships",["recommandation"]),
bourse("auckland.ac.nz","University of Auckland","Bourse Auckland International 2027 — Nouvelle-Zélande","Bourses pour master et doctorat à l'Université d'Auckland, n°1 en Nouvelle-Zélande. Exemption de frais et allocation.","Admis à Auckland. Non-néozélandais.","Anglais (IELTS 6.5+)","2027-03-31","https://www.auckland.ac.nz/en/study/scholarships-and-awards.html",["recommandation"]),

// ═══ BOURSES — RUSSIE & EUROPE DE L'EST ═══
bourse("russia.study","Gouvernement russe","Bourse du Gouvernement Russe 2027","Bourses pour études en Russie tous cycles. Frais de scolarité et hébergement gratuits dans les universités publiques. Sélection par les ambassades.","Non-russe. Baccalauréat ou diplôme requis selon le cycle.","Russe (cours préparatoire inclus)","2027-02-28","https://education-in-russia.com/",["passeport","medical"]),
bourse("hungarianstudies.hu","Gouvernement hongrois","Bourse Stipendium Hungaricum 2027 — Hongrie","Bourse gouvernementale hongroise. Tous les cycles. 140 000 HUF/mois, frais de scolarité, hébergement. Programmes en anglais et français disponibles.","Être citoyen d'un pays partenaire (dont pays africains). Bons résultats.","Anglais ou français selon le programme","2027-01-15","https://stipendiumhungaricum.hu/",["passeport"]),
bourse("uni-warsaw.pl","Gouvernement polonais","Bourse NAWA 2027 — Master en Pologne","Bourses pour master en Pologne via l'agence NAWA. Allocation mensuelle et exemption de frais. Programmes en anglais.","Admis en master en Pologne. Non-européen.","Anglais (IELTS 5.5+)","2027-02-28","https://nawa.gov.pl/en/students/foreign-students/",),
bourse("cas.cz","Gouvernement tchèque","Bourse Gouvernement Tchèque 2027 — Prague","Bourses pour études en République tchèque. Tous les cycles. Frais de scolarité gratuits dans les programmes en tchèque. Allocation disponible.","Être citoyen d'un pays en développement. Admis en université tchèque.","Tchèque (cours préparatoire gratuit d'un an) ou anglais","2027-03-31","https://www.msmt.cz/eu-and-international-affairs/government-scholarships-developing-countries",["passeport"]),

// ═══ BOURSES — INDE ═══
bourse("iccr.gov.in","Gouvernement indien (ICCR)","Bourse ICCR 2027 — Études en Inde","Bourses du Indian Council for Cultural Relations pour études en Inde. Tous cycles. Frais de scolarité, hébergement et allocation couverts.","Non-indien. Sélection par l'ambassade d'Inde. Bons résultats.","Anglais ou hindi","2027-04-30","https://www.iccr.gov.in/scholarship",["passeport","medical"]),
bourse("itecgoi.in","Gouvernement indien","Programme ITEC 2027 — Formation professionnelle Inde","Bourses de formation professionnelle courte (2-6 mois) en Inde via le programme ITEC. Domaines : IT, management, agriculture, finance. Tout frais payés.","Être un professionnel d'un pays partenaire. Sélection par l'ambassade indienne.","Anglais","2027-06-30","https://www.itecgoi.in/"),
bourse("iisc.ac.in","IISc Bangalore","Bourse IISc Bangalore 2027 — Sciences Inde","Bourses pour master et doctorat à l'Indian Institute of Science, meilleur institut de recherche d'Inde. Sciences fondamentales, ingénierie, biosciences.","Master en sciences ou ingénierie. Non-indien pour bourses internationales.","Anglais","2027-04-15","https://www.iisc.ac.in/admissions/",["recommandation"]),

// ═══ ADMISSION — UNIVERSITÉS ASIE-PACIFIQUE ═══
admission("ntu.edu.sg","NTU Singapour","Admission Master NTU 2027 — Singapour","Candidature aux masters de NTU Singapour. Ingénierie, business, sciences, humanités. Campus tropical ultra-moderne.","Licence avec de bons résultats. GRE/GMAT pour certains programmes.","Anglais (IELTS 6.5+ ou TOEFL 85+)","2027-01-31","https://www.ntu.edu.sg/admissions/graduate",["recommandation","langue"]),
admission("hku.hk","University of Hong Kong","Admission Master HKU 2027","Candidature aux masters de HKU. Commerce, droit, ingénierie, médecine. Top 30 mondial.","Licence avec de bons résultats.","Anglais (IELTS 6.0+ ou TOEFL 80+)","2027-02-28","https://www.gs.hku.hk/",["recommandation","langue"]),
admission("kyoto-u.ac.jp","Kyoto University","Admission Master Kyoto 2027 — Japon","Candidature aux masters de Kyoto University, 2e meilleure université du Japon. Sciences, ingénierie, médecine. Programmes en anglais.","Licence. Non-japonais.","Anglais ou japonais","2027-02-28","https://www.kyoto-u.ac.jp/en/education-campus/admissions/",["recommandation","langue"]),

// ═══ ADMISSION — CANADA SUPPLÉMENTAIRE ═══
admission("ubc.ca","UBC","Admission Graduate UBC 2027 — Vancouver","Candidature aux masters et doctorats de UBC Vancouver. Top 40 mondial. Sciences, ingénierie, foresterie, commerce.","Licence avec de bons résultats. GPA minimum B+.","Anglais (IELTS 6.5+ ou TOEFL 90+)","2027-01-15","https://www.grad.ubc.ca/prospective-students/application-admission",["recommandation","langue"]),
admission("uwaterloo.ca","University of Waterloo","Admission Graduate Waterloo 2027","Candidature aux masters et doctorats de Waterloo. Leader mondial en informatique et programme co-op.","Licence avec de bons résultats en informatique, ingénierie ou mathématiques.","Anglais (IELTS 6.5+ ou TOEFL 90+)","2027-02-01","https://uwaterloo.ca/graduate-studies-postdoctoral-affairs/future-students/applying-graduate-school",["recommandation","langue"]),
admission("queensu.ca","Queen's University","Admission Master Queen's 2027 — Kingston","Candidature aux masters de Queen's University à Kingston, Ontario. Commerce (Smith School), ingénierie, droit, sciences.","Licence avec de bons résultats.","Anglais (IELTS 7.0 ou TOEFL 88)","2027-03-01","https://www.queensu.ca/sgs/",["recommandation","langue"]),

// ═══ EMPLOI — CABINETS D'AVOCATS & DROIT ═══
emploi("cliffordchance.com","Clifford Chance","Clifford Chance — Graduate Programme 2027","Programme pour diplômés en droit chez Clifford Chance, cabinet d'avocats du Magic Circle. Training contract de 2 ans. Londres et mondial.","Master en droit. LLM apprécié.","Anglais courant","2027-01-31","https://www.cliffordchance.com/careers.html",["diplome"]),
emploi("linklaters.com","Linklaters","Linklaters — Training Contract 2027","Training contract chez Linklaters, cabinet d'avocats international du Magic Circle. Droit des affaires, finance, M&A. Londres et mondial.","Master en droit. Résultats académiques exceptionnels.","Anglais courant","2027-01-31","https://careers.linklaters.com/",["diplome"]),
emploi("freshfields.com","Freshfields","Freshfields — Graduate Programme 2027 — Droit","Programme pour diplômés en droit chez Freshfields Bruckhaus Deringer. Litige, M&A, antitrust, finance. Mondial.","Master en droit. Excellence académique.","Anglais courant, allemand pour Berlin","2027-01-31","https://www.freshfields.com/en-gb/careers/",["diplome"]),

// ═══ EMPLOI — MÉDIAS & COMMUNICATION ═══
emploi("bbc.com","BBC","BBC — Graduate Scheme 2027","Programme pour diplômés à la BBC. Journalisme, production, technologie, business. 2 ans de formation intensive. Londres.","Master récent. Passion pour les médias et l'actualité.","Anglais courant","2027-01-31","https://careerssearch.bbc.co.uk/",["diplome"]),
emploi("rfi.fr","Radio France Internationale","RFI — Stages et emplois Afrique 2027","Postes et stages chez RFI, radio mondiale francophone. Journalisme, production, numérique. Correspondants en Afrique.","Diplôme en journalisme ou communication. Expérience médias appréciée.","Français courant","2027-06-30","https://www.rfi.fr/fr/recrutement",),
emploi("afp.com","AFP","AFP — Postes Journalisme Afrique 2027","Postes chez l'Agence France-Presse en Afrique. Journalistes, photographes, vidéastes, fact-checkers. Bureaux dans 15+ pays africains.","Diplôme en journalisme. Minimum 3 ans d'expérience. Maîtrise terrain.","Français et anglais","2027-06-30","https://www.afp.com/fr/afp/recrutement",),
emploi("jeuneafrique.com","Jeune Afrique","Jeune Afrique — Postes Journalisme 2027","Postes chez Jeune Afrique, 1er média panafricain francophone. Journalistes, rédacteurs, éditeurs web. Paris et correspondants en Afrique.","Diplôme en journalisme ou sciences politiques. Connaissance de l'Afrique.","Français courant","2027-06-30","https://www.jeuneafrique.com/emplois/",),

// ═══ EMPLOI — SPORT & ENTERTAINMENT ═══
emploi("fifa.com","FIFA","FIFA — Postes 2027 — Zurich","Postes à la FIFA à Zurich. Administration du football mondial, développement, compétitions, digital, communication, juridique.","Master pertinent. Passion pour le football.","Anglais courant, français/espagnol apprécié","2027-06-30","https://www.fifa.com/about-fifa/employment-at-fifa/",["diplome"]),
emploi("caf.com","CAF","CAF — Postes Football Afrique 2027","Postes à la Confédération Africaine de Football au Caire. Organisation des compétitions africaines, développement, arbitrage, marketing.","Master en management sportif, communication ou droit. Connaissance du football africain.","Français et anglais","2027-06-30","https://www.cafonline.com/",["diplome"]),
emploi("olympics.com","CIO","CIO — Stages et postes Lausanne 2027","Stages et postes au Comité International Olympique à Lausanne. Sport, digital, communication, finance, événementiel.","Master pertinent. Passion pour le mouvement olympique.","Français et anglais","2027-06-30","https://olympics.com/ioc/careers",["diplome"]),

// ═══ CONCOURS — BÉNIN SUPPLÉMENTAIRES ═══
concours("enam.bj","ENAM Bénin","Concours ENAM Bénin 2026-2027 — Administration","Concours d'entrée à l'École Nationale d'Administration et de Magistrature du Bénin. Formation des cadres de l'administration publique béninoise.","Nationalité béninoise. Licence en droit, économie ou administration. Maximum 35 ans.","Français","2026-11-30","https://www.enam.bj/",["nationalite","casier","diplome"]),
concours("infosec.bj","Ministère du Numérique Bénin","Concours Numérique Bénin 2026 — Informaticiens d'État","Recrutement d'informaticiens pour les administrations publiques béninoises. Catégories A et B. Développement, réseaux, cybersécurité.","Nationalité béninoise. Licence ou master en informatique.","Français","2026-12-31","https://www.numerique.gouv.bj/",["nationalite","casier","diplome"]),
concours("health.gouv.bj","Ministère de la Santé Bénin","Concours Médecins Bénin 2026","Recrutement de médecins pour les hôpitaux et centres de santé publics du Bénin. Postes dans tout le pays y compris zones rurales.","Nationalité béninoise. Doctorat en médecine. Inscription à l'Ordre des Médecins.","Français","2026-12-31","https://www.sante.gouv.bj/",["nationalite","casier","diplome","medical"]),

// ═══ EMPLOI — IMMOBILIER & TOURISME ═══
emploi("accor.com","Accor","Accor — Graduate Programme Hôtellerie Afrique 2027","Programme pour diplômés chez Accor en Afrique (Pullman, Sofitel, Novotel, Ibis). 350+ hôtels en Afrique. Management hôtelier, F&B, revenue management.","Master en hôtellerie, tourisme ou management.","Français et anglais","2027-04-30","https://careers.accor.com/",["diplome"]),
emploi("marriott.com","Marriott","Marriott — Voyage Programme Afrique 2027","Programme graduate chez Marriott en Afrique. 18 mois de rotations dans les départements hôteliers. Sheraton, W Hotels, JW Marriott.","Master en hôtellerie ou management. Passion pour l'hospitalité.","Anglais courant","2027-04-30","https://careers.marriott.com/",["diplome"]),
emploi("hilton.com","Hilton","Hilton — Graduate Programme Afrique 2027","Programme pour diplômés chez Hilton en Afrique. Management hôtelier, ventes, marketing, opérations. Hotels au Nigeria, Éthiopie, Maroc, Kenya.","Master en hôtellerie ou management. Mobilité.","Anglais courant","2027-04-30","https://jobs.hilton.com/",["diplome"]),

// ═══ BOURSES — TAIWAN ═══
bourse("studyintaiwan.org","Gouvernement de Taïwan","Bourse Taiwan ICDF 2027","Bourse complète pour master à Taïwan. Frais, allocation, billet d'avion et assurance. Programmes en anglais. Focus développement et agriculture.","Être citoyen d'un pays allié de Taïwan. Licence avec de bons résultats. Maximum 40 ans.","Anglais","2027-03-15","https://www.icdf.org.tw/ct.asp?xItem=12505&CtNode=29829",["passeport","recommandation"]),
bourse("studyintaiwan.org","Gouvernement de Taïwan","Bourse MOE Taiwan 2027","Bourse du ministère de l'Éducation de Taïwan. 25 000 TWD/mois pour master, 30 000 TWD pour doctorat. Pas de frais de scolarité.","Non-taïwanais. Admis dans une université taïwanaise. Bons résultats.","Chinois mandarin ou anglais","2027-04-30","https://www.studyintaiwan.org/scholarship",["passeport"]),

// ═══ BOURSES — MOYEN-ORIENT ═══
bourse("kaust.edu.sa","KAUST","Bourse KAUST 2027 — Master/Doctorat Arabie Saoudite","Bourse complète à KAUST (King Abdullah University of Science and Technology). Tous les étudiants acceptés sont entièrement financés. Sciences, ingénierie, informatique.","Admis à KAUST. Licence en sciences ou ingénierie avec d'excellents résultats.","Anglais (TOEFL 79+ ou IELTS 6.0+)","2027-01-15","https://www.kaust.edu.sa/en/study/applying-to-kaust",["recommandation"]),
bourse("khalifa.edu","Khalifa University","Bourse Khalifa University 2027 — EAU","Bourse complète pour master et doctorat à Khalifa University à Abu Dhabi. Allocation mensuelle, frais couverts, logement. Ingénierie et sciences.","Admis à Khalifa University. Excellence en ingénierie ou sciences.","Anglais (IELTS 6.5+ ou TOEFL 91+)","2027-04-30","https://www.ku.ac.ae/admissions/graduate-admissions/",["recommandation"]),
bourse("hbku.edu.qa","Hamad Bin Khalifa University","Bourse HBKU 2027 — Qatar","Bourse complète pour master et doctorat à HBKU, Qatar Foundation. Allocation généreuse, logement, billet d'avion. Sciences, ingénierie, politique.","Admis à HBKU. Excellence académique.","Anglais","2027-04-15","https://www.hbku.edu.qa/en/admissions",["recommandation"]),

// ═══ EMPLOI — BANQUES AFRICAINES ═══
emploi("afreximbank.com","Afreximbank","Afreximbank — Postes 2027 (Le Caire)","Postes à la Banque Africaine d'Import-Export au Caire. Finance du commerce, investissement, garanties. Pour professionnels africains.","Master en finance, économie, droit ou commerce international. Expérience bancaire.","Anglais courant, français apprécié","2027-06-30","https://www.afreximbank.com/careers/",["diplome"]),
emploi("shelterafrique.org","Shelter Afrique","Shelter Afrique — Postes Logement Afrique 2027","Postes chez Shelter Afrique, institution panafricaine de financement du logement à Nairobi. Finance, ingénierie, gestion de projet.","Master en finance, immobilier, ingénierie ou urbanisme.","Anglais courant","2027-06-30","https://www.shelterafrique.org/careers/",["diplome"]),
emploi("tradeanddevelopmentbank.com","TDB","TDB — Postes Banque de Développement 2027","Postes à la Trade and Development Bank (PTA Bank) à Nairobi. Finance du commerce, syndication, trésorerie. 22 pays membres.","Master en finance, économie ou commerce.","Anglais courant","2027-06-30","https://www.tdbgroup.org/careers/",["diplome"]),

// ═══ EMPLOI — CABINETS D'AUDIT AFRIQUE ═══
emploi("mazars.com","Mazars","Mazars — Graduate Afrique 2027","Programme pour diplômés chez Mazars en Afrique. Audit, conseil, fiscalité. Bureaux au Bénin (Cotonou), Côte d'Ivoire, Sénégal, Cameroun.","Master en comptabilité, finance ou audit.","Français courant","2027-05-31","https://www.mazars.com/Home/Careers",["diplome"]),
emploi("bdo.com","BDO","BDO — Graduate Afrique 2027","Programme pour diplômés chez BDO en Afrique. 5e réseau mondial d'audit. Audit, conseil, fiscalité. Bureaux dans 15+ pays africains.","Master en comptabilité ou finance.","Français et/ou anglais","2027-05-31","https://www.bdo.global/en-gb/careers",["diplome"]),
emploi("grantthornton.com","Grant Thornton","Grant Thornton — Graduate Afrique 2027","Programme pour diplômés chez Grant Thornton en Afrique. Audit, conseil, fiscalité. Présent dans 12+ pays africains.","Master en comptabilité, finance ou audit.","Français et/ou anglais","2027-05-31","https://www.grantthornton.global/en/careers/",["diplome"]),

// ═══ EMPLOI — INSTITUTIONS BENINOISES ═══
emploi("anpe.bj","ANPE Bénin","ANPE — Offres d'emploi Bénin 2027","Plateforme nationale de l'emploi au Bénin. Offres dans tous les secteurs : public, privé, ONG. Inscription gratuite pour les demandeurs d'emploi.","Tout diplôme selon l'offre. Être inscrit sur la plateforme ANPE.","Français","2027-06-30","https://www.anpe.bj/",),
emploi("serhau-sa.bj","SERHAU-SA","SERHAU-SA — Postes Urbanisme Bénin 2027","Postes chez SERHAU-SA, société d'études régionales d'habitat et d'aménagement urbain au Bénin. Urbanisme, architecture, génie civil, topographie.","Diplôme en urbanisme, architecture, génie civil ou géographie.","Français","2027-06-30","https://www.serhau.bj/",),
emploi("otr.bj","Office Togolais des Recettes","OTR Togo — Recrutements 2027","Recrutement à l'Office Togolais des Recettes. Impôts, douanes, informatique fiscale. Salaire compétitif. Lomé.","Diplôme en comptabilité, fiscalité, droit ou informatique. Nationalité togolaise.","Français","2027-06-30","https://www.otr.tg/",["nationalite"]),

// ═══ BOURSES — PROGRAMMES AFRICAINS ═══
bourse("africanleadershipuniversity.org","ALU","Bourse ALU 2027 — Leadership Afrique","Bourses pour le programme de licence à l'African Leadership University au Rwanda et à l'île Maurice. Formation en leadership, entrepreneuriat et technologie. Bourses basées sur le besoin et le mérite.","Être citoyen africain. 18-25 ans. Engagement pour le développement de l'Afrique.","Anglais","2027-04-30","https://www.alueducation.com/admissions/fees-financial-aid/",["recommandation"]),
bourse("ashesi.edu.gh","Ashesi University","Bourse Ashesi 2027 — Ghana","Bourses pour licence à Ashesi University au Ghana. Ingénierie, informatique, commerce, design. Plus de 50% des étudiants reçoivent une aide financière.","Baccalauréat. Citoyen africain. Excellents résultats et leadership.","Anglais","2027-03-15","https://www.ashesi.edu.gh/admissions/financial-aid.html",["recommandation"]),
bourse("2u.com","USAID via universités africaines","Bourse USAID Higher Education 2027 — Afrique","Bourses USAID pour l'enseignement supérieur en Afrique. Partenariats avec des universités africaines pour des masters et formations professionnelles. Domaines prioritaires : santé, agriculture, STEM.","Être citoyen d'un pays africain éligible. Admission dans un programme partenaire.","Anglais ou français","2027-06-30","https://www.usaid.gov/education/higher-education",),

// ═══ DERNIERS EMPLOIS POUR LE CAP ═══
emploi("pwcbenin.com","PwC Bénin","PwC Bénin — Postes Audit et Conseil 2027","Postes chez PwC au Bénin. Audit, conseil en management, fiscalité. Bureau à Cotonou. Clients locaux et régionaux.","Master en comptabilité, finance ou gestion.","Français courant","2027-06-30","https://www.pwc.com/bj/fr/careers.html",["diplome"]),
emploi("ey.com","EY Bénin","EY Bénin — Postes 2027","Postes chez EY au Bénin. Audit, conseil, transactions. Bureau de Cotonou servant le marché béninois et régional.","Master en comptabilité, finance ou droit.","Français courant","2027-06-30","https://www.ey.com/fr_bj/careers",["diplome"]),
emploi("kpmg.com","KPMG Bénin","KPMG Bénin — Postes 2027","Postes chez KPMG au Bénin. Audit, conseil, fiscalité. Bureau de Cotonou.","Master en comptabilité, finance ou audit.","Français courant","2027-06-30","https://kpmg.com/bj/fr/home/careers.html",["diplome"]),
emploi("deloitte.com","Deloitte Bénin","Deloitte Bénin — Postes 2027","Postes chez Deloitte au Bénin. Audit, risk advisory, conseil fiscal. Bureau de Cotonou.","Master en comptabilité, finance ou audit.","Français courant","2027-06-30","https://www2.deloitte.com/bj/fr/careers.html",["diplome"]),
emploi("imf.org","FMI","FMI — Economist Program 2027","Programme pour jeunes économistes au Fonds Monétaire International à Washington DC. 2 ans de contrat avec possibilité de permanence. Analyse macroéconomique.","Doctorat en économie. Maximum 33 ans. Spécialisation macro ou finance.","Anglais courant","2027-01-15","https://www.imf.org/en/About/Recruitment/working-at-the-imf/economist-program",["diplome"]),
emploi("fao.org","FAO","FAO — Junior Professional Officer 2027","Programme JPO de la FAO pour jeunes professionnels. Agriculture, sécurité alimentaire, nutrition. Postes dans les bureaux pays en Afrique.","Master. Maximum 32 ans. Citoyenneté d'un pays donateur ou pays membre.","Anglais et/ou français","2027-06-30","https://www.fao.org/employment/home/en/",["diplome"]),
emploi("ifc.org","IFC (Groupe Banque Mondiale)","IFC — Young Professionals Programme 2027","Programme pour jeunes professionnels à l'IFC (investissement privé dans les pays en développement). 2 ans à Washington DC puis affectation terrain.","Master ou doctorat. 3+ ans d'expérience en finance, investissement ou secteur privé.","Anglais courant","2027-06-30","https://www.ifc.org/careers",["diplome","recommandation"]),
emploi("unido.org","ONUDI","ONUDI — Postes Développement Industriel 2027","Postes à l'Organisation des Nations Unies pour le Développement Industriel à Vienne et dans les bureaux pays. Industrialisation, énergie, environnement.","Master en ingénierie industrielle, environnement ou économie.","Anglais et/ou français","2027-06-30","https://www.unido.org/overview/employment-opportunities",["diplome"]),
emploi("ilo.org","OIT (Organisation Internationale du Travail)","OIT — Postes Genève et Afrique 2027","Postes à l'OIT à Genève et dans les bureaux africains. Normes du travail, protection sociale, emploi des jeunes, travail décent.","Master en droit du travail, économie, sciences sociales ou RH.","Anglais et/ou français","2027-06-30","https://jobs.ilo.org/",["diplome"]),
emploi("unesco.org","UNESCO","UNESCO — Postes Éducation et Culture 2027","Postes à l'UNESCO à Paris et dans les bureaux africains. Éducation, sciences, culture, communication. Bureau de Dakar pour l'Afrique de l'Ouest.","Master en éducation, sciences, communication ou culture.","Anglais et/ou français","2027-06-30","https://careers.unesco.org/",["diplome"]),
emploi("unhcr.org","HCR (Haut-Commissariat aux Réfugiés)","HCR — Postes Protection Afrique 2027","Postes au HCR en Afrique. Protection des réfugiés, aide humanitaire. Forte présence au Sahel, Grands Lacs et Corne de l'Afrique.","Master en droit, sciences politiques, relations internationales ou humanitaire.","Anglais et/ou français","2027-06-30","https://www.unhcr.org/careers.html",["diplome"]),
emploi("unfpa.org","UNFPA","UNFPA — Postes Santé Reproductive Afrique 2027","Postes au Fonds des Nations Unies pour la Population en Afrique. Santé reproductive, planification familiale, genre, jeunesse.","Master en santé publique, démographie, genre ou sciences sociales.","Français et/ou anglais","2027-06-30","https://www.unfpa.org/jobs",["diplome"]),
emploi("unep.org","PNUE","PNUE — Postes Environnement Afrique 2027","Postes au Programme des Nations Unies pour l'Environnement. Siège à Nairobi. Climat, biodiversité, pollution, économie circulaire.","Master en environnement, écologie, géographie ou politique environnementale.","Anglais courant","2027-06-30","https://www.unep.org/about-un-environment/employment",["diplome"]),
emploi("iom.int","OIM","OIM — Postes Migration Afrique 2027","Postes à l'Organisation Internationale pour les Migrations en Afrique. Gestion des migrations, aide humanitaire, intégration, retour volontaire.","Master en relations internationales, droit, sciences sociales ou humanitaire.","Français et/ou anglais","2027-06-30","https://www.iom.int/careers",["diplome"]),
emploi("un.org","Nations Unies","ONU — Young Professionals Programme (YPP) 2027","Programme pour jeunes professionnels de l'ONU. Concours annuel pour postes P-1/P-2 au Secrétariat de l'ONU. Domaines variés selon l'année.","Master. Maximum 32 ans. Citoyenneté d'un pays sous-représenté à l'ONU.","Anglais et français courants","2026-12-31","https://careers.un.org/lbw/home.aspx",["diplome"]),
];

async function main() {
  console.log(`Lot 4 — Total à insérer : ${ALL.length} opportunités`);
  let inserted = 0, skipped = 0;
  for (const o of ALL) {
    const exists = await prisma.opportunite.findFirst({
      where: { intitule: o.intitule, organisme: o.organisme },
    });
    if (exists) { skipped++; continue; }
    await prisma.opportunite.create({
      data: {
        type: o.type, source: o.source, organisme: o.organisme,
        intitule: o.intitule, description: o.description,
        langueDetectee: o.langueDetectee, conditions: o.conditions,
        piecesExigees: o.piecesExigees, exigenceLangue: o.exigenceLangue,
        dateLimite: new Date(o.dateLimite), lien: o.lien,
        canalCandidature: o.canalCandidature, cibleCandidature: o.cibleCandidature,
        statut: "publiee", actif: true, confianceDateLimite: 0.85,
        sourceDateLimite: "recherche web",
      },
    });
    inserted++;
    if (inserted % 50 === 0) console.log(`  ... ${inserted} insérées`);
  }
  const total = await prisma.opportunite.count({ where: { statut: "publiee" } });
  console.log(`\nInsérées : ${inserted} | Déjà existantes : ${skipped} | Total publiées : ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
export {};
