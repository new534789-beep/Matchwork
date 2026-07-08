/**
 * Insère les 20 bourses pour nouveaux bacheliers (source LeBoursier).
 *
 *   npx tsx scripts/seed-bourses-bacheliers.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const p = new PrismaClient();

function dedupKey(intitule: string, organisme: string) {
  const raw = `${intitule.toLowerCase().trim()}|${organisme.toLowerCase().trim()}`;
  return `hash:${createHash("sha1").update(raw).digest("hex")}`;
}

function pieces(list: { nom: string; obligatoire: boolean }[]) {
  return JSON.stringify(list);
}

const BOURSES = [
  {
    type: "BOURSE",
    source: "ashinaga.org",
    organisme: "Fondation Ashinaga",
    intitule: "Bourse Ashinaga 2027 — Études de premier cycle pour orphelins",
    description:
      "Bourse destinée aux étudiants orphelins d'Afrique subsaharienne pour des études de licence à l'international. Toutes les filières sont éligibles à l'exception de la médecine, pharmacie, odontologie et droit. Financement complet incluant frais de scolarité, hébergement et allocation de subsistance.",
    langueDetectee: "fr",
    conditions:
      "Être orphelin d'au moins un parent. Être ressortissant d'un pays d'Afrique subsaharienne. Avoir obtenu le baccalauréat. Toutes filières sauf médecine, pharmacie, odontologie et droit.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature", obligatoire: true },
      { nom: "Certificat de décès du/des parent(s)", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
    ]),
    exigenceLangue: "Anglais ou français selon le pays d'études",
    dateLimite: new Date("2026-08-16"),
    lien: "https://www.ashinaga.org/en/what-we-do/scholarships/",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.ashinaga.org/en/what-we-do/scholarships/",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "uemoa.int",
    organisme: "UEMOA — Union Économique et Monétaire Ouest Africaine",
    intitule: "Bourse UEMOA 2027 — Licence (5 400 000 FCFA, Afrique de l'Ouest)",
    description:
      "Bourse de 5 400 000 FCFA destinée aux bacheliers de l'espace UEMOA pour des études de licence en agronomie, industrie agro-alimentaire, élevage et santé animale, génie mécanique, génie civil, génie électrique et électronique, génie informatique, génie de l'environnement (énergies renouvelables), IA, TIC et expertise comptable.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays membre de l'UEMOA. Être titulaire du baccalauréat. Filières techniques et scientifiques uniquement. Avoir au moins 14 de moyenne.",
    piecesExigees: pieces([
      { nom: "Relevés de notes du baccalauréat", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Pièce d'identité", obligatoire: true },
    ]),
    exigenceLangue: "Français",
    dateLimite: new Date("2026-09-30"),
    lien: "https://www.uemoa.int",
    canalCandidature: "lien_info",
    cibleCandidature: "https://www.uemoa.int",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "sorbonne.ae",
    organisme: "Sorbonne University Abu Dhabi",
    intitule: "Bourse SUAD au mérite 2027 — Sorbonne Abu Dhabi (10 000-25 000 AED)",
    description:
      "La Sorbonne Abu Dhabi offre des bourses au mérite de 10 000 à 25 000 AED pour les nouveaux bacheliers admis dans ses programmes francophones : Mathématiques, Droit, Économie et Gestion, Géographie et aménagement du territoire, Management, etc.",
    langueDetectee: "fr",
    conditions:
      "Être admis en premier cycle à la Sorbonne Abu Dhabi. Programmes en langue française. Excellence académique au baccalauréat.",
    piecesExigees: pieces([
      { nom: "Dossier d'admission SUAD", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
    ]),
    exigenceLangue: "Français (programmes francophones)",
    dateLimite: new Date("2026-08-21"),
    lien: "https://www.sorbonne.ae/fr/education/apply-now/undergraduate",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.sorbonne.ae/fr/education/apply-now/undergraduate",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "sbw.berlin",
    organisme: "SBW Berlin — Gouvernement fédéral allemand",
    intitule: "Bourses SBW Berlin 2027 — Licence à Berlin/Potsdam (+5 000 €, Allemagne)",
    description:
      "Bourse du gouvernement fédéral allemand pour toutes les formations de licence des universités de Berlin ou de Potsdam. Destinée aux étudiants âgés de 18 à 30 ans issus de pays en développement. Financement supérieur à 5 000 € couvrant frais de vie et études.",
    langueDetectee: "fr",
    conditions:
      "Avoir entre 18 et 30 ans. Être ressortissant d'un pays en développement. Ne pas avoir vécu en Allemagne plus de 18 mois. Expérience bénévole ou professionnelle dans le secteur social. Engagement à travailler 18+ mois dans le pays d'origine après les études.",
    piecesExigees: pieces([
      { nom: "CV", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Preuve d'admission universitaire", obligatoire: true },
    ]),
    exigenceLangue: "Allemand ou anglais selon le programme",
    dateLimite: new Date("2026-10-15"),
    lien: "https://sbw.berlin/en/portfolio-items/sbw-berlin-scholarship",
    canalCandidature: "email",
    cibleCandidature: "application@sbw.berlin",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "isdb.org",
    organisme: "Banque islamique de développement (BID)",
    intitule: "Bourse BID-FSID 2027 — Licence (Banque islamique de développement)",
    description:
      "Bourse de la Banque islamique de développement pour des formations de licence en sciences de la vie et de la santé, études environnementales, éducation, ingénierie, agriculture, informatique, sciences fondamentales, économie et sciences sociales.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays membre de la BID ou d'une communauté musulmane dans un pays non-membre. Avoir le baccalauréat. Être âgé de moins de 24 ans.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Lettre de recommandation", obligatoire: true },
      { nom: "Certificat médical", obligatoire: true },
    ]),
    exigenceLangue: "Anglais ou arabe selon l'université d'accueil",
    dateLimite: new Date("2026-12-31"),
    lien: "https://www.isdb.org/scholarships/scholarship-programs",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.isdb.org/scholarships/scholarship-programs",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "ox.ac.uk",
    organisme: "University of Oxford",
    intitule: "Bourse Reach Oxford 2027 — Licence à Oxford (Royaume-Uni)",
    description:
      "Bourse complète pour des études de licence à l'Université d'Oxford. Couvre les frais de scolarité, hébergement et allocation de subsistance. Ouverte aux étudiants internationaux de pays en développement. Toutes les formations sauf médecine.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays en développement. Être admis en premier cycle à Oxford. Démontrer un excellent dossier académique et un besoin financier. Toutes filières sauf médecine.",
    piecesExigees: pieces([
      { nom: "Dossier d'admission UCAS", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Lettres de recommandation (2)", obligatoire: true },
    ]),
    exigenceLangue: "Anglais (IELTS 7.0+ ou équivalent)",
    dateLimite: new Date("2027-01-31"),
    lien: "https://www.ox.ac.uk/admissions/undergraduate/fees-and-funding/oxford-support/reach-oxford-scholarship/",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.ox.ac.uk/admissions/undergraduate/fees-and-funding/oxford-support/reach-oxford-scholarship/",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "turkiyeburslari.gov.tr",
    organisme: "Gouvernement de Turquie — Türkiye Bursları",
    intitule: "Bourse Türkiye Bursları 2027 — Licence en Turquie (+55 000 TL)",
    description:
      "Bourse gouvernementale turque ouverte à tous les nouveaux bacheliers pour tous les domaines de formation, y compris la médecine et la pharmacie. Cours en anglais ou en turc. Financement complet : frais de scolarité, hébergement, allocation mensuelle de 55 000+ TL, assurance santé et billet d'avion.",
    langueDetectee: "fr",
    conditions:
      "Être titulaire du baccalauréat ou en dernière année. Avoir moins de 21 ans pour la licence. Toutes nationalités (sauf turque). Tous domaines éligibles.",
    piecesExigees: pieces([
      { nom: "Formulaire en ligne", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Photo d'identité", obligatoire: true },
      { nom: "Passeport", obligatoire: true },
    ]),
    exigenceLangue: "Turc ou anglais (cours de langue offert la 1ère année)",
    dateLimite: new Date("2027-02-20"),
    lien: "https://www.turkiyeburslari.gov.tr",
    canalCandidature: "formulaire",
    cibleCandidature: "https://tbbs.turkiyeburslari.gov.tr",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "vfruo.be",
    organisme: "VLIR-UOS — Belgique",
    intitule: "Bourse ICP-Connect VLIR-UOS 2027 — Bachelor en Belgique (+16 000 €)",
    description:
      "Bourse belge VLIR-UOS finançant des programmes de bachelor (licence) tels que le Bachelor of Applied Computer Science et le Bachelor of Hotel Management. Financement de plus de 16 000 € incluant frais de scolarité, allocation mensuelle, assurance et billet d'avion.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays partenaire VLIR-UOS (liste incluant plusieurs pays d'Afrique). Avoir le baccalauréat. Expérience professionnelle pertinente recommandée.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "CV", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Certificat de langue anglaise", obligatoire: true },
    ]),
    exigenceLangue: "Anglais (IELTS 6.0+ ou TOEFL 79+)",
    dateLimite: new Date("2027-02-01"),
    lien: "https://www.vliruos.be/en/scholarships",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.vliruos.be/en/scholarships",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "csc.edu.cn",
    organisme: "Gouvernement chinois — China Scholarship Council",
    intitule: "Bourse du Gouvernement chinois (CSC) 2027 — Licence en Chine",
    description:
      "Bourse gouvernementale chinoise pour toutes les formations dispensées dans les universités chinoises partenaires, à l'exception de la médecine. Financement complet : frais de scolarité, hébergement, assurance médicale et allocation mensuelle.",
    langueDetectee: "fr",
    conditions:
      "Être titulaire du baccalauréat avec de bons résultats. Avoir moins de 25 ans pour la licence. Être en bonne santé. Toutes filières sauf médecine.",
    piecesExigees: pieces([
      { nom: "Formulaire CSC en ligne", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Certificat médical", obligatoire: true },
      { nom: "Passeport", obligatoire: true },
    ]),
    exigenceLangue: "Chinois (HSK 4+) ou anglais selon le programme",
    dateLimite: new Date("2027-01-15"),
    lien: "https://www.csc.edu.cn/studyinchina",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.csc.edu.cn/studyinchina",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "studyinromania.gov.ro",
    organisme: "Gouvernement de Roumanie — Ministère des Affaires Étrangères",
    intitule: "Bourse MFA Roumanie 2027 — Licence (toutes filières sauf médecine/pharmacie)",
    description:
      "Bourse du gouvernement roumain pour des études de licence dans toutes les filières sauf médecine et pharmacie. Couvre les frais de scolarité, l'hébergement et une allocation mensuelle.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays non-UE. Avoir le baccalauréat. Toutes filières sauf médecine et pharmacie. Année préparatoire de langue roumaine incluse si nécessaire.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Certificat médical", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
    ]),
    exigenceLangue: "Roumain (année préparatoire offerte) ou anglais/français selon le programme",
    dateLimite: new Date("2027-03-15"),
    lien: "https://scholarships.studyinromania.gov.ro",
    canalCandidature: "formulaire",
    cibleCandidature: "https://scholarships.studyinromania.gov.ro",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "mext.go.jp",
    organisme: "Gouvernement du Japon — MEXT",
    intitule: "Bourse MEXT 2027 — Licence au Japon (+1 500 000 ¥/an)",
    description:
      "Bourse du gouvernement japonais (MEXT) de plus de 1 500 000 ¥/an pour toutes les formations diplômantes dans les universités japonaises partenaires. Financement complet incluant frais de scolarité, allocation mensuelle, billet d'avion et année préparatoire de langue japonaise.",
    langueDetectee: "fr",
    conditions:
      "Être titulaire du baccalauréat. Avoir moins de 25 ans. Être en bonne santé. Être prêt à apprendre le japonais.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature MEXT", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Certificat médical", obligatoire: true },
      { nom: "Photo d'identité", obligatoire: true },
      { nom: "Lettre de recommandation", obligatoire: true },
    ]),
    exigenceLangue: "Japonais (année préparatoire offerte) ou anglais",
    dateLimite: new Date("2027-04-15"),
    lien: "https://www.mext.go.jp/en/policy/education/highered/title02/detail02/sdetail02/1373897.htm",
    canalCandidature: "lien_info",
    cibleCandidature: "https://www.mext.go.jp/en/policy/education/highered/title02/detail02/sdetail02/1373897.htm",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "mastercardfdn.org",
    organisme: "Fondation Mastercard",
    intitule: "Bourses Fondation Mastercard 2027 — Licence (financement complet, multi-pays)",
    description:
      "Bourses à financement complet pour des formations de premier cycle dans des institutions comme l'ALU (Rwanda), Ashesi (Ghana), l'UAC (Bénin), Makerere (Ouganda), KNUST (Ghana), l'UM6P (Maroc), EARTH (Costa Rica), USIU-Africa (Kenya) et bien d'autres. Destinées aux jeunes talentueux économiquement défavorisés d'Afrique.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays africain. Avoir le baccalauréat. Démontrer un besoin financier et un potentiel de leadership. Être admis dans une institution partenaire.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Preuve de besoin financier", obligatoire: true },
      { nom: "Lettre de recommandation", obligatoire: true },
    ]),
    exigenceLangue: "Variable selon l'université (anglais ou français)",
    dateLimite: new Date("2027-03-31"),
    lien: "https://mastercardfdn.org/all/scholars/",
    canalCandidature: "lien_info",
    cibleCandidature: "https://mastercardfdn.org/all/scholars/",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "campusfrance.org",
    organisme: "Gouvernement français — France Excellence Major",
    intitule: "Bourse France Excellence Major 2027 — Licence en France",
    description:
      "Bourse du gouvernement français ouverte à toutes les filières, y compris la pharmacie, pour les brillants bacheliers du réseau des lycées français à l'étranger (AEFE). Couvre les frais de scolarité, l'allocation mensuelle et la protection sociale.",
    langueDetectee: "fr",
    conditions:
      "Être ancien élève d'un lycée du réseau AEFE. Avoir obtenu le baccalauréat avec mention Bien ou Très Bien. Être admis dans un établissement d'enseignement supérieur français.",
    piecesExigees: pieces([
      { nom: "Dossier de candidature AEFE", obligatoire: true },
      { nom: "Relevés de notes du baccalauréat", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Avis du proviseur", obligatoire: true },
    ]),
    exigenceLangue: "Français (natif/avancé)",
    dateLimite: new Date("2027-03-15"),
    lien: "https://www.campusfrance.org/fr/le-programme-excellence-major",
    canalCandidature: "lien_info",
    cibleCandidature: "https://www.campusfrance.org/fr/le-programme-excellence-major",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "campusfrance.org",
    organisme: "Ambassades de France",
    intitule: "Bourse France Excellence des Ambassades 2027 — Licence en France",
    description:
      "Bourses d'excellence attribuées par les ambassades de France dans chaque pays. Les filières éligibles en licence varient d'un pays à un autre, en fonction des priorités de coopération. Se renseigner auprès de l'ambassade de France de son pays.",
    langueDetectee: "fr",
    conditions:
      "Être titulaire du baccalauréat avec d'excellents résultats. Les critères et filières varient selon le pays. Se renseigner auprès de l'ambassade de France locale.",
    piecesExigees: pieces([
      { nom: "Dossier de candidature (variable selon l'ambassade)", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "CV", obligatoire: true },
    ]),
    exigenceLangue: "Français (B2 minimum, TCF/DELF)",
    dateLimite: new Date("2027-03-31"),
    lien: "https://www.campusfrance.org/fr/bourses-excellence",
    canalCandidature: "lien_info",
    cibleCandidature: "https://www.campusfrance.org/fr/bourses-excellence",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "studyinkorea.go.kr",
    organisme: "Gouvernement de Corée du Sud — GKS",
    intitule: "Bourse Global Korea Scholarship (GKS) 2027 — Licence en Corée du Sud",
    description:
      "Bourse gouvernementale sud-coréenne pour toutes les formations de licence dans les universités partenaires. Financement complet incluant 1 an de cours de coréen, frais de scolarité, allocation mensuelle, assurance et billet d'avion. Attention : certains pays comme le Bénin ne sont pas éligibles au cycle licence.",
    langueDetectee: "fr",
    conditions:
      "Être titulaire du baccalauréat. Avoir moins de 25 ans. Être ressortissant d'un pays éligible (vérifier la liste, le Bénin n'est pas éligible en licence). GPA minimum de 80%.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature GKS", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Lettre de recommandation (2)", obligatoire: true },
      { nom: "Plan d'études", obligatoire: true },
      { nom: "Certificat médical", obligatoire: true },
    ]),
    exigenceLangue: "Coréen (1 an de cours offert) ou anglais (TOEFL 80+/IELTS 5.5+)",
    dateLimite: new Date("2027-03-15"),
    lien: "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "iccr.gov.in",
    organisme: "Gouvernement indien — ICCR",
    intitule: "Bourse ICCR India-Africa Maitri Scholarship 2027 — Licence en Inde",
    description:
      "Bourse de coopération du gouvernement indien pour des études de premier cycle en Inde. Couvre les frais de scolarité, l'hébergement, l'allocation mensuelle et les frais médicaux.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays africain. Avoir le baccalauréat. Être en bonne santé. Les filières varient selon les universités partenaires.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Certificat médical", obligatoire: true },
      { nom: "Passeport", obligatoire: true },
    ]),
    exigenceLangue: "Anglais",
    dateLimite: new Date("2027-03-31"),
    lien: "https://a2ascholarships.iccr.gov.in/",
    canalCandidature: "formulaire",
    cibleCandidature: "https://a2ascholarships.iccr.gov.in/",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "qu.edu.qa",
    organisme: "Qatar University",
    intitule: "Bourse Qatar University 2027 — Licence au Qatar",
    description:
      "Bourse pour toutes les formations de premier cycle ouvertes aux étudiants internationaux à l'Université du Qatar. Couvre les frais de scolarité et offre une allocation.",
    langueDetectee: "fr",
    conditions:
      "Être admis à l'Université du Qatar. Avoir le baccalauréat avec d'excellents résultats. Toutes les formations ouvertes aux étudiants internationaux.",
    piecesExigees: pieces([
      { nom: "Dossier d'admission Qatar University", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Certificat de langue", obligatoire: true },
    ]),
    exigenceLangue: "Anglais (IELTS 5.0+ ou TOEFL 61+) ou arabe selon le programme",
    dateLimite: new Date("2027-04-30"),
    lien: "https://www.qu.edu.qa/en-us/students/admission/scholarships/Pages/types.aspx",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.qu.edu.qa/en-us/students/admission/scholarships/Pages/types.aspx",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "ucl.ac.uk",
    organisme: "UCL — University of London",
    intitule: "Bourse Global Undergraduate UCL 2027 — Licence à Londres (Royaume-Uni)",
    description:
      "Bourse complète pour toutes les formations de licence proposées à UCL (University College London). L'une des universités les plus prestigieuses au monde. Financement couvrant frais de scolarité et allocation de subsistance.",
    langueDetectee: "fr",
    conditions:
      "Être admis en premier cycle à UCL. Démontrer un excellent dossier académique et un besoin financier. Ouvert aux étudiants internationaux.",
    piecesExigees: pieces([
      { nom: "Dossier d'admission UCAS", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Personal Statement", obligatoire: true },
      { nom: "Lettre de recommandation", obligatoire: true },
    ]),
    exigenceLangue: "Anglais (IELTS 6.5-7.5 selon le programme)",
    dateLimite: new Date("2027-01-31"),
    lien: "https://www.ucl.ac.uk/scholarships/scholarships-finder",
    canalCandidature: "formulaire",
    cibleCandidature: "https://www.ucl.ac.uk/scholarships/scholarships-finder",
    statut: "publiee",
  },
  {
    type: "BOURSE",
    source: "kau.edu.sa",
    organisme: "King Abdulaziz University — Arabie Saoudite",
    intitule: "Bourse King Abdulaziz University 2027 — Licence en Arabie Saoudite",
    description:
      "Bourse pour des formations de premier cycle en arts, économie, droit, ingénierie, sciences, communication, conceptions environnementales et autres. Financement complet incluant frais de scolarité, hébergement, allocation mensuelle et billet d'avion.",
    langueDetectee: "fr",
    conditions:
      "Être titulaire du baccalauréat. Être en bonne santé. Avoir moins de 25 ans. Les diplômes doivent être authentifiés par l'ambassade d'Arabie Saoudite.",
    piecesExigees: pieces([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Diplôme du baccalauréat", obligatoire: true },
      { nom: "Passeport", obligatoire: true },
      { nom: "Certificat médical", obligatoire: true },
    ]),
    exigenceLangue: "Arabe (année préparatoire offerte) ou anglais selon le programme",
    dateLimite: new Date("2027-04-30"),
    lien: "https://kau.edu.sa/en/page/scholarship",
    canalCandidature: "formulaire",
    cibleCandidature: "https://kau.edu.sa/en/page/scholarship",
    statut: "publiee",
  },
];

async function main() {
  let inseres = 0;
  let doublons = 0;

  for (const b of BOURSES) {
    const key = dedupKey(b.intitule, b.organisme);

    const existe = await p.opportunite.findFirst({
      where: {
        OR: [
          { dedupKey: key },
          { intitule: b.intitule },
        ],
      },
    });

    if (existe) {
      doublons++;
      console.log(`  DOUBLON: ${b.intitule.slice(0, 60)}`);
      continue;
    }

    await p.opportunite.create({
      data: {
        ...b,
        dedupKey: key,
        premiereVue: new Date(),
        confianceDateLimite: 0.7,
        sourceDateLimite: "leboursier.net",
      },
    });
    inseres++;
    console.log(`  OK: ${b.intitule.slice(0, 60)}`);
  }

  console.log(`\nInsérées: ${inseres}`);
  console.log(`Doublons ignorés: ${doublons}`);

  const total = await p.opportunite.count({
    where: { type: "BOURSE", actif: true, statut: "publiee" },
  });
  console.log(`Total bourses actives: ${total}`);

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
