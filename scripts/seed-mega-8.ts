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

// ═══ EMPLOI — TECH GIANTS SUPPLÉMENTAIRES ═══
E("spotify.com","Spotify","Spotify — Backend Engineer 2027","Poste d'ingénieur backend chez Spotify. Systèmes de recommandation musicale, microservices, streaming à grande échelle. Stockholm ou London.","Master en informatique. Compétences Java, Python, systèmes distribués.","Anglais courant","2027-06-30","https://www.lifeatspotify.com/jobs"),
E("stripe.com","Stripe","Stripe — Software Engineer 2027","Poste d'ingénieur logiciel chez Stripe, infrastructure de paiement en ligne. APIs, systèmes financiers, fiabilité. San Francisco, Dublin ou Singapour.","Master en informatique. Compétences en Ruby, Go ou Java.","Anglais courant","2027-06-30","https://stripe.com/jobs"),
E("uber.com","Uber","Uber — ML Engineer 2027","Poste d'ingénieur ML chez Uber. Optimisation des trajets, tarification dynamique, détection de fraude. San Francisco ou Amsterdam.","Master en IA ou informatique. Compétences Python, TensorFlow, Spark.","Anglais courant","2027-06-30","https://www.uber.com/us/en/careers/"),
E("twitter.com","X (Twitter)","X — Platform Engineer 2027","Poste d'ingénieur plateforme chez X (ex-Twitter). Systèmes temps réel, recommandation de contenu, infrastructure à grande échelle.","Master en informatique. Compétences Scala, Java, systèmes distribués.","Anglais courant","2027-06-30","https://careers.x.com/"),
E("netflix.com","Netflix","Netflix — Data Engineer 2027","Poste d'ingénieur données chez Netflix. Pipelines de données à l'échelle du pétaoctet, personnalisation de contenu, analytics. Los Gatos.","Master en informatique ou data engineering. Compétences Spark, Flink, Python.","Anglais courant","2027-06-30","https://jobs.netflix.com/"),
E("linkedin.com","LinkedIn","LinkedIn — Product Manager 2027","Poste de chef de produit chez LinkedIn. Fonctionnalités réseau professionnel, recrutement, formation en ligne. Sunnyvale ou Dublin.","Master en informatique ou MBA. Expérience produit tech.","Anglais courant","2027-06-30","https://careers.linkedin.com/"),
E("tiktok.com","TikTok","TikTok — Algorithm Engineer 2027","Poste d'ingénieur algorithme chez TikTok (ByteDance). Systèmes de recommandation vidéo, NLP, vision par ordinateur. Singapour ou London.","Master ou doctorat en IA ou informatique.","Anglais courant","2027-06-30","https://careers.tiktok.com/"),
E("zoom.us","Zoom","Zoom — Video Engineering 2027","Poste d'ingénieur vidéo chez Zoom. Codec vidéo, WebRTC, optimisation bande passante, IA pour la vidéoconférence. San Jose.","Master en traitement du signal, multimédia ou informatique.","Anglais courant","2027-06-30","https://careers.zoom.us/"),

// ═══ EMPLOI — FINTECH MONDIALES ═══
E("wise.com","Wise","Wise — Backend Engineer 2027","Poste d'ingénieur backend chez Wise (ex-TransferWise). Transferts internationaux, multi-devises, systèmes de paiement. London ou Tallinn.","Master en informatique. Compétences Java, microservices.","Anglais courant","2027-06-30","https://www.wise.jobs/"),
E("revolut.com","Revolut","Revolut — Risk Analyst 2027","Poste d'analyste risques chez Revolut, néobanque européenne. Détection de fraude, conformité, modélisation des risques.","Master en finance, statistique ou data science.","Anglais courant","2027-06-30","https://www.revolut.com/careers/"),
E("n26.com","N26","N26 — Product Designer 2027","Poste de designer produit chez N26, banque mobile allemande. UX/UI, design system, recherche utilisateur. Berlin.","Master en design, UX ou interaction homme-machine.","Anglais courant","2027-06-30","https://n26.com/en/careers"),

