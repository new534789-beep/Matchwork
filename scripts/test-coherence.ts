import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const SIGNAUX_EMPLOI = [
  "recrute", "recrutement", "hiring", "we are hiring", "join our team",
  "offre d'emploi", "offre d emploi", "poste à pourvoir",
  "candidature spontanée", "poste chez", "vacancy",
];

const SIGNAUX_BOURSE = [
  "bourse d'étude", "bourse d'excellence", "scholarship", "fellowship",
  "bourse de recherche", "aide financière", "financement doctoral",
  "funding opportunity", "grant for",
];

function verifierCoherence(type: string, intitule: string, description: string) {
  const titre = intitule.toLowerCase();
  const desc = (description || "").toLowerCase().slice(0, 500);
  const texte = `${titre} ${desc}`;

  if (type === "BOURSE") {
    if (desc.startsWith("poste ") || desc.includes("poste chez")) {
      return { coherent: false, raison: "Type BOURSE mais description d'emploi (poste chez...)" };
    }
    const aSignalEmploi = SIGNAUX_EMPLOI.some((s) => texte.includes(s));
    const aSignalBourse = SIGNAUX_BOURSE.some((s) => texte.includes(s));
    if (aSignalEmploi && !aSignalBourse && !titre.includes("bourse") && !titre.includes("scholarship")) {
      return { coherent: false, raison: "Type BOURSE mais contenu d'emploi détecté" };
    }
  }

  if (type === "EMPLOI" || type === "STAGE") {
    const aSignalBourse = SIGNAUX_BOURSE.some((s) => texte.includes(s));
    const aSignalEmploi = SIGNAUX_EMPLOI.some((s) => texte.includes(s));
    if (aSignalBourse && !aSignalEmploi && (titre.includes("bourse") || titre.includes("scholarship"))) {
      return { coherent: false, raison: `Type ${type} mais contenu de bourse détecté` };
    }
  }

  return { coherent: true };
}

async function main() {
  const publiees = await p.opportunite.findMany({
    where: { statut: "publiee", actif: true },
    select: { id: true, type: true, intitule: true, description: true },
  });

  console.log(`Offres publiées actives: ${publiees.length}`);

  const incoherentes: { type: string; intitule: string; raison: string }[] = [];
  for (const o of publiees) {
    const res = verifierCoherence(o.type, o.intitule, o.description);
    if (!res.coherent) {
      incoherentes.push({ type: o.type, intitule: o.intitule.slice(0, 70), raison: res.raison! });
    }
  }

  console.log(`Incohérentes détectées: ${incoherentes.length}`);
  for (const i of incoherentes.slice(0, 20)) {
    console.log(`  [${i.type}] "${i.intitule}" => ${i.raison}`);
  }
  if (incoherentes.length > 20) console.log(`  ... et ${incoherentes.length - 20} autres`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
