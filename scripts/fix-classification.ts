/**
 * Corrige les offres d'emploi/stage mal classées comme BOURSE.
 * Détecte via des mots-clés dans le titre et reclasse en EMPLOI ou STAGE.
 *
 *   npx tsx scripts/fix-classification.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const MOTS_EMPLOI = [
  "recrute", "recrutement", "hiring", "job", "poste", "vacancy",
  "offre d'emploi", "offre d emploi", "we are hiring", "join our team",
  "candidature spontanée", "profils administratifs", "profils techniques",
  "chauffeur", "receveur", "comptable", "secrétaire", "assistant",
  "community manager", "développeur", "designer", "consultant",
];

const MOTS_STAGE = [
  "stagiaire", "stage ", "apprenti", "alternance",
];

const MOTS_BOURSE = [
  "bourse", "scholarship", "fellowship", "grant", "funding",
  "d'excellence", "d'exemption", "d'accueil", "d'études",
];

function detecterType(intitule: string, description: string): "EMPLOI" | "STAGE" | null {
  const titre = intitule.toLowerCase();
  const desc = (description || "").toLowerCase();
  const texte = `${titre} ${desc}`;

  // Description "Poste chez X" = emploi même si le titre dit "scholarship"
  if (desc.startsWith("poste ") || desc.includes("poste chez") || desc.includes("poste au")) {
    return "EMPLOI";
  }

  // Si le titre contient un mot-clé de bourse, ne PAS reclasser
  if (MOTS_BOURSE.some(m => titre.includes(m))) return null;

  if (MOTS_STAGE.some(m => texte.includes(m))) return "STAGE";
  if (MOTS_EMPLOI.some(m => texte.includes(m))) return "EMPLOI";
  return null;
}

async function main() {
  const bourses = await p.opportunite.findMany({
    where: { type: "BOURSE" },
    select: { id: true, intitule: true, description: true, type: true },
  });

  let reclassees = 0;
  const details: string[] = [];

  for (const b of bourses) {
    const nvType = detecterType(b.intitule, b.description);
    if (nvType) {
      await p.opportunite.update({
        where: { id: b.id },
        data: { type: nvType },
      });
      reclassees++;
      details.push(`${nvType} ← "${b.intitule.slice(0, 60)}"`);
    }
  }

  console.log(`Bourses analysées: ${bourses.length}`);
  console.log(`Reclassées: ${reclassees}`);
  details.slice(0, 20).forEach(d => console.log(`  ${d}`));
  if (details.length > 20) console.log(`  ... et ${details.length - 20} autres`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