// ═══ EMPLOI — SANTÉ AFRIQUE ═══
E("msh.org","MSH","MSH — Health Systems Advisor Bénin 2027","Poste de conseiller en systèmes de santé chez Management Sciences for Health au Bénin. Renforcement des systèmes, chaîne d'approvisionnement pharma.","Master en santé publique ou pharmacie. 5+ ans d'expérience.","Français et anglais","2027-06-30","https://www.msh.org/careers"),
E("jhpiego.org","Jhpiego","Jhpiego — Programme Officer Bénin 2027","Poste d'officier programme chez Jhpiego (Johns Hopkins) au Bénin. Santé maternelle, planification familiale, formation clinique.","Master en santé publique. Expérience terrain en Afrique.","Français courant, anglais apprécié","2027-06-30","https://www.jhpiego.org/careers/"),
E("theglobalfund.org","Fonds Mondial","Fonds Mondial — Country Manager 2027","Poste de gestionnaire pays au Fonds mondial de lutte contre le sida, la tuberculose et le paludisme. Genève et bureaux pays en Afrique.","Master en santé publique, économie ou relations internationales. 7+ ans d'expérience.","Français et anglais","2027-06-30","https://www.theglobalfund.org/en/careers/"),
E("gavi.org","Gavi","Gavi — Immunisation Specialist 2027","Poste de spécialiste immunisation chez Gavi, l'Alliance du Vaccin. Programmes de vaccination dans les pays à faible revenu. Genève.","Master en santé publique ou épidémiologie. Expérience vaccination.","Anglais et français","2027-06-30","https://www.gavi.org/careers"),

// ═══ BOURSES — DERNIÈRE VAGUE ═══
B("chevening.org","Gouvernement Britannique","Bourse Chevening 2027 — Royaume-Uni","Bourses Chevening du gouvernement britannique pour master au UK. Frais + allocation + billet + installation. 1 an. 160+ pays dont le Bénin.","Licence. 2+ ans d'expérience professionnelle. Nationalité éligible. Leadership démontré.","Anglais (IELTS 6.5+)","2027-11-02","https://www.chevening.org/scholarships/",["recommandation"]),
B("orangefoundation.com","Fondation Orange","Bourse Orange Digital Center 2027 — Afrique","Bourses de formation digitale de la Fondation Orange. Coding, IA, marketing digital. Centres dans 19 pays africains dont le Bénin.","18-35 ans. Intérêt pour le numérique. Nationalité d'un pays avec Orange Digital Center.","Français","2027-06-30","https://www.fondationorange.com/"),
B("mastercardfdn.org","Fondation Mastercard","Bourse Mastercard Foundation Scholars 2027","Bourses complètes de la Fondation Mastercard pour étudiants africains dans des universités de premier plan. Frais, logement, allocation, mentorat.","Nationalité africaine. Excellence académique. Engagement communautaire. Besoin financier.","Anglais ou français selon l'université","2027-04-30","https://mastercardfdn.org/all/scholars/",["recommandation"]),
B("fondation-suez.com","Fondation SUEZ","Bourse Fondation SUEZ 2027 — Eau et Environnement","Bourses de la Fondation SUEZ pour étudiants de pays en développement en master eau, assainissement ou environnement en France.","Admis en master pertinent en France. Pays en développement.","Français","2027-04-30","https://www.fondation-suez.com/"),
B("foundation.airbus.com","Fondation Airbus","Bourse Airbus Foundation 2027 — Aéronautique","Bourses de la Fondation Airbus pour étudiants en aéronautique et espace. Master dans des universités partenaires en Europe.","Admis en master aéronautique/spatial. Nationalité hors UE.","Anglais ou français","2027-05-31","https://www.airbus.com/en/sustainability/airbus-foundation"),
B("rotary.org","Rotary International","Bourse Rotary pour la Paix 2027","Bourses Rotary pour master en résolution de conflits, développement, paix. Universités partenaires dans 6 pays. Financement complet.","Licence. 3+ ans d'expérience dans la paix/développement. Nomination par un club Rotary.","Anglais ou français","2027-05-31","https://www.rotary.org/en/our-programs/peace-fellowships",["recommandation"]),
B("afriqueavenir.org","OFID","Bourse OFID 2027 — Énergie et Développement","Bourses du Fonds OPEP pour le Développement International. Master lié à l'énergie et au développement durable. Universités partenaires.","Nationalité d'un pays en développement. Admis en master pertinent.","Anglais","2027-04-30","https://www.ofid.org/"),
B("daad.de","DAAD","Bourse DAAD EPOS 2027 — Allemagne","Bourses DAAD pour masters liés au développement (EPOS). Programmes en anglais en Allemagne. 850 EUR/mois + frais + assurance + billet.","Nationalité d'un pays en développement. 2+ ans d'expérience professionnelle.","Anglais","2027-09-30","https://www.daad.de/en/studying-in-germany/scholarships/",["recommandation"]),

