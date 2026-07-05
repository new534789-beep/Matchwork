import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bourses = [
  {
    id: "auf-mobilite-master",
    organisme: "Agence Universitaire de la Francophonie",
    intitule: "Bourse de mobilité AUF — Master en Europe",
    description:
      "La Bourse de mobilité AUF permet à des étudiants francophones d'effectuer un Master dans une université partenaire en Europe (France, Belgique, Suisse, Canada). Elle couvre les frais de scolarité, le logement et un forfait mensuel de 850 € pour les dépenses courantes. Les candidats sélectionnés bénéficient également d'un accompagnement personnalisé tout au long de leur parcours.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays membre de l'AUF. Avoir une Licence validée (mentions Bien ou Très Bien). Maîtrise du français niveau B2 minimum. Moins de 35 ans à la date de dépôt.",
    piecesExigees: JSON.stringify([
      { nom: "Relevé de notes Licence", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "CV", obligatoire: true },
      { nom: "Lettres de recommandation (x2)", obligatoire: true },
      { nom: "Certificat de langue française (DELF/DALF)", obligatoire: false },
      { nom: "Attestation d'admission ou de pré-inscription", obligatoire: false },
    ]),
    exigenceLangue: "Français B2",
    dateLimite: new Date("2026-09-15"),
    lien: "https://www.auf.org/bourses",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "campus-france-eiffel",
    organisme: "Campus France",
    intitule: "Bourse d'Excellence Eiffel — Master / Doctorat",
    description:
      "Le programme Eiffel est l'un des plus prestigieux en France. Il attire en France les meilleurs étudiants étrangers pour des formations de haut niveau. La bourse couvre les frais de vie (1 181 €/mois pour Master, 1 400 €/mois pour Doctorat), le billet d'avion aller-retour, la couverture santé et les activités culturelles. Ouverte en ingénierie, sciences économiques, sciences politiques, droit et management.",
    langueDetectee: "fr",
    conditions:
      "Moins de 30 ans au 1er janvier de l'année d'attribution (Master) ou 35 ans (Doctorat). Dossier académique d'excellence (major de promo ou équivalent). Niveau B2 en français ou C1 en anglais. Dossier constitué par l'établissement d'accueil français uniquement.",
    piecesExigees: JSON.stringify([
      { nom: "CV académique", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Projet de recherche ou d'études", obligatoire: true },
      { nom: "Lettres de recommandation (x2)", obligatoire: true },
      { nom: "Relevés de notes (L1 à L3)", obligatoire: true },
      { nom: "Certificat de langue (DELF B2 ou TOEFL C1)", obligatoire: true },
      { nom: "Passeport en cours de validité", obligatoire: true },
    ]),
    exigenceLangue: "Français B2 ou Anglais C1",
    dateLimite: new Date("2026-10-31"),
    lien: "https://www.campusfrance.org/eiffel",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "oif-bourse-francophonie",
    organisme: "Organisation Internationale de la Francophonie",
    intitule: "Bourse de la Francophonie — Formation professionnelle",
    description:
      "L'OIF attribue chaque année des bourses de formation professionnelle aux ressortissants des pays membres pour des séjours de perfectionnement de 3 à 12 mois. Les domaines prioritaires sont la gouvernance, le développement durable, les TIC et l'éducation. Allocation mensuelle de 800 € + prise en charge du billet d'avion.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un état membre ou observateur de l'OIF. Être en activité professionnelle depuis au moins 2 ans. Avoir un projet de retour dans le pays d'origine. Maîtrise du français indispensable.",
    piecesExigees: JSON.stringify([
      { nom: "Formulaire de candidature OIF", obligatoire: true },
      { nom: "CV détaillé", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Lettre d'accord de l'employeur", obligatoire: true },
      { nom: "Diplôme le plus élevé (copie certifiée)", obligatoire: true },
      { nom: "Lettre d'invitation de l'institution d'accueil", obligatoire: false },
    ]),
    exigenceLangue: "Français courant (C1 recommandé)",
    dateLimite: new Date("2026-08-30"),
    lien: "https://www.francophonie.org/bourses",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "uemoa-pades-doctorat",
    organisme: "UEMOA — Programme PADES",
    intitule: "Bourse PADES — Appui aux études doctorales en Afrique de l'Ouest",
    description:
      "Le Programme d'Appui au Développement de l'Enseignement Supérieur (PADES) finance des thèses de doctorat dans les universités de l'espace UEMOA. La bourse couvre les frais d'inscription, une allocation mensuelle de 150 000 FCFA et un budget de recherche. Des co-tutelles avec des universités européennes sont encouragées.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays membre de l'UEMOA (Bénin, Burkina Faso, Côte d'Ivoire, Guinée-Bissau, Mali, Niger, Sénégal, Togo). Être inscrit ou admis en thèse dans une université de la zone. Avoir un directeur de thèse désigné. Moins de 40 ans.",
    piecesExigees: JSON.stringify([
      { nom: "Projet de thèse (15-20 pages)", obligatoire: true },
      { nom: "Accord du directeur de thèse", obligatoire: true },
      { nom: "Relevés de notes Master", obligatoire: true },
      { nom: "CV scientifique", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Pièce d'identité nationale", obligatoire: true },
    ]),
    exigenceLangue: "Français",
    dateLimite: new Date("2026-07-31"),
    lien: "https://www.uemoa.int/pades",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "mastercard-scholars",
    organisme: "Mastercard Foundation",
    intitule: "Programme de bourses Mastercard Foundation",
    description:
      "Le Programme de bourses Mastercard Foundation offre des bourses aux jeunes Africains talentueux académiquement et ayant des besoins financiers. Les boursiers bénéficient de la prise en charge complète des frais de scolarité, d'une allocation de vie, du logement, du billet d'avion et d'une formation en leadership. Le programme est disponible dans des universités partenaires en Afrique, aux États-Unis, au Royaume-Uni et au Canada.",
    langueDetectee: "fr",
    conditions:
      "Être citoyen d'un pays africain. Excellence académique démontrée (moyenne ≥ 3.5/4 ou équivalent). Besoin financier documenté. Âge entre 18 et 35 ans. Engagement à contribuer au développement du continent africain après l'obtention du diplôme.",
    piecesExigees: JSON.stringify([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "Relevés de notes officiels", obligatoire: true },
      { nom: "Déclaration personnelle (500–800 mots)", obligatoire: true },
      { nom: "Deux lettres de recommandation", obligatoire: true },
      { nom: "Justificatif de besoin financier", obligatoire: true },
      { nom: "Copie de la pièce d'identité ou du passeport", obligatoire: true },
      { nom: "Certificat d'anglais (IELTS 6.5+ ou TOEFL 90+)", obligatoire: false },
    ]),
    exigenceLangue: "Anglais B2 (IELTS 6.5+)",
    dateLimite: new Date("2026-09-30"),
    lien: "https://mastercardfdn.org/scholars",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "chevening-2026",
    organisme: "Bureau des Affaires étrangères du Royaume-Uni (FCDO)",
    intitule: "Bourse Chevening 2026–2027",
    description:
      "Chevening est le programme de bourses internationales du gouvernement britannique, destiné à former les futurs leaders mondiaux. Financé par le Bureau des Affaires étrangères (FCDO), Chevening offre un soutien financier complet pour suivre un Master éligible dans n'importe quelle université britannique. Les boursiers rejoignent un réseau mondial de plus de 50 000 anciens lauréats.",
    langueDetectee: "fr",
    conditions:
      "Être citoyen d'un pays éligible Chevening. Au moins 2 ans d'expérience professionnelle. Détenir un diplôme de Licence équivalent à un 2:1 britannique. Retourner dans son pays d'origine pendant au moins 2 ans après la bourse. Ne pas avoir la double nationalité britannique.",
    piecesExigees: JSON.stringify([
      { nom: "Candidature en ligne via le portail Chevening", obligatoire: true },
      { nom: "4 essais (500 mots chacun)", obligatoire: true },
      { nom: "Deux références (soumises en ligne)", obligatoire: true },
      { nom: "Diplôme de Licence", obligatoire: true },
      { nom: "Certificat d'anglais (IELTS 6.5 Academic)", obligatoire: true },
      { nom: "CV", obligatoire: true },
    ]),
    exigenceLangue: "Anglais — IELTS 6.5 Academic minimum",
    dateLimite: new Date("2026-11-04"),
    lien: "https://www.chevening.org/scholarships",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "daad-helmut-schmidt",
    organisme: "DAAD — Office allemand d'échanges universitaires",
    intitule: "Programme Helmut-Schmidt — Master en politiques publiques (pays en développement)",
    description:
      "Le programme Helmut-Schmidt s'adresse aux jeunes cadres des pays en développement souhaitant effectuer un Master en politiques publiques ou sciences politiques en Allemagne. Le financement comprend une allocation mensuelle, les frais de scolarité, une aide aux frais de voyage, l'assurance maladie et des cours de langue.",
    langueDetectee: "fr",
    conditions:
      "Diplôme universitaire (au moins Licence) avec d'excellents résultats. Au moins deux ans d'expérience professionnelle. Allemand B1 ou Anglais B2. Être ressortissant d'un pays en développement. Obligation de retour après le séjour en Allemagne.",
    piecesExigees: JSON.stringify([
      { nom: "Formulaire de candidature DAAD (en ligne)", obligatoire: true },
      { nom: "CV tabulaire", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Diplômes et relevés de notes", obligatoire: true },
      { nom: "Deux lettres de recommandation", obligatoire: true },
      { nom: "Certificat de langue — Allemand (Goethe B1) ou Anglais (B2)", obligatoire: true },
      { nom: "Pièce d'identité avec photo", obligatoire: true },
    ]),
    exigenceLangue: "Allemand B1 ou Anglais B2",
    dateLimite: new Date("2026-10-01"),
    lien: "https://www.daad.de/helmut-schmidt-programm",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "afd-dev-durable",
    organisme: "Agence Française de Développement",
    intitule: "Bourse AFD — Développement durable et transitions",
    description:
      "L'AFD finance des formations courtes (2 à 6 mois) et des Masters dans les domaines du développement durable, de la transition énergétique, de l'agriculture durable et de la gestion de l'eau en Afrique subsaharienne. La bourse inclut les frais pédagogiques, le transport, un per diem et une assurance santé.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays partenaire de l'AFD en Afrique subsaharienne. Avoir un projet professionnel en lien avec le développement durable. Être en activité ou en fin d'études (M2 ou équivalent). Moins de 45 ans.",
    piecesExigees: JSON.stringify([
      { nom: "Formulaire AFD en ligne", obligatoire: true },
      { nom: "Lettre de motivation et projet professionnel", obligatoire: true },
      { nom: "Diplôme le plus élevé", obligatoire: true },
      { nom: "CV", obligatoire: true },
      { nom: "Lettre de recommandation d'un employeur ou d'un enseignant", obligatoire: true },
      { nom: "Extrait de casier judiciaire", obligatoire: false },
    ]),
    exigenceLangue: "Français courant",
    dateLimite: new Date("2026-08-15"),
    lien: "https://www.afd.fr/bourses",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "mo-ibrahim-fellowship",
    organisme: "Fondation Mo Ibrahim",
    intitule: "Bourse de leadership Ibrahim — Gouvernance africaine",
    description:
      "La bourse de la Fondation Mo Ibrahim offre une opportunité exceptionnelle aux Africains talentueux souhaitant contribuer au développement du continent. Les boursiers travaillent au sein de grandes institutions africaines pendant un an, bénéficiant d'une exposition au leadership de haut niveau et à la gouvernance. La bourse comprend une allocation mensuelle de 5 000 $, le voyage, le logement et un mentor dédié.",
    langueDetectee: "fr",
    conditions:
      "Être citoyen africain, âgé de 25 à 35 ans. Diplôme de Master ou supérieur dans un domaine pertinent (gouvernance, économie, droit, sciences sociales). Maximum 5 ans d'expérience professionnelle pertinente. Engagement démontré pour le développement africain. Maîtrise d'au moins une langue officielle de l'Union africaine.",
    piecesExigees: JSON.stringify([
      { nom: "Candidature en ligne", obligatoire: true },
      { nom: "CV (3 pages maximum)", obligatoire: true },
      { nom: "Déclaration personnelle sur la gouvernance africaine (1000 mots)", obligatoire: true },
      { nom: "Trois lettres de référence", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Copie du passeport", obligatoire: true },
    ]),
    exigenceLangue: "Anglais ou Français courant",
    dateLimite: new Date("2026-10-15"),
    lien: "https://mo.ibrahim.foundation/fellowship",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "banque-mondiale-mcnamara",
    organisme: "Banque Mondiale",
    intitule: "Programme de bourses Robert S. McNamara",
    description:
      "Le Programme de bourses Robert S. McNamara de la Banque Mondiale soutient la recherche de jeunes économistes et universitaires prometteurs issus de pays en développement. Les boursiers passent 5 à 10 mois au siège de la Banque Mondiale à Washington D.C., travaillant avec des chercheurs seniors sur des questions critiques de développement. Une allocation mensuelle de vie et un billet d'avion aller-retour sont fournis.",
    langueDetectee: "fr",
    conditions:
      "Être ressortissant d'un pays en développement membre de la Banque Mondiale. Être inscrit en doctorat ou être enseignant-chercheur dans une université d'un pays en développement. Thèse de doctorat ou proposition de recherche sur un sujet d'économie du développement. Être affilié à une institution dans un pays en développement.",
    piecesExigees: JSON.stringify([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "Curriculum Vitae", obligatoire: true },
      { nom: "Proposition de recherche (1500–3000 mots)", obligatoire: true },
      { nom: "Attestation d'inscription en doctorat ou lettre de nomination", obligatoire: true },
      { nom: "Deux lettres de recommandation académiques", obligatoire: true },
      { nom: "Échantillon de publication ou article en cours", obligatoire: false },
    ]),
    exigenceLangue: "Anglais professionnel",
    dateLimite: new Date("2026-12-01"),
    lien: "https://www.worldbank.org/mcnamara",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "gouvernement-benin-merite",
    organisme: "Ministère de l'Enseignement Supérieur — Bénin",
    intitule: "Bourse nationale de mérite — République du Bénin",
    description:
      "La bourse nationale de mérite de la République du Bénin est attribuée aux meilleurs étudiants béninois pour poursuivre des études supérieures à l'étranger ou dans les grandes écoles béninoises. Elle couvre les frais d'inscription, de vie et de voyage selon le pays de destination. Dotation de 150 000 à 350 000 FCFA par mois selon le niveau et la destination.",
    langueDetectee: "fr",
    conditions:
      "Être de nationalité béninoise. Avoir obtenu le BAC avec une mention Bien ou Très Bien, ou être en cycle Master/Doctorat avec un dossier académique d'excellence. Être admis dans un établissement reconnu. Ne pas bénéficier d'une autre bourse du même type.",
    piecesExigees: JSON.stringify([
      { nom: "Demande manuscrite adressée au Ministre", obligatoire: true },
      { nom: "Acte de naissance (copie certifiée)", obligatoire: true },
      { nom: "Certificat de nationalité béninoise", obligatoire: true },
      { nom: "Relevé de notes et diplômes", obligatoire: true },
      { nom: "Lettre d'admission de l'établissement d'accueil", obligatoire: true },
      { nom: "Casier judiciaire de moins de 3 mois", obligatoire: true },
      { nom: "4 photos d'identité", obligatoire: true },
    ]),
    exigenceLangue: "Français",
    dateLimite: new Date("2026-07-15"),
    lien: "https://www.mesrs.bj/bourses",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "usaid-humphrey",
    organisme: "USAID / Bureau des Affaires éducatives et culturelles",
    intitule: "Programme de bourses Hubert H. Humphrey",
    description:
      "Le Programme Hubert H. Humphrey accueille des professionnels de niveau intermédiaire issus de pays désignés aux États-Unis pour une année d'études supérieures non diplômantes et de développement professionnel. Les boursiers sont placés dans des universités américaines et participent à des affiliations professionnelles, des formations en leadership et du réseautage.",
    langueDetectee: "fr",
    conditions:
      "Être citoyen d'un pays participant (pays d'Afrique de l'Ouest éligibles). Professionnel de niveau intermédiaire avec au moins 5 ans d'expérience. Maîtrise de l'anglais (TOEFL 525 papier ou 70 iBT minimum). Être actuellement en activité. Engagement de retour dans le pays d'origine.",
    piecesExigees: JSON.stringify([
      { nom: "Candidature en ligne (portail ambassade)", obligatoire: true },
      { nom: "CV", obligatoire: true },
      { nom: "Deux lettres de recommandation professionnelles", obligatoire: true },
      { nom: "Relevés de notes de tous les diplômes universitaires", obligatoire: true },
      { nom: "Score au test d'anglais (TOEFL)", obligatoire: true },
      { nom: "Déclarations personnelles (3 essais)", obligatoire: true },
      { nom: "Copie du passeport", obligatoire: true },
    ]),
    exigenceLangue: "Anglais — TOEFL 70 iBT minimum",
    dateLimite: new Date("2026-09-01"),
    lien: "https://www.humphreyfellowship.org",
    source: "AGREEE",
    type: "BOURSE",
  },
];

async function main() {
  console.log("🌱 Seed des bourses Matchwork...");

  for (const bourse of bourses) {
    await prisma.opportunite.upsert({
      where: { id: bourse.id },
      update: bourse,
      create: bourse,
    });
  }

  console.log(`✓ ${bourses.length} bourses insérées/mises à jour (toutes en français)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
