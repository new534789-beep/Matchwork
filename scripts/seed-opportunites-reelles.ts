import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Opp = {
  type: string;
  source: string;
  organisme: string;
  intitule: string;
  description: string;
  langueDetectee: string;
  conditions: string;
  piecesExigees: string;
  exigenceLangue: string;
  dateLimite: string; // ISO
  lien: string;
  canalCandidature: string;
  cibleCandidature: string;
  statut: string;
};

const OPPORTUNITES: Opp[] = [
  // ═══════════════════════════════════ CANADA ═══════════════════════════════════
  {
    type: "BOURSE", source: "educanada.ca", organisme: "Gouvernement du Canada",
    intitule: "Bourses d'études au Canada (BEC) 2026-2027",
    description: "Programme de bourses pour des séjours académiques de 4 à 6 mois dans une université canadienne partenaire. Financement complet incluant frais de scolarité, billet d'avion, allocation de subsistance et assurance maladie. Ouvert aux ressortissants de pays éligibles d'Afrique subsaharienne dont le Bénin, le Burkina Faso, la Côte d'Ivoire, le Sénégal, le Ghana et le Nigeria.",
    langueDetectee: "fr", conditions: "Être inscrit dans un établissement d'enseignement supérieur dans un pays éligible. Niveau licence ou master. La candidature est soumise par l'université canadienne partenaire.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV académique","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Passeport","type":"passeport","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français ou anglais selon l'université d'accueil",
    dateLimite: "2027-03-31", lien: "https://www.educanada.ca/scholarships-bourses/can/institutions/study-in-canada-sep-etudes-au-canada-pct.aspx?lang=fra",
    canalCandidature: "lien_info", cibleCandidature: "https://www.educanada.ca/scholarships-bourses/can/institutions/study-in-canada-sep-etudes-au-canada-pct.aspx?lang=fra", statut: "publiee",
  },
  {
    type: "BOURSE", source: "frq.gouv.qc.ca", organisme: "Fonds de recherche du Québec",
    intitule: "Bourses d'excellence PBEEE 2026-2027 — Québec",
    description: "Bourses d'excellence pour étudiants étrangers (PBEEE) permettant de poursuivre des études de maîtrise ou de doctorat dans un établissement universitaire québécois. Exemption des droits de scolarité supplémentaires et allocation mensuelle. Le candidat doit être présélectionné par un établissement québécois.",
    langueDetectee: "fr", conditions: "Être admis ou inscrit dans un programme de maîtrise ou doctorat au Québec. Présélection par l'établissement québécois requise. Excellence académique démontrée.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"Projet de recherche","type":"projet","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Lettres de recommandation (2)","type":"recommandation","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français (B2 minimum) ou anglais selon le programme",
    dateLimite: "2026-11-01", lien: "https://frq.gouv.qc.ca/programme/bourses-dexcellence-pour-etudiants-etrangers-pbeee-2026-2027/",
    canalCandidature: "lien_info", cibleCandidature: "https://frq.gouv.qc.ca/programme/bourses-dexcellence-pour-etudiants-etrangers-pbeee-2026-2027/", statut: "publiee",
  },
  {
    type: "BOURSE", source: "mcgill.ca", organisme: "Université McGill",
    intitule: "Bourse McCall MacBain 2027 — McGill (Master/Doctorat)",
    description: "Jusqu'à 30 bourses McCall MacBain (dont 10 pour étudiants internationaux) pour un programme de master ou doctorat à l'Université McGill. Financement complet : frais de scolarité, allocation de subsistance, mentorat et développement du leadership. Processus de sélection rigoureux avec entrevues.",
    langueDetectee: "fr", conditions: "Être admissible à un programme de 2e ou 3e cycle à McGill. Avoir démontré un leadership exceptionnel, un engagement communautaire et une excellence académique.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Lettres de recommandation (3)","type":"recommandation","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais (IELTS 6.5+ ou TOEFL 86+)",
    dateLimite: "2026-08-25", lien: "https://boursiersmccallmacbain.org/postuler/",
    canalCandidature: "formulaire", cibleCandidature: "https://boursiersmccallmacbain.org/postuler/", statut: "publiee",
  },
  {
    type: "BOURSE", source: "uottawa.ca", organisme: "Université d'Ottawa",
    intitule: "Bourse d'excellence internationale — Université d'Ottawa",
    description: "Bourse automatique de 15 000 CAD/an pour les étudiants internationaux admis en premier cycle dans un programme offert en anglais. Renouvelable annuellement sur la base des résultats académiques. Aucune candidature séparée requise.",
    langueDetectee: "fr", conditions: "Être admis à temps plein en premier cycle. Programme offert en anglais. Maintenir une moyenne académique satisfaisante pour le renouvellement.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Diplôme du baccalauréat","type":"diplome","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais ou français selon le programme",
    dateLimite: "2027-04-01", lien: "https://www.uottawa.ca/study/fees-financial-support/scholarships-awards-overview",
    canalCandidature: "lien_info", cibleCandidature: "https://www.uottawa.ca/study/fees-financial-support/scholarships-awards-overview", statut: "publiee",
  },
  {
    type: "BOURSE", source: "ulaval.ca", organisme: "Université Laval",
    intitule: "Programme de bourses d'excellence — Université Laval 2027",
    description: "Plus de 163 bourses d'entrée pour étudiants internationaux à tous les cycles (licence, master, doctorat). Montants variables selon le programme. L'Université Laval est la plus ancienne université francophone d'Amérique.",
    langueDetectee: "fr", conditions: "Être admis dans un programme de l'Université Laval. Excellence académique. Les critères varient selon la bourse spécifique.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français (TEF/TCF B2 minimum)",
    dateLimite: "2027-02-01", lien: "https://www.bbaf.ulaval.ca/bourses-detudes/etudiants-international/programmes-bourses-dexcellence/",
    canalCandidature: "lien_info", cibleCandidature: "https://www.bbaf.ulaval.ca/bourses-detudes/etudiants-international/programmes-bourses-dexcellence/", statut: "publiee",
  },

  // ═══════════════════════════════════ ALLEMAGNE ═══════════════════════════════════
  {
    type: "BOURSE", source: "daad.de", organisme: "DAAD — Service allemand d'échanges universitaires",
    intitule: "Bourse DAAD EPOS 2027 — Master en Allemagne",
    description: "Bourses pour des programmes de master liés au développement (EPOS) en Allemagne. Financement complet : 934 EUR/mois, frais de scolarité, assurance maladie, billet d'avion et allocation de recherche. Ouvert aux professionnels des pays en développement avec minimum 2 ans d'expérience.",
    langueDetectee: "fr", conditions: "Diplôme de licence (4 ans). Minimum 2 ans d'expérience professionnelle après le diplôme. Être ressortissant d'un pays en développement (liste DAC).",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Lettres de recommandation (2)","type":"recommandation","categorie":"personnel","obligatoire":true},{"nom":"Certificat de langue","type":"langue","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais (IELTS 6.0+ ou TOEFL 80+). Certains programmes en allemand (TestDaF).",
    dateLimite: "2026-10-15", lien: "https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/",
    canalCandidature: "formulaire", cibleCandidature: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50076777", statut: "publiee",
  },
  {
    type: "BOURSE", source: "daad.de", organisme: "DAAD",
    intitule: "DAAD In-Country/In-Region Scholarship — Afrique subsaharienne 2026",
    description: "Bourses pour des programmes de master et doctorat dans des universités africaines partenaires du DAAD. Permet d'étudier dans un autre pays africain. Allocation mensuelle, frais de scolarité et assurance inclus.",
    langueDetectee: "fr", conditions: "Ressortissant d'un pays d'Afrique subsaharienne. Diplôme de licence avec bons résultats. Admission dans une université partenaire DAAD en Afrique.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Lettres de recommandation (2)","type":"recommandation","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais ou français selon le programme",
    dateLimite: "2026-10-31", lien: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=10000486",
    canalCandidature: "lien_info", cibleCandidature: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=10000486", statut: "publiee",
  },

  // ═══════════════════════════════════ CHINE ═══════════════════════════════════
  {
    type: "BOURSE", source: "campuschina.org", organisme: "China Scholarship Council (CSC)",
    intitule: "Bourse du Gouvernement Chinois CSC 2027 — Master/Doctorat",
    description: "Bourse entièrement financée par le gouvernement chinois pour des études de master ou doctorat dans les universités chinoises. Couvre les frais de scolarité, hébergement en dortoir, allocation mensuelle (2 500 à 3 500 CNY/mois) et assurance maladie. Environ 30 000 bourses attribuées chaque année à des étudiants de plus de 180 pays.",
    langueDetectee: "fr", conditions: "Être en bonne santé. Avoir moins de 35 ans (master) ou 40 ans (doctorat). Ne pas être citoyen chinois ni étudiant en Chine actuellement. Bons résultats académiques.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"Plan d'études / projet de recherche","type":"projet","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Lettres de recommandation (2)","type":"recommandation","categorie":"personnel","obligatoire":true},{"nom":"Passeport","type":"passeport","categorie":"personnel","obligatoire":true},{"nom":"Certificat médical","type":"medical","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Chinois (HSK 4+) ou anglais selon le programme. Programmes en anglais disponibles.",
    dateLimite: "2027-04-15", lien: "https://www.campuschina.org",
    canalCandidature: "formulaire", cibleCandidature: "https://www.campuschina.org", statut: "publiee",
  },
  {
    type: "BOURSE", source: "cucas.cn", organisme: "Gouvernement chinois — Belt and Road",
    intitule: "Bourse Belt and Road (Route de la Soie) 2027 — Chine",
    description: "Bourse spéciale pour les étudiants des pays de la Route de la Soie et des pays africains. Allocation de 20 000 CNY/an. Couvre des programmes de licence, master et doctorat dans de nombreuses universités chinoises. Possibilité d'étudier le chinois pendant un an avant le programme académique.",
    langueDetectee: "fr", conditions: "Ressortissant d'un pays de la Route de la Soie ou d'un pays africain partenaire. Bonne santé. Excellents résultats académiques.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Passeport","type":"passeport","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Chinois ou anglais. Cours de chinois préparatoire disponible.",
    dateLimite: "2027-04-30", lien: "https://www.cucas.cn/china_scholarship/?lang=fr",
    canalCandidature: "formulaire", cibleCandidature: "https://www.cucas.cn/china_scholarship/?lang=fr", statut: "publiee",
  },
  {
    type: "BOURSE", source: "zju.edu.cn", organisme: "Gouvernement provincial du Zhejiang",
    intitule: "Bourse du Gouvernement du Zhejiang 2026-2027 — Chine",
    description: "Bourse provinciale pour étudier dans les universités du Zhejiang (dont l'Université de Zhejiang, top 3 en Chine). Couvre frais de scolarité et allocation de vie. Programmes en anglais disponibles dans les domaines de l'ingénierie, du commerce et des sciences.",
    langueDetectee: "fr", conditions: "Être étudiant international non-chinois. Bons résultats académiques. Être admis dans une université du Zhejiang.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Passeport","type":"passeport","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais ou chinois selon le programme",
    dateLimite: "2026-12-31", lien: "https://www.globalsouthopportunities.com/2026/05/28/zhejiang/",
    canalCandidature: "lien_info", cibleCandidature: "https://www.globalsouthopportunities.com/2026/05/28/zhejiang/", statut: "publiee",
  },

  // ═══════════════════════════════════ BELGIQUE ═══════════════════════════════════
  {
    type: "BOURSE", source: "ares-ac.be", organisme: "ARES — Académie de Recherche et d'Enseignement Supérieur (Belgique)",
    intitule: "Bourses ARES 2026-2027 — Master et formation en Belgique",
    description: "200 bourses entièrement financées pour des formations de master spécialisé et formation continue en Belgique francophone. Couvre frais d'inscription, allocation mensuelle de subsistance, assurance maladie, billet d'avion aller-retour et frais de visa. Bénin, Burkina Faso, Cameroun, Côte d'Ivoire, Mali, Niger, Sénégal et RD Congo sont éligibles.",
    langueDetectee: "fr", conditions: "Diplôme de 2e cycle (master/maîtrise). Minimum 2 ans d'expérience professionnelle dans un pays partenaire. Être ressortissant d'un pays éligible. Candidature via la plateforme GIRAF.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV détaillé","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Diplômes","type":"diplome","categorie":"personnel","obligatoire":true},{"nom":"Attestations d'emploi","type":"emploi","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français (B2 minimum). Test de français requis pour certains programmes.",
    dateLimite: "2026-09-19", lien: "https://ares-ac.be/fr/bourses-de-formations-internationales-2026-2027",
    canalCandidature: "formulaire", cibleCandidature: "https://ares-ac.be/fr/bourses-de-formations-internationales-2026-2027", statut: "publiee",
  },
  {
    type: "BOURSE", source: "vfruo.be", organisme: "VLIR-UOS (Belgique flamande)",
    intitule: "Bourses ICP Connect VLIR-UOS 2027 — Master en Belgique",
    description: "Bourses entièrement financées pour des programmes de master en Flandre et Bruxelles. Destinées aux étudiants d'Afrique, d'Asie et d'Amérique latine. Allocation de subsistance, frais de scolarité, assurance et billet d'avion inclus.",
    langueDetectee: "fr", conditions: "Être ressortissant d'un pays éligible VLIR-UOS (inclut Bénin, Burkina Faso, Cameroun, RD Congo, Éthiopie, etc.). Maximum 35 ans. Expérience professionnelle pertinente.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Certificat de langue","type":"langue","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais (IELTS 6.0+ ou TOEFL 79+)",
    dateLimite: "2027-02-01", lien: "https://www.scholarshiptab.com/scholarships-in/belgium",
    canalCandidature: "lien_info", cibleCandidature: "https://www.vfruo.be", statut: "publiee",
  },
  {
    type: "BOURSE", source: "onderwijs.vlaanderen.be", organisme: "Gouvernement flamand — Mastermind",
    intitule: "Bourse Mastermind 2027 — Master en Flandre (Belgique)",
    description: "Bourse du Ministère flamand de l'Éducation pour un master en Flandre ou Bruxelles. Subvention de 10 225 EUR et exemption des frais de scolarité par année académique (60 ECTS). Ouverte à tous les étudiants internationaux du monde entier.",
    langueDetectee: "fr", conditions: "Être admis dans un programme de master éligible dans une université flamande. Ne pas avoir étudié en Belgique auparavant.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais ou néerlandais selon le programme",
    dateLimite: "2027-03-15", lien: "https://www.scholarshiptab.com/scholarships-in/belgium",
    canalCandidature: "lien_info", cibleCandidature: "https://www.scholarshiptab.com/scholarships-in/belgium", statut: "publiee",
  },

  // ═══════════════════════════════════ LUXEMBOURG ═══════════════════════════════════
  {
    type: "BOURSE", source: "uni.lu", organisme: "Université du Luxembourg",
    intitule: "Bourse Guillaume Dupaix — Master à l'Université du Luxembourg",
    description: "Bourse internationale de 11 000 EUR par année académique (jusqu'à 2 ans) pour un programme de master à l'Université du Luxembourg. Destinée aux étudiants internationaux avec d'excellents résultats académiques. Le Luxembourg offre un environnement multilingue et multiculturel unique.",
    langueDetectee: "fr", conditions: "Être étudiant international à temps plein. Excellents résultats académiques. Ne pas bénéficier de l'aide financière de l'État luxembourgeois.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais (programmes en anglais) ou français/allemand",
    dateLimite: "2027-03-01", lien: "https://www.uni.lu/en/mobility/outgoing-student-mobility/scholarships/",
    canalCandidature: "lien_info", cibleCandidature: "https://www.uni.lu/en/mobility/outgoing-student-mobility/scholarships/", statut: "publiee",
  },

  // ═══════════════════════════════════ MAROC ═══════════════════════════════════
  {
    type: "BOURSE", source: "amci.ma", organisme: "AMCI — Agence Marocaine de Coopération Internationale",
    intitule: "Bourse AMCI 2026-2027 — Études universitaires au Maroc",
    description: "Programme de bourses du gouvernement marocain pour étudiants étrangers dans les universités et établissements publics marocains. Couvre licence, master et doctorat. Formation professionnelle de deux ans également disponible. Le Bénin, le Burkina Faso, le Cameroun, le Mali, le Niger et le Sénégal sont éligibles.",
    langueDetectee: "fr", conditions: "Être titulaire du baccalauréat ou équivalent. Candidature via le ministère de l'Éducation du pays d'origine. Bonne santé.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes certifiés","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Diplôme du baccalauréat certifié","type":"diplome","categorie":"personnel","obligatoire":true},{"nom":"Acte de naissance","type":"etat_civil","categorie":"personnel","obligatoire":true},{"nom":"Passeport","type":"passeport","categorie":"personnel","obligatoire":true},{"nom":"Certificat médical","type":"medical","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français (langue d'enseignement principale). Arabe pour certains programmes.",
    dateLimite: "2026-12-30", lien: "https://www.amci.ma/cooperation-academique",
    canalCandidature: "lien_info", cibleCandidature: "https://www.amci.ma/cooperation-academique", statut: "publiee",
  },

  // ═══════════════════════════════════ CÔTE D'IVOIRE ═══════════════════════════════════
  {
    type: "CONCOURS", source: "fonctionpublique.gouv.ci", organisme: "Fonction Publique — Côte d'Ivoire",
    intitule: "Concours administratifs 2026 — Fonction publique ivoirienne",
    description: "Plus de 400 concours administratifs pour intégrer la fonction publique ivoirienne en 2026 : 199 concours de recrutement direct (14 directs, 121 recrutements, 54 recrutements spécifiques exceptionnels, 10 pour la diaspora) et 224 concours professionnels. 3 700 postes annoncés. Inscription en ligne sur gucaci.ciconcours.com.",
    langueDetectee: "fr", conditions: "Nationalité ivoirienne (ou diaspora pour 10 concours). Âge limite 42 ans (catégories D1 à A3) ou 47 ans (grade A4). Diplômes requis selon le grade visé. Droits d'inscription : 5 000 à 25 000 FCFA.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":false},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":false},{"nom":"Diplômes","type":"diplome","categorie":"personnel","obligatoire":true},{"nom":"Extrait d'acte de naissance","type":"etat_civil","categorie":"personnel","obligatoire":true},{"nom":"Certificat de nationalité","type":"nationalite","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français",
    dateLimite: "2026-09-30", lien: "https://gucaci.ciconcours.com/",
    canalCandidature: "formulaire", cibleCandidature: "https://gucaci.ciconcours.com/", statut: "publiee",
  },

  // ═══════════════════════════════════ CAMEROUN ═══════════════════════════════════
  {
    type: "CONCOURS", source: "enam.cm", organisme: "ENAM — Cameroun",
    intitule: "Concours d'entrée à l'ENAM Cameroun 2026-2027",
    description: "Concours d'entrée à l'École Nationale d'Administration et de Magistrature du Cameroun. Divisions : Auditeurs de Justice, Greffes, Division Administrative, Régies Financières. Inscription en ligne sur concours.enam.cm. Droits d'inscription : 25 000 FCFA.",
    langueDetectee: "fr", conditions: "Nationalité camerounaise. Conditions d'âge et de diplôme selon la division et le grade visés. Casier judiciaire vierge.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":false},{"nom":"Diplômes requis","type":"diplome","categorie":"personnel","obligatoire":true},{"nom":"Acte de naissance","type":"etat_civil","categorie":"personnel","obligatoire":true},{"nom":"Certificat de nationalité","type":"nationalite","categorie":"personnel","obligatoire":true},{"nom":"Casier judiciaire","type":"casier","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français ou anglais (bilingue)",
    dateLimite: "2026-08-14", lien: "https://concours.enam.cm/fr/.aspx",
    canalCandidature: "formulaire", cibleCandidature: "https://concours.enam.cm/fr/.aspx", statut: "publiee",
  },
  {
    type: "ADMISSION", source: "polytechnique.cm", organisme: "École Polytechnique de Yaoundé (ENSPY)",
    intitule: "Concours d'entrée ENSPY 2026-2027 — Polytechnique Cameroun",
    description: "Concours d'entrée à l'École Nationale Supérieure Polytechnique de Yaoundé pour l'année académique 2026-2027. Filières : Génie Civil, Génie Électrique, Génie Informatique, Génie Mécanique, Génie des Télécommunications. Formation d'ingénieurs de haut niveau.",
    langueDetectee: "fr", conditions: "Baccalauréat scientifique (C, D, E, F ou équivalent). Conditions d'âge selon le cycle. Réussir les épreuves écrites.",
    piecesExigees: `[{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Diplôme du baccalauréat","type":"diplome","categorie":"personnel","obligatoire":true},{"nom":"Acte de naissance","type":"etat_civil","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français ou anglais",
    dateLimite: "2026-08-31", lien: "https://polytechnique.cm/concours-dentree-a-lenspy-2026-2027",
    canalCandidature: "formulaire", cibleCandidature: "https://polytechnique.cm/concours-dentree-a-lenspy-2026-2027", statut: "publiee",
  },

  // ═══════════════════════════════════ BOURSES VANIER (CANADA) ═══════════════════════════════════
  {
    type: "BOURSE", source: "vanier.gc.ca", organisme: "Gouvernement du Canada — Vanier",
    intitule: "Bourse Vanier 2027 — Doctorat au Canada (50 000 CAD/an)",
    description: "La bourse de doctorat Vanier du Canada offre 50 000 CAD par an pendant 3 ans pour des études doctorales dans une université canadienne. Ouverte aux étudiants internationaux et canadiens. Domaines : sciences naturelles, sciences de la santé, sciences humaines et sociales. L'une des bourses doctorales les plus prestigieuses au monde.",
    langueDetectee: "fr", conditions: "Être inscrit ou admissible à un programme de doctorat au Canada. Excellence académique de premier rang. Leadership démontré. Candidature présentée par l'université d'accueil.",
    piecesExigees: `[{"nom":"Lettre de motivation / de recherche","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV académique","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Lettres de recommandation (2)","type":"recommandation","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français ou anglais selon l'université",
    dateLimite: "2026-11-01", lien: "https://vanier.gc.ca",
    canalCandidature: "lien_info", cibleCandidature: "https://vanier.gc.ca", statut: "publiee",
  },

  // ═══════════════════════════════════ BOURSE PEARSON (CANADA) ═══════════════════════════════════
  {
    type: "BOURSE", source: "future.utoronto.ca", organisme: "Université de Toronto — Pearson",
    intitule: "Bourse Lester B. Pearson 2027 — Licence à l'Université de Toronto",
    description: "Bourse d'excellence pour étudiants internationaux exceptionnels souhaitant étudier en licence à l'Université de Toronto. Couvre 4 ans de frais de scolarité, livres, frais accessoires et hébergement. Nomination par l'école secondaire requise. L'une des bourses les plus complètes au Canada.",
    langueDetectee: "fr", conditions: "Être étudiant international. Être nominé par son école secondaire. Excellence académique et créativité démontrées. Être en dernière année du secondaire ou première année post-bac.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Lettre de nomination de l'école","type":"nomination","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais (IELTS 6.5+ ou TOEFL 89+)",
    dateLimite: "2026-11-30", lien: "https://future.utoronto.ca/pearson/",
    canalCandidature: "lien_info", cibleCandidature: "https://future.utoronto.ca/pearson/", statut: "publiee",
  },

  // ═══════════════════════════════════ EMPLOI AFRIQUE ═══════════════════════════════════
  {
    type: "EMPLOI", source: "banqueafricaine.org", organisme: "Banque Africaine de Développement (BAD)",
    intitule: "Programme de Jeunes Professionnels 2027 — BAD (Abidjan)",
    description: "Programme de 3 ans pour les jeunes professionnels africains à la Banque Africaine de Développement à Abidjan, Côte d'Ivoire. Salaire compétitif international, assurance maladie, allocation de logement. Domaines : économie, finance, ingénierie, agriculture, énergie, développement social.",
    langueDetectee: "fr", conditions: "Ressortissant d'un pays membre de la BAD. Master ou doctorat. Maximum 32 ans. Minimum 3 ans d'expérience professionnelle. Maîtrise du français ou de l'anglais.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Diplômes","type":"diplome","categorie":"personnel","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Français et/ou anglais (bilingue est un atout)",
    dateLimite: "2026-12-31", lien: "https://www.afdb.org/fr/opportunities/young-professionals-program",
    canalCandidature: "formulaire", cibleCandidature: "https://www.afdb.org/fr/opportunities/young-professionals-program", statut: "publiee",
  },

  // ═══════════════════════════════════ ADMISSION ALLEMAGNE ═══════════════════════════════════
  {
    type: "ADMISSION", source: "tu-munich.de", organisme: "TU Munich",
    intitule: "Admission Master 2027 — Technische Universität München (Allemagne)",
    description: "Candidature aux programmes de master de la TU Munich, l'une des meilleures universités techniques d'Europe. Programmes en anglais disponibles : Data Engineering, Computer Science, Management & Technology, Electrical Engineering, Robotics. Frais de scolarité réduits (environ 150 EUR/semestre pour les non-européens).",
    langueDetectee: "fr", conditions: "Licence pertinente (bachelor). Bons résultats académiques (top 20% de la promotion recommandé). Admission compétitive.",
    piecesExigees: `[{"nom":"Lettre de motivation","type":"lettre","categorie":"generable","obligatoire":true},{"nom":"CV","type":"cv","categorie":"generable","obligatoire":true},{"nom":"Relevés de notes","type":"releves","categorie":"personnel","obligatoire":true},{"nom":"Certificat de langue","type":"langue","categorie":"personnel","obligatoire":true}]`,
    exigenceLangue: "Anglais (TOEFL 88+ ou IELTS 6.5+) pour les programmes en anglais. Allemand (TestDaF/DSH) pour programmes en allemand.",
    dateLimite: "2027-01-15", lien: "https://www.tum.de/en/studies/application",
    canalCandidature: "formulaire", cibleCandidature: "https://www.tum.de/en/studies/application", statut: "publiee",
  },
];

async function main() {
  console.log(`Insertion de ${OPPORTUNITES.length} opportunités réelles…`);

  let inserted = 0;
  for (const o of OPPORTUNITES) {
    const exists = await prisma.opportunite.findFirst({
      where: { intitule: o.intitule, organisme: o.organisme },
    });
    if (exists) {
      console.log(`  [skip] ${o.intitule}`);
      continue;
    }

    await prisma.opportunite.create({
      data: {
        type: o.type,
        source: o.source,
        organisme: o.organisme,
        intitule: o.intitule,
        description: o.description,
        langueDetectee: o.langueDetectee,
        conditions: o.conditions,
        piecesExigees: o.piecesExigees,
        exigenceLangue: o.exigenceLangue,
        dateLimite: new Date(o.dateLimite),
        lien: o.lien,
        canalCandidature: o.canalCandidature,
        cibleCandidature: o.cibleCandidature,
        statut: o.statut,
        actif: true,
        confianceDateLimite: 0.9,
        sourceDateLimite: "recherche web directe",
      },
    });
    inserted++;
    console.log(`  [ok] ${o.intitule}`);
  }

  const total = await prisma.opportunite.count({ where: { statut: "publiee" } });
  console.log(`\nInsérées : ${inserted} | Total publiées : ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
export {};