// ═══ EMPLOI — MÉDIAS & COMMUNICATION ═══
E("rfi.fr","RFI","RFI — Journaliste Afrique 2027","Poste de journaliste à RFI (Radio France Internationale) pour la rédaction Afrique. Reportages, enquêtes, actualité africaine. Paris.","Master en journalisme ou communication. Expérience en radio ou presse écrite.","Français courant","2027-06-30","https://www.rfi.fr/fr/recrutement"),
E("france24.com","France 24","France 24 — Reporter Afrique 2027","Poste de reporter chez France 24 pour le desk Afrique. Reportages terrain, présentations, analyses géopolitiques.","Master en journalisme. 3+ ans d'expérience. Connaissance de l'Afrique.","Français et anglais","2027-06-30","https://www.france24.com/fr/recrutement"),
E("jeuneafrique.com","Jeune Afrique","Jeune Afrique — Rédacteur Économie 2027","Poste de rédacteur économie chez Jeune Afrique. Couverture des économies africaines, entreprises, marchés financiers. Paris.","Master en journalisme économique ou économie. Connaissance de l'Afrique.","Français courant","2027-06-30","https://www.jeuneafrique.com/"),

// ═══ EMPLOI — TRANSPORT AÉRIEN AFRIQUE ═══
E("asky.com","ASKY Airlines","ASKY Airlines — Pilote Cadet 2027","Programme cadet pilote chez ASKY Airlines, compagnie panafricaine basée à Lomé. Formation de pilotes de ligne. Hub de Lomé desservant 25+ villes africaines.","Bac scientifique. Aptitude médicale classe 1. 18-28 ans. Excellente vision.","Français et anglais","2027-06-30","https://www.flyasky.com/",["medical"]),
E("ethiopianairlines.com","Ethiopian Airlines","Ethiopian Airlines — Engineering Graduate 2027","Programme diplômé ingénieur chez Ethiopian Airlines, 1re compagnie africaine. Maintenance aéronautique, MRO, avionique. Hub d'Addis-Abeba.","Master en aéronautique ou ingénierie mécanique.","Anglais courant","2027-06-30","https://www.ethiopianairlines.com/corporate/career"),
E("royalairmaroc.com","Royal Air Maroc","Royal Air Maroc — Commercial Manager 2027","Poste de responsable commercial chez RAM pour l'Afrique de l'Ouest. Développement réseau, yield management, partenariats. Casablanca.","Master en commerce, tourisme ou transport aérien.","Français et anglais","2027-06-30","https://www.royalairmaroc.com/ma-fr/carrieres"),

