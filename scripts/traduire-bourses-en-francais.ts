/**
 * Script unique : traduit toutes les opportunités non-françaises en français.
 * Exécuter : npx tsx scripts/traduire-bourses-en-francais.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Traductions manuelles des bourses connues en anglais/allemand dans le seed
const TRADUCTIONS: Record<string, Partial<{
  intitule: string;
  description: string;
  conditions: string;
  piecesExigees: string;
}>> = {
  "mastercard-scholars": {
    intitule: "Programme de bourses Mastercard Foundation",
    description:
      "Le Programme de bourses Mastercard Foundation offre des bourses aux jeunes Africains talentueux académiquement et ayant des besoins financiers. Les boursiers bénéficient d'une prise en charge complète : frais de scolarité, allocation de vie, hébergement, billet d'avion et formation en leadership. Le programme est disponible dans des universités partenaires en Afrique, aux États-Unis, au Royaume-Uni et au Canada.",
    conditions:
      "Être citoyen d'un pays africain. Excellence académique démontrée (moyenne ≥ 3.5 ou équivalent). Besoin financier documenté. Âge 18–35 ans. Engagement à contribuer au continent africain après l'obtention du diplôme.",
    piecesExigees: JSON.stringify([
      { nom: "Formulaire de candidature en ligne", obligatoire: true },
      { nom: "Relevés de notes officiels", obligatoire: true },
      { nom: "Déclaration personnelle (500–800 mots)", obligatoire: true },
      { nom: "Deux lettres de recommandation", obligatoire: true },
      { nom: "Preuve de besoin financier", obligatoire: true },
      { nom: "Copie de la carte d'identité ou du passeport", obligatoire: true },
      { nom: "Certificat de langue anglaise (IELTS 6.5+ ou TOEFL 90+)", obligatoire: false },
    ]),
  },
  "chevening-2026": {
    intitule: "Bourse Chevening 2026–2027 — Master au Royaume-Uni",
    description:
      "Chevening est le programme de bourses international du gouvernement britannique, visant à former les futurs leaders mondiaux. Financé par le Foreign, Commonwealth and Development Office (FCDO), Chevening offre un soutien financier complet pour étudier un Master éligible dans n'importe quelle université britannique. Les boursiers rejoignent un réseau mondial de plus de 50 000 anciens.",
    conditions:
      "Être citoyen d'un pays éligible à Chevening. Au moins 2 ans d'expérience professionnelle. Détenir un diplôme de licence équivalent à un 2:1 britannique. Retourner dans son pays d'origine pendant au moins 2 ans après la bourse. Ne pas avoir la double nationalité britannique.",
    piecesExigees: JSON.stringify([
      { nom: "Candidature en ligne via le portail Chevening", obligatoire: true },
      { nom: "4 questions essai (500 mots chacune)", obligatoire: true },
      { nom: "Deux références (soumises en ligne)", obligatoire: true },
      { nom: "Certificat de licence", obligatoire: true },
      { nom: "Certificat d'anglais (IELTS 6.5 Academic)", obligatoire: true },
      { nom: "CV", obligatoire: true },
    ]),
  },
  "daad-helmut-schmidt": {
    intitule: "Programme Helmut-Schmidt — Master en politiques publiques (Allemagne)",
    description:
      "Le Programme Helmut-Schmidt s'adresse aux jeunes cadres des pays en développement souhaitant effectuer un Master en politiques publiques ou sciences politiques en Allemagne. Le financement comprend une allocation mensuelle, les frais de scolarité, une aide aux frais de voyage, l'assurance maladie et des cours de langue.",
    conditions:
      "Diplôme universitaire (au moins licence) avec d'excellentes notes. Au moins deux ans d'expérience professionnelle. Allemand B1 ou Anglais B2. Citoyenneté d'un pays en développement. Obligation de retour après le séjour en Allemagne.",
    piecesExigees: JSON.stringify([
      { nom: "Formulaire de candidature DAAD (en ligne)", obligatoire: true },
      { nom: "CV (format tabulaire)", obligatoire: true },
      { nom: "Lettre de motivation", obligatoire: true },
      { nom: "Diplômes et relevés de notes", obligatoire: true },
      { nom: "Deux lettres de recommandation", obligatoire: true },
      { nom: "Certificat de langue (Goethe B1 ou Anglais B2)", obligatoire: true },
      { nom: "Pièce d'identité avec photo", obligatoire: true },
    ]),
  },
  "mo-ibrahim-fellowship": {
    intitule: "Bourse Ibrahim Leadership — Gouvernance africaine",
    description:
      "La Bourse de la Fondation Mo Ibrahim offre une opportunité exceptionnelle aux Africains remarquables souhaitant faire la différence sur le continent. Les boursiers travaillent au sein d'institutions africaines majeures pendant un an, bénéficiant d'une exposition au leadership de haut niveau et à la gouvernance. La bourse comprend une allocation mensuelle de 5 000 $, le transport, l'hébergement et un mentor dédié.",
    conditions:
      "Citoyen africain, âgé de 25 à 35 ans. Master ou diplôme supérieur dans un domaine pertinent (gouvernance, économie, droit, sciences sociales). Maximum 5 ans d'expérience professionnelle pertinente. Engagement démontré envers le développement africain. Maîtrise d'au moins une langue officielle de l'Union Africaine.",
    piecesExigees: JSON.stringify([
      { nom: "Candidature en ligne", obligatoire: true },
      { nom: "CV (3 pages maximum)", obligatoire: true },
      { nom: "Déclaration personnelle sur la gouvernance africaine (1000 mots)", obligatoire: true },
      { nom: "Trois lettres de référence", obligatoire: true },
      { nom: "Relevés de notes", obligatoire: true },
      { nom: "Copie du passeport", obligatoire: true },
    ]),
  },
};

async function main() {
  console.log("Traduction des bourses non-françaises en français…");

  // 1. Mettre à jour les entrées connues par ID ou intitulé anglais
  const INTITULES_EN: Record<string, string> = {
    "mastercard-scholars": "Mastercard Foundation Scholars Program",
    "chevening-2026": "Chevening Scholarship 2026–2027",
    "daad-helmut-schmidt": "Helmut-Schmidt-Programm — Master öffentliche Politik (Entwicklungsländer)",
    "mo-ibrahim-fellowship": "Ibrahim Leadership Fellowship — African Governance",
  };

  for (const [id, trad] of Object.entries(TRADUCTIONS)) {
    // Essayer par ID
    let exists = await prisma.opportunite.findUnique({ where: { id } });
    if (exists) {
      await prisma.opportunite.update({
        where: { id },
        data: { ...trad, langueDetectee: "fr" },
      });
      console.log(`  ✓ Traduit (par ID): ${id}`);
      continue;
    }
    // Essayer par intitulé anglais
    const oldTitle = INTITULES_EN[id];
    if (oldTitle) {
      const byTitle = await prisma.opportunite.findFirst({ where: { intitule: oldTitle } });
      if (byTitle) {
        await prisma.opportunite.update({
          where: { id: byTitle.id },
          data: { ...trad, langueDetectee: "fr" },
        });
        console.log(`  ✓ Traduit (par intitulé): ${oldTitle} → ${trad.intitule}`);
      }
    }
  }

  // 2. Forcer langueDetectee = "fr" sur TOUTES les entrées restantes
  const result = await prisma.opportunite.updateMany({
    where: { langueDetectee: { not: "fr" } },
    data: { langueDetectee: "fr" },
  });
  console.log(`  ✓ ${result.count} entrées supplémentaires marquées "fr"`);

  console.log("Terminé.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
