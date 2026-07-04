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
    intitule: "Mastercard Foundation Scholars Program",
    description:
      "The Mastercard Foundation Scholars Program provides scholarships to academically talented young people from Africa who have financial need. Scholars receive full tuition, living stipend, accommodation, airfare, and leadership development training. The program is available at partner universities in Africa, the US, UK, and Canada.",
    langueDetectee: "en",
    conditions:
      "Must be a citizen of an African country. Demonstrated academic excellence (GPA ≥ 3.5 or equivalent). Financial need documented. Age 18–35. Commitment to give back to the African continent after graduation.",
    piecesExigees: JSON.stringify([
      { nom: "Completed online application form", obligatoire: true },
      { nom: "Official academic transcripts", obligatoire: true },
      { nom: "Personal statement (500–800 words)", obligatoire: true },
      { nom: "Two letters of recommendation", obligatoire: true },
      { nom: "Proof of financial need", obligatoire: true },
      { nom: "National ID or passport copy", obligatoire: true },
      { nom: "English proficiency (IELTS 6.5+ or TOEFL 90+)", obligatoire: false },
    ]),
    exigenceLangue: "Anglais B2 (IELTS 6.5+)",
    dateLimite: new Date("2026-09-30"),
    lien: "https://mastercardfdn.org/scholars",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "chevening-2026",
    organisme: "UK Foreign, Commonwealth & Development Office",
    intitule: "Chevening Scholarship 2026–2027",
    description:
      "Chevening is the UK government's international awards programme, aimed at developing global leaders. Funded by the Foreign, Commonwealth and Development Office (FCDO), Chevening offers full financial support to study any eligible master's degree course at any UK university. Scholars join a global network of over 50,000 alumni.",
    langueDetectee: "en",
    conditions:
      "Citizen of a Chevening-eligible country. At least 2 years' work experience. Hold an undergraduate degree equivalent to a UK 2:1. Return to your home country for at least 2 years after the scholarship. Not a dual UK national.",
    piecesExigees: JSON.stringify([
      { nom: "Online application via Chevening portal", obligatoire: true },
      { nom: "4 essay questions (500 words each)", obligatoire: true },
      { nom: "Two references (submitted online)", obligatoire: true },
      { nom: "Undergraduate degree certificate", obligatoire: true },
      { nom: "English proficiency (IELTS 6.5 Academic)", obligatoire: true },
      { nom: "CV / Résumé", obligatoire: true },
    ]),
    exigenceLangue: "Anglais — IELTS 6.5 Academic minimum",
    dateLimite: new Date("2026-11-04"),
    lien: "https://www.chevening.org/scholarships",
    source: "AGREEE",
    type: "BOURSE",
  },
  {
    id: "daad-helmut-schmidt",
    organisme: "DAAD — Deutscher Akademischer Austauschdienst",
    intitule: "Helmut-Schmidt-Programm — Master öffentliche Politik (Entwicklungsländer)",
    description:
      "Das Helmut-Schmidt-Programm richtet sich an Nachwuchsführungskräfte aus Entwicklungsländern, die ein Masterstudium in Public Policy oder Politikwissenschaften in Deutschland absolvieren möchten. Die Förderung umfasst monatliche Stipendien, Studiengebühren, Reisekostenbeihilfe, Krankenversicherung und Sprachkurse.",
    langueDetectee: "de",
    conditions:
      "Hochschulabschluss (mindestens Bachelor) mit überdurchschnittlichen Noten. Mindestens zwei Jahre Berufserfahrung. Deutsch B1 oder Englisch B2. Staatsbürgerschaft eines Entwicklungslandes. Rückkehrverpflichtung nach Deutschland-Aufenthalt.",
    piecesExigees: JSON.stringify([
      { nom: "DAAD-Bewerbungsformular (online)", obligatoire: true },
      { nom: "Lebenslauf (tabellarisch)", obligatoire: true },
      { nom: "Motivationsschreiben", obligatoire: true },
      { nom: "Hochschulzeugnisse und Transkripte", obligatoire: true },
      { nom: "Zwei Empfehlungsschreiben", obligatoire: true },
      { nom: "Nachweis Deutschkenntnisse (Goethe B1) oder Englisch (B2)", obligatoire: true },
      { nom: "Lichtbildausweis", obligatoire: true },
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
    organisme: "Mo Ibrahim Foundation",
    intitule: "Ibrahim Leadership Fellowship — African Governance",
    description:
      "The Mo Ibrahim Foundation Fellowship provides an exceptional opportunity for outstanding Africans who want to make a difference on the continent. Fellows work within major African institutions for one year, gaining exposure to senior leadership and governance. The fellowship includes a monthly stipend of $5,000, travel, accommodation, and a dedicated mentor.",
    langueDetectee: "en",
    conditions:
      "African citizen, aged 25–35. Master's degree or higher in a relevant field (governance, economics, law, social sciences). Maximum 5 years of relevant professional experience. Demonstrated commitment to African development. Fluency in at least one African Union official language.",
    piecesExigees: JSON.stringify([
      { nom: "Online application", obligatoire: true },
      { nom: "CV (max 3 pages)", obligatoire: true },
      { nom: "Personal statement on African governance (1000 words)", obligatoire: true },
      { nom: "Three letters of reference", obligatoire: true },
      { nom: "Academic transcripts", obligatoire: true },
      { nom: "Passport copy", obligatoire: true },
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
    intitule: "Robert S. McNamara Fellowships Program",
    description:
      "The World Bank Robert S. McNamara Fellowships Program supports the research of promising development economists and academics from developing countries. Fellows spend 5 to 10 months at the World Bank headquarters in Washington D.C., working with senior researchers on critical development issues. A monthly living allowance and round-trip airfare are provided.",
    langueDetectee: "en",
    conditions:
      "Citizen of a World Bank member developing country. Currently enrolled in a PhD program or faculty member at a university in a developing country. PhD dissertation or research proposal on a development economics topic. Must be affiliated with an institution in a developing country.",
    piecesExigees: JSON.stringify([
      { nom: "Completed online application", obligatoire: true },
      { nom: "Curriculum Vitae", obligatoire: true },
      { nom: "Research proposal (1500–3000 words)", obligatoire: true },
      { nom: "PhD enrollment certificate or faculty appointment letter", obligatoire: true },
      { nom: "Two letters of recommendation from academics", obligatoire: true },
      { nom: "Sample of published or working paper", obligatoire: false },
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
    organisme: "USAID / Bureau of Educational and Cultural Affairs",
    intitule: "Hubert H. Humphrey Fellowship Program",
    description:
      "The Hubert H. Humphrey Fellowship Program brings accomplished mid-level professionals from designated countries to the United States for one year of non-degree graduate study and professional development experiences. Fellows are placed at U.S. universities and engage in professional affiliations, leadership training, and networking.",
    langueDetectee: "en",
    conditions:
      "Citizen of a participating country (West African countries eligible). Mid-level professional with at least 5 years of experience. English proficiency (TOEFL 525 paper or 70 iBT minimum). Currently employed. Committed to return to home country.",
    piecesExigees: JSON.stringify([
      { nom: "Online application (embassy portal)", obligatoire: true },
      { nom: "CV / Resume", obligatoire: true },
      { nom: "Two professional letters of recommendation", obligatoire: true },
      { nom: "Transcripts of all university degrees", obligatoire: true },
      { nom: "English proficiency test score (TOEFL)", obligatoire: true },
      { nom: "Personal statements (3 essays)", obligatoire: true },
      { nom: "Passport copy", obligatoire: true },
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

  console.log(`✓ ${bourses.length} bourses insérées/mises à jour`);
  console.log("  → " + bourses.filter(b => b.langueDetectee === "fr").length + " en français");
  console.log("  → " + bourses.filter(b => b.langueDetectee === "en").length + " en anglais");
  console.log("  → " + bourses.filter(b => b.langueDetectee === "de").length + " en allemand");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