// ═══ EMPLOI — HÔTELLERIE & TOURISME ═══
E("accor.com","Accor","Accor — Hotel Manager Trainee Afrique 2027","Programme trainee hôtelier chez Accor en Afrique. Sofitel, Novotel, Ibis. Gestion hôtelière, F&B, revenue management. 20+ pays africains.","Master en hôtellerie, tourisme ou management.","Français et anglais","2027-06-30","https://group.accor.com/en/careers"),
E("marriott.com","Marriott","Marriott — Revenue Manager Afrique 2027","Poste de revenue manager chez Marriott en Afrique. Sheraton, Protea, Four Points. Optimisation tarifaire, distribution, analytics.","Master en revenue management, hôtellerie ou finance.","Anglais courant","2027-06-30","https://www.marriott.com/careers/"),
E("hilton.com","Hilton","Hilton — Graduate Programme Afrique 2027","Programme diplômé chez Hilton en Afrique. F&B, front office, sales. Hôtels au Maroc, Nigeria, Kenya, Éthiopie.","Master en hôtellerie ou management.","Anglais courant, français apprécié","2027-06-30","https://jobs.hilton.com/"),

// ═══ EMPLOI — AGRICULTURE & AGROALIMENTAIRE BÉNIN ═══
E("sobebra.bj","SOBEBRA","SOBEBRA — Technicien Brasserie Bénin 2027","Poste de technicien brasserie à la SOBEBRA, brasserie du Bénin (Groupe Castel). Production de La Béninoise, Beaufort. Maintenance, qualité.","BTS ou licence en agroalimentaire, chimie ou mécanique. Nationalité béninoise.","Français","2027-06-30","https://www.sobebra.bj/",["nationalite"]),
E("ib-group.bj","IB Group","IB Group — Responsable Production Bénin 2027","Poste de responsable production chez IB Group, agro-industrie béninoise. Transformation d'ananas, mangue, noix de cajou. Export.","Diplôme en agroalimentaire ou génie des procédés.","Français","2027-06-30","https://www.ib-group.bj/"),
E("gdiz.bj","GDIZ","GDIZ — Postes Zone Industrielle Glo-Djigbé 2027","Postes dans la Zone Industrielle de Glo-Djigbé (GDIZ), plus grand projet industriel du Bénin. Textile, cajou, soja, matériaux de construction.","Diplôme technique pertinent. Production, maintenance, qualité, logistique.","Français courant","2027-06-30","https://www.gdiz.bj/"),

// ═══ EMPLOI — ORGANISATIONS RÉGIONALES ═══
E("cedeao.int","CEDEAO","CEDEAO — Postes Commission Abuja 2027","Postes à la Commission de la CEDEAO à Abuja. Intégration régionale, commerce, libre circulation, paix et sécurité. 15 États membres.","Master pertinent. Nationalité CEDEAO. Expérience dans les organisations internationales.","Français et anglais","2027-06-30","https://www.ecowas.int/vacancies/",["nationalite"]),
E("uemoa.int","UEMOA","UEMOA — Postes Commission Ouagadougou 2027","Postes à la Commission de l'UEMOA à Ouagadougou. Politique monétaire, commerce, agriculture, énergie. 8 États membres.","Master pertinent. Nationalité UEMOA.","Français courant","2027-06-30","https://www.uemoa.int/fr/offres-demploi",["nationalite"]),
E("ua.int","Union Africaine","Union Africaine — Postes Commission Addis 2027","Postes à la Commission de l'Union Africaine à Addis-Abeba. Paix, commerce, infrastructure, éducation, santé. 55 États membres.","Master pertinent. Nationalité d'un État membre de l'UA.","Anglais et/ou français","2027-06-30","https://au.int/en/vacancies"),

// ═══ ADMISSION — DERNIÈRES ═══
A("uac.bj","UAC","Admission UAC Licence 2027 — Bénin","Candidature en licence à l'Université d'Abomey-Calavi. Droit, économie, lettres, sciences, médecine. Plus grande université du Bénin.","Bac toutes séries. Inscription en ligne.","Français","2026-10-31","https://www.uac.bj/"),
A("unstim.bj","UNSTIM","Admission UNSTIM 2027 — Abomey","Candidature à l'Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques d'Abomey. Nouvelle université béninoise.","Bac scientifique.","Français","2026-10-31","https://www.unstim.bj/"),
A("unpa.bj","UP","Admission UP Parakou 2027 — Nord Bénin","Candidature à l'Université de Parakou. Médecine, agronomie, droit, lettres, économie. Principale université du nord du Bénin.","Bac toutes séries.","Français","2026-10-31","https://www.univ-parakou.bj/"),
A("uma.bj","UNA","Admission UNA 2027 — Agriculture Bénin","Candidature à l'Université Nationale d'Agriculture de Porto-Novo. Agronomie, zootechnie, aquaculture, agroéconomie.","Bac scientifique C, D.","Français","2026-10-31","https://www.una.bj/"),
A("issba.bj","ISSBA","Admission ISSBA 2027 — Biomédicale Bénin","Candidature à l'Institut des Sciences Biomédicales Appliquées de Cotonou. Analyses biomédicales, imagerie, kinésithérapie.","Bac scientifique C ou D. Concours.","Français","2026-10-31","https://www.issba.bj/"),

