/**
 * Simule une ingestion (à la place du futur module RSS) : crée quelques
 * opportunités au statut « a_valider » pour tester la file de validation.
 *
 *   npm run ingestion:demo
 */
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

const J = (n: number) => new Date(Date.now() + n * 86400000);

const EXEMPLES = [
  {
    type: "BOURSE",
    organisme: "Fondation Mo Ibrahim",
    intitule: "Bourse de leadership pour jeunes Africains 2026",
    description:
      "Programme de bourses destiné aux jeunes leaders d'Afrique de l'Ouest souhaitant poursuivre un master en gouvernance et politiques publiques. Couvre les frais de scolarité et une allocation mensuelle.",
    source: "RSS_DEMO",
    lien: "https://exemple.org/bourse-mo-ibrahim",
    langueDetectee: "fr",
    dateLimite: J(45),
    piecesExigees: JSON.stringify([
      { nom: "CV", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
    ]),
  },
  {
    type: "FORMATION",
    organisme: "DAAD",
    intitule: "Programme de formation courte en énergies renouvelables",
    description:
      "Formation intensive de 3 mois en Allemagne sur les énergies renouvelables, ouverte aux ingénieurs francophones. Bourse partielle incluse.",
    source: "RSS_DEMO",
    lien: "https://exemple.org/daad-energies",
    langueDetectee: "fr",
    dateLimite: J(20),
    piecesExigees: JSON.stringify([
      { nom: "CV", obligatoire: true },
      { nom: "Diplôme d'ingénieur", obligatoire: true },
    ]),
  },
  {
    type: "EMPLOI",
    organisme: "Banque Ouest-Africaine de Développement",
    intitule: "Analyste junior en financement de projets",
    description:
      "La BOAD recrute un analyste junior pour son département financement de projets. Poste basé à Lomé, contrat de 2 ans renouvelable.",
    source: "RSS_DEMO",
    lien: "https://exemple.org/boad-analyste",
    langueDetectee: "fr",
    dateLimite: J(12),
    piecesExigees: JSON.stringify([{ nom: "CV", obligatoire: true }]),
  },
];

async function main() {
  for (const e of EXEMPLES) {
    await prisma.opportunite.create({ data: { ...e, statut: "a_valider", actif: false } });
  }
  console.log(`OK : ${EXEMPLES.length} opportunités « à valider » créées (simulation d'ingestion). Va sur /admin/validation.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
