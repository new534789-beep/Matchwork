/**
 * Reclassifie les opportunités mal catégorisées et désactive les contenus non-pertinents.
 *
 *   npx tsx scripts/reclassifier-tout.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

// --- Mots-clés de détection ---

const MOTS_STAGE = [
  "stagiaire", "stage ", "stage/", "internship", "intern ", "apprenti", "alternance",
];
const MOTS_FORMATION = [
  "formation", "mooc", "certification", "training programme", "workshop",
  "programme de développement", "bootcamp", "masterclass",
];
const MOTS_ADMISSION = [
  "admission", "post utme", "utme/de", "jupeb", "ijmb", "hnd form",
  "nd form", "inscription", "pre-degree", "screening form",
];
const MOTS_RECOMPENSE = [
  "award", "prix ", "prize", "récompense", "competition", "challenge ",
  "hackathon", "hackathon ", "accelerator", "grant prize",
];
const MOTS_EMPLOI = [
  "recrute", "recrutement", "hiring", "job", "poste", "vacancy",
  "offre d'emploi", "offre d emploi", "we are hiring", "join our team",
  "consultant", "officer", "manager", "coordinator", "director",
  "analyst", "engineer", "developer", "specialist",
];
const MOTS_BOURSE = [
  "bourse", "scholarship", "fellowship", "funded", "fully-funded",
  "d'excellence", "d'exemption", "d'accueil", "d'études", "stipend",
];

// Contenus non-opportunités (blog, actu, événements passés)
const MOTS_POUBELLE = [
  "chill & pro", "orathon", "miss université", "mauvaises habitudes",
  "premier épisode", "quarts de finale", "coupures d'électricité",
  "grande gagnante", "expérience qui confirme",
];

function detecterType(
  intitule: string,
  description: string,
  typeActuel: string
): string | "SUPPRIMER" | null {
  const titre = intitule.toLowerCase();
  const desc = (description || "").toLowerCase();
  const texte = `${titre} ${desc}`;

  // Contenu non-pertinent → désactiver
  if (MOTS_POUBELLE.some((m) => titre.includes(m))) return "SUPPRIMER";

  // Si le type actuel est déjà correct d'après le titre, ne pas toucher
  if (typeActuel === "BOURSE" && MOTS_BOURSE.some((m) => titre.includes(m))) return null;
  if (typeActuel === "EMPLOI" && MOTS_EMPLOI.some((m) => titre.includes(m))) return null;

  // Reclassification
  if (MOTS_ADMISSION.some((m) => texte.includes(m))) return "ADMISSION";
  if (MOTS_STAGE.some((m) => texte.includes(m))) return "STAGE";
  if (MOTS_FORMATION.some((m) => titre.includes(m))) return "FORMATION";
  if (MOTS_RECOMPENSE.some((m) => titre.includes(m))) return "RECOMPENSE";
  if (typeActuel === "BOURSE" && MOTS_EMPLOI.some((m) => texte.includes(m))) return "EMPLOI";

  return null;
}

async function main() {
  const toutes = await p.opportunite.findMany({
    where: { actif: true },
    select: { id: true, intitule: true, description: true, type: true },
  });

  let reclassees = 0;
  let desactivees = 0;
  const details: string[] = [];

  for (const o of toutes) {
    const nvType = detecterType(o.intitule, o.description || "", o.type);

    if (nvType === "SUPPRIMER") {
      await p.opportunite.update({
        where: { id: o.id },
        data: { actif: false },
      });
      desactivees++;
      details.push(`DESACTIVEE ← "${o.intitule.slice(0, 60)}"`);
    } else if (nvType && nvType !== o.type) {
      await p.opportunite.update({
        where: { id: o.id },
        data: { type: nvType },
      });
      reclassees++;
      details.push(`${o.type} → ${nvType} ← "${o.intitule.slice(0, 60)}"`);
    }
  }

  console.log(`\nOpportunités analysées: ${toutes.length}`);
  console.log(`Reclassées: ${reclassees}`);
  console.log(`Désactivées (non-pertinentes): ${desactivees}`);
  console.log("\nDétails:");
  details.slice(0, 50).forEach((d) => console.log(`  ${d}`));
  if (details.length > 50) console.log(`  ... et ${details.length - 50} autres`);

  // Résumé final
  const types = await p.opportunite.groupBy({
    by: ["type"],
    where: { actif: true },
    _count: true,
  });
  console.log("\n=== Répartition finale ===");
  for (const t of types) console.log(`  ${t.type}: ${t._count}`);

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