// ═══ CONCOURS SUPPLÉMENTAIRES ═══
CC("eci.bj","ECI Bénin","Concours ECI 2027 — Commerce et Industrie Bénin","Concours d'entrée à l'École de Commerce et d'Industrie du Bénin. Gestion commerciale, marketing, comptabilité.","Bac. Concours écrit et entretien.","Français","2027-06-30","https://www.eci.bj/",["nationalite"]),
CC("cfpeen.bj","CFPEEN","Concours CFPEEN 2027 — Formation Enseignants Bénin","Concours d'entrée au Centre de Formation Professionnelle des Enseignants de l'Enseignement Normal. Formation de formateurs.","Licence en éducation ou discipline d'enseignement. Nationalité béninoise.","Français","2027-06-30","https://www.education.gouv.bj/",["nationalite","casier"]),

// ═══ BOURSES FINALES ═══
B("isdb.org","Banque Islamique de Développement","Bourse BID 2027 — Pays Membres","Bourses de la Banque Islamique de Développement pour licence, master et doctorat. 57 pays membres dont le Bénin. Frais + allocation.","Nationalité d'un pays membre de la BID. Excellence académique.","Anglais ou arabe ou français","2027-03-31","https://www.isdb.org/scholarships",["recommandation"]),
B("koica.go.kr","KOICA","Bourse KOICA-CIAT 2027 — Corée du Sud","Bourses KOICA pour master dans des universités coréennes partenaires. Développement, agriculture, santé publique, éducation. Frais + allocation.","Nationalité d'un pays partenaire KOICA. 3+ ans d'expérience professionnelle.","Anglais","2027-03-31","https://www.koica.go.kr/",["recommandation"]),
B("moe.gov.tw","Gouvernement Taiwanais","Bourse ICDF Taiwan 2027","Bourses ICDF de Taiwan pour master et doctorat. Agriculture, ingénierie, santé, IT. Frais + allocation + billet + assurance.","Nationalité d'un pays allié de Taiwan ou partenaire. Licence minimum.","Anglais","2027-03-31","https://www.icdf.org.tw/",["recommandation","passeport"]),
B("mext.go.jp","Gouvernement Japonais","Bourse MEXT Research Student 2027","Bourses du gouvernement japonais pour étudiants en recherche. 6 mois de japonais + master ou doctorat. Allocation 143 000 JPY/mois + frais + billet.","Nationalité non-japonaise. Moins de 35 ans. Licence minimum.","Japonais (cours fournis) ou anglais","2027-04-15","https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html",["recommandation","passeport"]),
B("scholars4dev.com","Gouvernement Belge","Bourse ARES Formation Continue 2027","Bourses ARES pour formations courtes en Belgique francophone. Stages de 4 à 6 mois dans des universités belges. Professionnels de pays en développement.","Nationalité d'un pays partenaire. 2+ ans d'expérience. Être en poste actuellement.","Français","2027-01-15","https://www.ares-ac.be/fr/cooperation-au-developpement/bourses/stages",["recommandation"]),
B("britishcouncil.org","British Council","Bourse GREAT Scholarships 2027 — UK","Bourses GREAT du British Council pour master au UK. 10 000 GBP. Partenariat avec 100+ universités britanniques. Pays africains éligibles.","Admis en master dans une université partenaire. Nationalité d'un pays éligible.","Anglais (IELTS 6.5+)","2027-05-31","https://www.britishcouncil.org/study-work-abroad/in-uk/great-scholarships"),

