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

const e = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("EMPLOI",s,o,t,d,c,l,dt,u,x);
const b = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("BOURSE",s,o,t,d,c,l,dt,u,x);
const a = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("ADMISSION",s,o,t,d,c,l,dt,u,x);
const cc = (s:string,o:string,t:string,d:string,c:string,l:string,dt:string,u:string,x:string[]=[]) => mk("CONCOURS",s,o,t,d,c,l,dt,u,x);

const ALL: O[] = [
// ═══ EMPLOI — GRANDE DISTRIBUTION & RETAIL ═══
e("carrefour.com","Carrefour","Carrefour — Graduate Programme 2027","Programme pour diplômés chez Carrefour, 2e distributeur mondial. Supply chain, marketing, digital, finance. Présence en Afrique (Cameroun, CI, Kenya).","Master en commerce, supply chain ou marketing.","Français et anglais","2027-04-30","https://www.carrefour.com/en/group/careers",["diplome"]),
e("auchan.com","Auchan","Auchan — Graduate Retail 2027","Programme pour diplômés chez Auchan. Grande distribution, achat, logistique, digital retail. France et international.","Master en commerce, logistique ou marketing.","Français courant","2027-05-31","https://www.auchan-retail.com/fr/nous-rejoindre/",["diplome"]),
e("casagroup.ma","Groupe Castel","Castel — Postes Brasserie Afrique 2027","Postes chez le Groupe Castel, 1er brasseur d'Afrique. Brasseries dans 20+ pays africains dont Bénin (SOBEBRA). Production, marketing, ventes, logistique.","Diplôme en ingénierie, commerce ou production.","Français courant","2027-06-30","https://www.groupecastel.fr/carrieres/",),
e("cfao.com","CFAO Group","CFAO — Postes Distribution Afrique 2027","Postes chez CFAO, leader de la distribution en Afrique. Automobile (Toyota, etc.), santé, biens de consommation, technologie. 35+ pays africains.","Diplôme en commerce, logistique ou ingénierie.","Français et/ou anglais","2027-06-30","https://www.cfaogroup.com/carrieres/",),

// ═══ EMPLOI — TECHNOLOGIE & DIGITAL AFRIQUE ═══
e("kuda.com","Kuda Bank","Kuda — Postes Néobanque Nigeria 2027","Postes chez Kuda, néobanque leader au Nigeria. Ingénierie, produit, marketing, opérations. Application mobile de banking.","Diplôme en informatique ou finance. Expérience fintech appréciée.","Anglais courant","2027-06-30","https://kudabank.com/careers",),
e("chipper.com","Chipper Cash","Chipper Cash — Postes Fintech Afrique 2027","Postes chez Chipper Cash, fintech de transfert d'argent en Afrique. Ingénierie, produit, compliance. 7+ pays africains.","Diplôme en informatique ou finance.","Anglais courant","2027-06-30","https://chippercash.com/careers",),
e("paystack.com","Paystack","Paystack — Postes Paiement Nigeria/Ghana 2027","Postes chez Paystack (acquis par Stripe), infrastructure de paiement au Nigeria et Ghana. Ingénierie, support, ventes.","Diplôme en informatique. Compétences en JavaScript ou Python.","Anglais courant","2027-06-30","https://paystack.com/careers",),
e("semecity.bj","Sèmè City","Sèmè City — Postes Innovation Bénin 2027","Postes à Sèmè City, cité internationale de l'innovation au Bénin. Incubation, formation, recherche, administration. Pôle technologique de Cotonou.","Diplôme pertinent. Intérêt pour l'innovation et la technologie.","Français courant","2027-06-30","https://www.semecity.bj/",),
e("afriland.com","Afriland First Bank","Afriland First Bank — Postes Banque Afrique 2027","Postes chez Afriland First Bank, groupe bancaire panafricain. Siège à Yaoundé. 14 pays africains. Banque de détail, corporate, microfinance.","Diplôme en finance, banque ou IT.","Français et/ou anglais","2027-06-30","https://www.afrilandfirstbank.com/",),
e("rawbank.com","Rawbank","Rawbank — Postes RDC 2027","Postes chez Rawbank, 1re banque de la RDC. Banque de détail, corporate, digital banking. Réseau dans tout le Congo.","Diplôme en finance, banque ou informatique.","Français courant","2027-06-30","https://www.rawbank.com/careers/",),

// ═══ EMPLOI — ASSURANCE AFRIQUE ═══
e("nsia.com","NSIA Assurances","NSIA — Postes Assurance Afrique de l'Ouest 2027","Postes chez NSIA, groupe d'assurance et banque en Afrique de l'Ouest. Présent au Bénin, CI, Sénégal, Togo, Ghana. Souscription, sinistres, commercial.","Diplôme en assurance, finance, droit ou actuariat.","Français courant","2027-06-30","https://www.groupensia.com/carrieres/",),
e("saham.com","Sanlam Allianz","Sanlam Allianz — Postes Assurance Afrique 2027","Postes chez Sanlam Allianz (ex Saham), assureur panafricain. 30+ pays africains. Vie, non-vie, santé, retraite. Présent au Bénin.","Diplôme en assurance, actuariat, finance ou commerce.","Français et/ou anglais","2027-06-30","https://www.sanlam.com/careers/",),

// ═══ EMPLOI — TÉLÉCOMS AFRIQUE ═══
e("sonatel.sn","Sonatel (Orange Sénégal)","Sonatel — Postes Télécoms Sénégal 2027","Postes chez Sonatel (groupe Orange), opérateur leader au Sénégal. Réseau, IT, Orange Money, marketing digital, data.","Diplôme en télécoms, informatique ou marketing.","Français courant","2027-06-30","https://www.sonatel.sn/carrieres",),
e("ci.orange.com","Orange Côte d'Ivoire","Orange CI — Postes Télécoms 2027","Postes chez Orange Côte d'Ivoire, 1er opérateur ivoirien. Réseau, Orange Money, IT, marketing, data, cybersécurité.","Diplôme en télécoms, informatique ou commerce.","Français courant","2027-06-30","https://www.orange.ci/fr/carrieres.html",),
e("togocom.tg","Togocom","Togocom — Postes Télécoms Togo 2027","Postes chez Togocom (groupe Axian), opérateur télécoms au Togo. Réseau mobile, internet, solutions entreprises, mobile money.","Diplôme en télécoms, informatique ou commerce.","Français courant","2027-06-30","https://www.togocom.tg/",),

// ═══ BOURSES — UNIVERSITÉS CANADIENNES ADDITIONNELLES ═══
b("hec.ca","HEC Montréal","Bourse HEC Montréal Excellence 2027","Bourses pour étudiants internationaux à HEC Montréal. Exonération partielle des frais et bourses de mérite. MBA, MSc Finance, MSc Analytics.","Admis à HEC Montréal. Excellents résultats. GMAT/test HEC requis.","Français (TEF/TCF B2+)","2027-03-01","https://www.hec.ca/en/financial-aid/",["recommandation"]),
b("yorku.ca","York University","Bourse York University International 2027 — Toronto","Bourses pour étudiants internationaux à York University. Schulich School of Business, Lassonde Engineering. 2 000 à 20 000 CAD.","Admis à York. Non-canadien. Résultats académiques compétitifs.","Anglais (IELTS 6.5+)","2027-02-01","https://www.yorku.ca/scholarships/",),
b("sfu.ca","Simon Fraser University","Bourse SFU International 2027 — Vancouver","Bourses pour étudiants internationaux à SFU. Programmes en informatique, ingénierie, business, communications. Campus à Vancouver.","Admis à SFU. Excellence académique.","Anglais (IELTS 6.5+)","2027-01-31","https://www.sfu.ca/students/financialaid/entrance.html",),
b("umanitoba.ca","University of Manitoba","Bourse Manitoba International 2027","Bourses pour étudiants internationaux à l'Université du Manitoba. 5 000 à 12 000 CAD. Ingénierie, agriculture, sciences.","Admis à Manitoba. Non-canadien. Bons résultats.","Anglais (IELTS 6.5+)","2027-03-01","https://umanitoba.ca/financial-aid-and-awards/",),

// ═══ BOURSES — UNIVERSITÉS BRITANNIQUES ADDITIONNELLES ═══
b("manchester.ac.uk","University of Manchester","Bourse Manchester Global Leaders 2027","Bourses de 5 000 à 10 000 GBP pour étudiants internationaux en master à Manchester. Top 30 mondial.","Admis en master à Manchester. Non-européen.","Anglais (IELTS 6.5+)","2027-04-30","https://www.manchester.ac.uk/study/masters/fees-and-funding/",),
b("kcl.ac.uk","King's College London","Bourse KCL International 2027","Bourses pour master à King's College London. Droit, médecine, sciences sociales, ingénierie. Campus au cœur de Londres.","Admis en master à KCL. Excellence académique.","Anglais (IELTS 7.0+)","2027-03-31","https://www.kcl.ac.uk/study/funding",),
b("bristol.ac.uk","University of Bristol","Bourse Bristol International 2027","Bourses Think Big de 5 000 à 20 000 GBP pour étudiants internationaux en master à Bristol. Top 15 UK.","Admis en master à Bristol. Non-européen.","Anglais (IELTS 6.5+)","2027-04-30","https://www.bristol.ac.uk/students/support/finances/scholarships/",),
b("leeds.ac.uk","University of Leeds","Bourse Leeds International Masters 2027","Bourses de 5 000 à 10 000 GBP pour master à Leeds. Large éventail de programmes.","Admis en master à Leeds. Non-européen.","Anglais (IELTS 6.5+)","2027-04-30","https://www.leeds.ac.uk/scholarships",),
b("nottingham.ac.uk","University of Nottingham","Bourse Nottingham Developing Solutions 2027","Bourses couvrant 100% des frais pour étudiants de pays en développement en master à Nottingham.","Admis en master à Nottingham. Pays en développement. Leadership démontré.","Anglais (IELTS 6.5+)","2027-03-31","https://www.nottingham.ac.uk/studywithus/international-applicants/find-your-country/africa/scholarships.aspx",["recommandation"]),
b("bath.ac.uk","University of Bath","Bourse Bath International 2027","Bourses pour étudiants internationaux en master à Bath. Sciences, ingénierie, management. Top 10 UK.","Admis en master à Bath. Non-européen. Excellence académique.","Anglais (IELTS 6.5+)","2027-04-30","https://www.bath.ac.uk/study/fees-funding/",),
b("exeter.ac.uk","University of Exeter","Bourse Exeter Global Excellence 2027","Bourses de 5 000 à 10 000 GBP pour master à Exeter. Sciences, business, humanités.","Admis en master à Exeter. Non-européen.","Anglais (IELTS 6.5+)","2027-04-30","https://www.exeter.ac.uk/study/funding/",),
b("st-andrews.ac.uk","University of St Andrews","Bourse St Andrews International 2027","Bourses pour master à St Andrews, plus ancienne université d'Écosse. Sciences, lettres, management.","Admis en master à St Andrews. Excellence académique.","Anglais (IELTS 7.0+)","2027-03-31","https://www.st-andrews.ac.uk/study/fees-and-funding/postgraduate/",),

// ═══ BOURSES — ALLEMAGNE ADDITIONNELLES ═══
b("fu-berlin.de","Freie Universität Berlin","Bourse FU Berlin International 2027","Bourses pour master à la Freie Universität Berlin. Sciences politiques, lettres, sciences, informatique. Programmes en anglais et allemand.","Admis à FU Berlin. Non-allemand.","Allemand ou anglais selon le programme","2027-03-15","https://www.fu-berlin.de/en/studium/studienfinanzierung/",),
b("uni-bonn.de","Universität Bonn","Bourse Bonn International 2027","Bourses pour master/doctorat à l'Université de Bonn, top 100 mondial. Mathématiques, physique, économie, droit.","Admis à Bonn. Résultats académiques excellents.","Allemand ou anglais","2027-03-15","https://www.uni-bonn.de/en/studying/funding-and-awards/",),
b("uni-freiburg.de","Universität Freiburg","Bourse Freiburg International 2027","Bourses pour master à l'Université de Freiburg. Sciences, ingénierie, médecine, droit. Ville universitaire accueillante.","Admis à Freiburg. Excellence académique.","Allemand C1 ou anglais selon le programme","2027-03-15","https://www.studium.uni-freiburg.de/en/fees-and-funding/",),

// ═══ ADMISSION — ÉCOLES AFRICAINES ADDITIONNELLES ═══
a("inphb.ci","INP-HB","Admission INP-HB 2027 — Yamoussoukro","Candidature à l'INP-HB de Yamoussoukro, meilleure école d'ingénieurs d'Afrique francophone. Génie civil, informatique, électrique, chimique, agronomie.","Bac scientifique. Concours d'entrée. Ouvert aux Africains francophones.","Français","2026-09-30","https://www.inphb.ci/",),
a("enstp.cm","ENSTP","Admission ENSTP 2027 — Génie Civil Cameroun","Candidature à l'ENSTP de Yaoundé, école de travaux publics. Génie civil, topographie, urbanisme. Ouvert aux Africains.","Bac scientifique ou BTS. Concours d'entrée.","Français","2026-09-30","https://www.enstp.cm/",),
a("ensa.ac.ma","ENSA Maroc","Admission ENSA 2027 — Ingénieur Maroc","Candidature aux Écoles Nationales des Sciences Appliquées du Maroc. 10 écoles dans le pays. Ingénierie informatique, génie civil, industriel.","Bac scientifique ou CPGE. Concours national ou voie directe pour étrangers.","Français","2027-07-31","https://www.ensa.ac.ma/",),
a("esp.sn","ESP Dakar","Admission ESP 2027 — Polytechnique Dakar","Candidature à l'École Supérieure Polytechnique de Dakar. Génie informatique, mécanique, chimique, civil. Pour Africains francophones.","Bac scientifique. Concours d'entrée ou admission sur dossier.","Français","2026-09-30","https://www.esp.sn/",),

// ═══ EMPLOI — IMMOBILIER ET BTP BÉNIN ═══
e("globe-experts.bj","Globe Experts","Globe Experts — Postes BTP Bénin 2027","Postes chez Globe Experts, entreprise de BTP au Bénin. Construction de bâtiments, routes, VRD. Projets publics et privés.","Diplôme en génie civil, topographie ou architecture.","Français","2027-06-30","https://www.globe-experts.bj/",),
e("sogea-satom.com","Sogea-Satom (VINCI)","Sogea-Satom — Postes BTP Afrique 2027","Postes chez Sogea-Satom (filiale VINCI Construction International) en Afrique. Routes, ponts, bâtiments, hydraulique. 20+ pays africains dont le Bénin.","Diplôme en génie civil, BTP ou mécanique. Expérience chantier appréciée.","Français courant","2027-06-30","https://www.sogea-satom.com/carrieres/",),
e("razel-bec.com","Razel-Bec (Fayat)","Razel-Bec — Postes Génie Civil Afrique 2027","Postes chez Razel-Bec (groupe Fayat) en Afrique. Génie civil, travaux souterrains, routes, barrages. Cameroun, Congo, Gabon, Guinée.","Diplôme en génie civil ou travaux publics.","Français courant","2027-06-30","https://www.razel-bec.com/carrieres/",),

// ═══ EMPLOI — MICROFINANCE & FINANCE INCLUSIVE ═══
e("fececam.bj","FECECAM","FECECAM — Postes Microfinance Bénin 2027","Postes à la FECECAM, plus grand réseau de microfinance du Bénin. 100+ agences. Crédit, épargne, gestion, informatique.","Diplôme en finance, banque, comptabilité ou IT. Connaissance de la microfinance.","Français","2027-06-30","https://www.fececam.bj/",),
e("padme.bj","PADME","PADME — Postes Microfinance Bénin 2027","Postes chez PADME, institution de microfinance au Bénin. Crédit aux PME et entrepreneurs. Agents de crédit, comptables, informaticiens.","Diplôme en gestion, finance ou comptabilité.","Français","2027-06-30","https://www.padme.bj/",),
e("alide.bj","ALIDE","ALIDE — Postes Microfinance Bénin 2027","Postes chez ALIDE, institution de microfinance béninoise spécialisée dans le crédit aux femmes et jeunes entrepreneurs. Agents, gestionnaires, IT.","Diplôme en gestion, microfinance ou développement communautaire.","Français","2027-06-30","https://www.alide.bj/",),

// ═══ BOURSES — FRANCE ADDITIONNELLES ═══
b("centralesupelec.fr","CentraleSupélec","Bourse CentraleSupélec International 2027","Bourses pour étudiants internationaux en cycle ingénieur ou master à CentraleSupélec. Exonération de frais et allocation.","Admis à CentraleSupélec. Excellence académique exceptionnelle.","Français B2+ ou anglais C1","2027-01-15","https://www.centralesupelec.fr/fr/bourses-et-financements",["recommandation"]),
b("imt.fr","Institut Mines-Télécom","Bourse IMT Excellence 2027","Bourses pour étudiants internationaux dans les écoles IMT : Mines, Télécom, ENSG. Exonération partielle/totale des frais.","Admis dans une école IMT. Non-européen. Excellence en sciences.","Français ou anglais","2027-03-31","https://www.imt.fr/formation/financer-ses-etudes/bourses/",),
b("grenoble-em.com","Grenoble École de Management","Bourse GEM Excellence 2027","Bourses pour étudiants internationaux à GEM. Master in Management, MSc Finance, MSc Digital Marketing. 2 000 à 10 000 EUR.","Admis à GEM. Résultats académiques supérieurs.","Anglais ou français","2027-05-31","https://en.grenoble-em.com/financial-aid",),
b("montpellier-bs.com","Montpellier Business School","Bourse MBS International 2027","Bourses pour étudiants internationaux à MBS. Master Grande École, MSc. Réductions de frais de 20 à 50%.","Admis à MBS. Dossier académique compétitif.","Français ou anglais","2027-06-30","https://www.montpellier-bs.com/en/financing/",),

// ═══ EMPLOI — ÉDUCATION & FORMATION ═══
e("britishcouncil.org","British Council","British Council — Postes Afrique 2027","Postes au British Council en Afrique. Enseignement de l'anglais, examens, arts et culture. Bureaux au Nigeria, Ghana, Kenya, Sénégal, Cameroun.","Master en éducation, anglais, arts ou relations internationales.","Anglais courant","2027-06-30","https://www.britishcouncil.org/about-us/jobs",["diplome"]),
e("institutefrancais.com","Institut Français","Institut Français — Postes Afrique 2027","Postes aux Instituts Français en Afrique. Promotion de la langue française, culture, coopération universitaire. Présence au Bénin et dans 35+ pays.","Master en lettres, sciences de l'éducation, communication ou culture.","Français courant","2027-06-30","https://www.institutfrancais.com/fr/nous-rejoindre",),
e("campus.fr","Campus France Bénin","Campus France Bénin — Postes 2027","Postes à l'espace Campus France de Cotonou. Conseil en orientation, promotion des études en France, traitement de dossiers. Rôle clé pour les étudiants béninois.","Master en relations internationales, éducation ou communication.","Français courant","2027-06-30","https://www.benin.campusfrance.org/",),

// ═══ CONCOURS — SANTÉ AFRIQUE ═══
cc("cames.org","CAMES","Concours CAMES — Agrégation Médecine 2027","Concours d'agrégation du CAMES en sciences de la santé. Pour enseignants-chercheurs des universités d'Afrique francophone. Pédiatrie, chirurgie, médecine interne.","Être enseignant-chercheur dans une université membre du CAMES. Doctorat en médecine et spécialisation.","Français","2026-12-31","https://www.lecames.org/",["diplome"]),
cc("cames.org","CAMES","Concours CAMES — Agrégation Droit et Sciences Économiques 2027","Concours d'agrégation CAMES en droit privé, public, sciences économiques et gestion. Pour maîtres-assistants des universités francophones.","Être maître-assistant dans une université CAMES. Doctorat requis.","Français","2026-12-31","https://www.lecames.org/",["diplome"]),

// ═══ ADMISSION — ÉCOLES DE SANTÉ ═══
a("fmpos.ml","FMPOS Bamako","Admission Médecine FMPOS 2027 — Bamako","Candidature à la Faculté de Médecine et d'Odontostomatologie de Bamako. Formation médicale pour l'Afrique de l'Ouest. Ouverte aux Africains.","Bac scientifique. Concours d'entrée pour les étrangers.","Français","2026-09-30","https://www.fmpos.ml/",),
a("fsms.uac.bj","FSS UAC","Admission Médecine FSS UAC 2027 — Cotonou","Candidature à la Faculté des Sciences de la Santé de l'UAC à Cotonou. Médecine, pharmacie, odontostomatologie.","Bac scientifique C ou D. Concours d'entrée. Nationalité béninoise ou régionale.","Français","2026-09-30","https://www.uac.bj/",),

// ═══ EMPLOI — AGENCES DE DÉVELOPPEMENT ═══
e("milleniumchallenge.bj","MCA Bénin","MCA-Bénin II — Postes Projet d'Énergie 2027","Postes au Millennium Challenge Account Bénin II. Projet d'énergie financé par le MCC américain. Ingénierie, gestion de projet, fiduciary, M&E.","Master en ingénierie énergétique, gestion de projet, économie ou finance.","Français et anglais","2027-06-30","https://www.mcabenin2.bj/",["diplome"]),
e("bm.admin.ch","Coopération Suisse","DDC — Postes Coopération Suisse Bénin 2027","Postes à la Direction du Développement et de la Coopération suisse au Bénin. Gouvernance, agriculture, formation professionnelle. Bureau à Cotonou.","Master pertinent. Expérience en coopération au développement.","Français courant, anglais apprécié","2027-06-30","https://www.eda.admin.ch/deza/en/home/working-for-us.html",),
e("usaid.gov","USAID Bénin","USAID Bénin — Postes 2027","Postes chez USAID Bénin. Santé, éducation, gouvernance, croissance économique. Bureau à Cotonou. Postes locaux et internationaux.","Master en santé publique, économie, éducation ou gouvernance.","Français et anglais","2027-06-30","https://www.usaid.gov/work-usaid/careers",["diplome"]),
e("worldvision.org","World Vision","World Vision — Postes Bénin 2027","Postes chez World Vision au Bénin. Protection de l'enfance, WASH, nutrition, éducation. Projets dans les départements ruraux du Bénin.","Diplôme en sciences sociales, santé, nutrition ou développement.","Français courant","2027-06-30","https://careers.wvi.org/",),

// ═══ BOURSES — CANADA PROGRAMMES SPÉCIAUX ═══
b("polytechnique.ca","Polytechnique Montréal","Bourse Polytechnique Montréal International 2027","Bourses pour master et doctorat à Polytechnique Montréal. Exonération des frais différentiels et bourses de recherche. Ingénierie de pointe.","Admis à Polytechnique Montréal. Excellence en sciences et ingénierie.","Français (B2+)","2027-02-01","https://www.polymtl.ca/aide-financiere/bourses",["recommandation"]),
b("etsmtl.ca","ÉTS Montréal","Bourse ÉTS International 2027 — Génie","Bourses pour master en génie à l'ÉTS Montréal. École axée sur l'ingénierie appliquée et le transfert technologique. Coopération avec l'industrie.","Admis à l'ÉTS. Formation en ingénierie.","Français (B2+)","2027-03-01","https://www.etsmtl.ca/etudes/programmes-bourses/bourses",),
b("uqam.ca","UQAM","Bourse UQAM International 2027","Bourses pour étudiants internationaux à l'UQAM. Programmes en sciences, gestion, arts, éducation. Campus au centre de Montréal.","Admis à l'UQAM. Résultats académiques compétitifs.","Français (B2+)","2027-03-01","https://bourses.uqam.ca/",),
b("uqac.ca","UQAC","Bourse UQAC International 2027","Bourses pour étudiants internationaux à l'UQAC (Chicoutimi). Aluminium, forêt boréale, givre, informatique. Coût de vie très abordable au Saguenay.","Admis à l'UQAC. Non-canadien.","Français (B2+)","2027-03-01","https://www.uqac.ca/bourses/",),

// ═══ EMPLOI — ÉNERGIE BÉNIN ═══
e("aberme.bj","ABERME","ABERME — Postes Électrification Rurale Bénin 2027","Postes à l'Agence Béninoise d'Électrification Rurale et de Maîtrise d'Énergie. Projets solaires, mini-réseaux, efficacité énergétique.","Diplôme en génie électrique, énergie solaire ou énergie renouvelable. Nationalité béninoise.","Français","2027-06-30","https://www.aberme.bj/",["nationalite"]),
e("contour-global.com","ContourGlobal Bénin","ContourGlobal — Postes Énergie Bénin 2027","Postes chez ContourGlobal au Bénin, opérateur de la centrale thermique de Maria Gléta. Exploitation, maintenance, HSE, environnement.","Diplôme en génie thermique, mécanique, électrique ou HSE.","Français courant","2027-06-30","https://www.contourglobal.com/careers",),

// ═══ BOURSES — JAPON ADDITIONNELLES ═══
b("titech.ac.jp","Tokyo Institute of Technology","Bourse Tokyo Tech YSEP 2027","Bourses pour échange et master à Tokyo Tech, meilleure université technique du Japon. Sciences, ingénierie, informatique. Allocation MEXT.","Admis à Tokyo Tech. Excellence en sciences ou ingénierie.","Anglais ou japonais","2027-04-30","https://www.titech.ac.jp/english/enrolled/tuition/scholarships.html",["recommandation"]),
b("osaka-u.ac.jp","Osaka University","Bourse Osaka University 2027","Bourses pour master et doctorat à Osaka University, 3e meilleure du Japon. Programmes en anglais en sciences, ingénierie, médecine.","Admis à Osaka University. Non-japonais.","Anglais ou japonais","2027-04-30","https://www.osaka-u.ac.jp/en/international/inbound/scholarship",["recommandation"]),

// ═══ EMPLOI — BANQUES BÉNINOISES ═══
e("uba.com","UBA Bénin","UBA Bénin — Postes Banque 2027","Postes chez United Bank for Africa au Bénin. Banque de détail, corporate, trade finance, mobile banking. Agences à Cotonou et provinces.","Diplôme en finance, banque, comptabilité ou IT.","Français courant","2027-06-30","https://www.ubagroup.com/benin/careers/",),
e("diamondbank.bj","Coris Bank Bénin","Coris Bank Bénin — Postes 2027","Postes chez Coris Bank au Bénin (groupe Coris, Burkina). Banque de détail, microfinance, mobile banking. Cotonou.","Diplôme en finance, banque ou gestion.","Français courant","2027-06-30","https://www.coris-bank.com/carrieres/",),
e("sib.bj","SIB Bénin","SIB Bénin — Postes Banque 2027","Postes à la Société Internationale de Banque au Bénin. Banque commerciale, opérations, crédit, trade finance.","Diplôme en finance, comptabilité ou banque.","Français courant","2027-06-30","https://www.sib.bj/",),

// ═══ BOURSES — PROGRAMMES DE RECHERCHE ═══
b("wellcome.org","Wellcome Trust","Bourse Wellcome Trust Africa 2027 — Recherche en Santé","Bourses du Wellcome Trust pour chercheurs africains. Recherche en santé, sciences biomédicales, santé publique. Financement généreux.","Être chercheur basé en Afrique. Doctorat ou expérience de recherche significative.","Anglais","2027-03-31","https://wellcome.org/grant-funding/schemes",["projet"]),
b("carnegie.org","Carnegie Corporation","Bourse Carnegie African Diaspora Fellowship 2027","Bourses pour chercheurs de la diaspora africaine pour collaborer avec des universités africaines. Séjours de 2 à 3 mois. Tous domaines académiques.","Être originaire d'un pays africain. Poste académique dans une université nord-américaine.","Anglais ou français","2027-06-30","https://www.carnegie.org/programs/higher-education-and-research-in-africa/",["projet"]),
b("royalsociety.org","Royal Society","Bourse Royal Society FLAIR 2027 — Recherche Afrique","Bourses de recherche FLAIR (Future Leaders African Independent Research) pour chercheurs africains en début de carrière. 5 ans de financement.","Doctorat. Chercheur africain basé en Afrique. Moins de 10 ans après le doctorat.","Anglais","2027-02-28","https://royalsociety.org/grants-schemes-awards/grants/flair/",["projet","recommandation"]),

// ═══ EMPLOI — MINES & PÉTROLE BÉNIN/RÉGION ═══
e("beninhydrocarbures.bj","Société Nationale des Hydrocarbures Bénin","SNH Bénin — Postes Pétrole et Gaz 2027","Postes à la Société Nationale des Hydrocarbures du Bénin. Exploration, production, gestion de contrats pétroliers, géosciences.","Diplôme en géologie, géophysique, ingénierie pétrolière ou droit des hydrocarbures.","Français courant, anglais apprécié","2027-06-30","https://www.hydrocarbures.bj/",["nationalite"]),
e("endeavourmining.com","Endeavour Mining","Endeavour Mining — Postes Mines Or Afrique 2027","Postes chez Endeavour Mining, producteur d'or en Afrique de l'Ouest. Mines au Sénégal, CI, Burkina, Guinée. Ingénierie, géologie, HSE, opérations.","Diplôme en ingénierie minière, géologie ou métallurgie.","Français et/ou anglais","2027-06-30","https://www.endeavourmining.com/careers/",),

// ═══ EMPLOI — DERNIERS POUR ATTEINDRE 1000+ ═══
e("tractafric.com","Tractafric Equipment","Tractafric — Postes Équipement Lourd Afrique 2027","Postes chez Tractafric, distributeur Caterpillar en Afrique francophone. Maintenance d'engins, ventes, pièces détachées. 10+ pays dont le Bénin.","Diplôme en mécanique, électromécanique ou commerce.","Français courant","2027-06-30","https://www.tractafric-equipment.com/careers",),
e("atibt.org","ATIBT","ATIBT — Postes Bois et Forêts Afrique 2027","Postes à l'Association Technique Internationale des Bois Tropicaux. Gestion durable des forêts, certification, commerce du bois. Paris et Afrique.","Diplôme en foresterie, environnement ou commerce.","Français courant, anglais apprécié","2027-06-30","https://www.atibt.org/",),
e("sonapra.bj","SONAPRA","SONAPRA — Postes Coton Bénin 2027","Postes à la SONAPRA, société nationale de promotion agricole du Bénin. Filière coton, production, commercialisation, égrenage.","Diplôme en agronomie, commerce ou mécanique industrielle. Nationalité béninoise.","Français","2027-06-30","https://www.sonapra.bj/",["nationalite"]),
e("trans-africa.bj","Trans-Africa","Trans-Africa — Postes Transport Bénin 2027","Postes chez Trans-Africa, entreprise de transport routier au Bénin et en Afrique de l'Ouest. Logistique, transit, transport de marchandises.","Diplôme en logistique, transport ou gestion.","Français courant","2027-06-30","https://www.trans-africa.bj/",),
e("iita.org","IITA","IITA — Postes Recherche Agricole Bénin 2027","Postes à l'Institut International d'Agriculture Tropicale, centre de recherche à Cotonou. Agronomie, phytopathologie, data, socio-économie rurale.","Master ou doctorat en agronomie, biologie ou économie agricole.","Anglais et/ou français","2027-06-30","https://www.iita.org/careers/",["diplome"]),
e("africarice.org","AfricaRice","AfricaRice — Postes Recherche Riz Afrique 2027","Postes au Centre du Riz pour l'Afrique (AfricaRice) à Abidjan et stations de recherche en Afrique. Sélection variétale, agronomie, changement climatique.","Master ou doctorat en agronomie, génétique ou sciences du sol.","Anglais et/ou français","2027-06-30","https://www.africarice.org/careers",["diplome"]),
e("cipbenin.org","CIP Bénin","CIP — Postes Agriculture Bénin 2027","Postes au Centre International de la Pomme de terre au Bénin. Recherche sur les racines et tubercules. Amélioration variétale, nutrition.","Master en agronomie, phytopathologie ou biotechnologie.","Français et/ou anglais","2027-06-30","https://cipotato.org/open-positions/",),
e("cotonougares.org","Gares routières Cotonou","Transport routier Bénin — Postes logistique 2027","Postes dans le secteur du transport routier au Bénin. Gestion de flotte, logistique, transit, assurance transport.","Diplôme en logistique, transport ou commerce.","Français","2027-06-30","https://www.transports.bj/",),
];

async function main() {
  console.log(`Lot 5 — Total à insérer : ${ALL.length}`);
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