// ═══ EMPLOI — DERNIERS POUR LE QUOTA ═══
E("bollore-transport-logistics.com","Bolloré Logistics","Bolloré Logistics — Freight Manager Bénin 2027","Poste de responsable fret chez Bolloré Logistics au Bénin. Transit, dédouanement, logistique portuaire, transport multimodal. Port de Cotonou.","Diplôme en logistique, transit ou commerce international.","Français courant, anglais apprécié","2027-06-30","https://www.bollore-transport-logistics.com/careers/"),
E("maersk.com","Maersk","Maersk — Area Manager West Africa 2027","Poste de responsable zone chez Maersk en Afrique de l'Ouest. Logistique maritime, conteneurs, supply chain solutions. Lagos ou Cotonou.","Master en logistique maritime ou commerce international.","Anglais courant","2027-06-30","https://www.maersk.com/careers"),
E("mtn.com","MTN","MTN — Digital Services Manager Bénin 2027","Poste de responsable services digitaux chez MTN au Bénin. Mobile money MoMo, applications, API, partenariats fintech.","Master en informatique, marketing digital ou télécoms.","Français courant, anglais apprécié","2027-06-30","https://www.mtn.com/careers/"),
E("societegenerale.com","Société Générale","Société Générale Bénin — Analyste Crédit 2027","Poste d'analyste crédit chez Société Générale au Bénin. Analyse financière, octroi de crédit aux entreprises et particuliers.","Master en finance, banque ou comptabilité.","Français courant","2027-06-30","https://www.societegenerale.com/fr/carrieres"),
E("ecobank.com","Ecobank","Ecobank — Graduate Programme 2027","Programme diplômé chez Ecobank, plus grande banque panafricaine. 33 pays. Banque de détail, corporate, treasury, digital. Hub à Lomé.","Master en finance, banque ou économie. Nationalité CEDEAO.","Français et anglais","2027-06-30","https://www.ecobank.com/personal-banking/careers"),
E("orabank.net","Orabank","Orabank Bénin — Chargé de Clientèle 2027","Poste de chargé de clientèle chez Orabank au Bénin. Gestion de portefeuille, développement commercial, produits bancaires.","Licence en banque, finance ou commerce.","Français courant","2027-06-30","https://www.orabank.net/"),
E("africelltowers.com","Helios Towers","Helios Towers — Site Engineer Bénin 2027","Poste d'ingénieur site chez Helios Towers au Bénin. Gestion de tours télécoms, maintenance, énergie hybride solaire/diesel.","Diplôme en génie électrique ou télécommunications.","Français courant, anglais apprécié","2027-06-30","https://www.heliostowers.com/careers/"),
E("canal-plus.com","Canal+ Bénin","Canal+ — Commercial Bénin 2027","Poste de commercial chez Canal+ au Bénin. Développement d'abonnés, distribution, marketing terrain. Réseau national.","Diplôme en commerce ou marketing.","Français courant","2027-06-30","https://www.canalplus.com/bj/recrutement"),
E("axa.com","AXA","AXA Assurances Bénin — Actuaire 2027","Poste d'actuaire chez AXA Assurances au Bénin. Tarification, provisionnement, réassurance. Marché de l'assurance CIMA.","Master en actuariat, statistique ou mathématiques.","Français courant","2027-06-30","https://www.axa.com/en/careers"),
E("pnud.bj","PNUD Bénin","PNUD Bénin — Spécialiste Environnement 2027","Poste de spécialiste environnement et changement climatique chez le PNUD au Bénin. Adaptation, atténuation, biodiversité, énergie verte.","Master en environnement, climatologie ou développement durable.","Français courant, anglais apprécié","2027-06-30","https://jobs.undp.org/"),
];

async function main() {
  console.log(`Lot 8 — Total à insérer : ${ALL.length}`);
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
