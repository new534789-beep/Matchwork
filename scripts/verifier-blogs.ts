import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const TITRES_BLOG = [
  "épisode", "episode", "podcast", "newsletter", "replay",
  "webinaire", "miss université", "finale grandiose",
  "quarts de finale", "que s'est-il passé", "ce qui s'est passé",
  "retour sur", "retour en images", "top 10 des", "top 5 des",
  "interview exclusive", "grandes gagnantes", "excellentes pour votre",
  "un grand défi relevé", "la dernière ligne droite",
  "mauvaises habitudes", "voici les résultats",
  "l'article ", "chill & pro", "chill et pro",
];

const DESC_BLOG = [
  "l'article ", "cet article", "dans cet épisode",
  "lire la suite sur", "lire l'article",
  "retrouvez notre", "abonnez-vous",
  "notre rédaction", "notre journaliste",
];

async function main() {
  const publiees = await p.opportunite.findMany({
    where: { statut: "publiee", actif: true },
    select: { id: true, type: true, intitule: true, description: true },
  });
  console.log(`Total publiees actives: ${publiees.length}`);

  let blogCount = 0;
  for (const o of publiees) {
    const titre = o.intitule.toLowerCase();
    const desc = (o.description || "").toLowerCase().slice(0, 300);

    let found = false;
    for (const m of TITRES_BLOG) {
      if (titre.includes(m)) {
        console.log(`  BLOG-TITRE [${o.type}] "${o.intitule.slice(0, 70)}" motif=${m}`);
        blogCount++;
        found = true;
        break;
      }
    }
    if (!found) {
      for (const m of DESC_BLOG) {
        if (desc.includes(m)) {
          console.log(`  BLOG-DESC  [${o.type}] "${o.intitule.slice(0, 70)}" motif=${m}`);
          blogCount++;
          break;
        }
      }
    }
  }

  // Bourses avec descriptions courtes
  const boursesCourtes = publiees.filter(
    (o) => o.type === "BOURSE" && (o.description || "").trim().length < 30,
  );
  console.log(`\nBourses description < 30 chars: ${boursesCourtes.length}`);
  for (const o of boursesCourtes.slice(0, 10)) {
    console.log(`  "${o.intitule.slice(0, 60)}" desc="${(o.description || "").slice(0, 30)}"`);
  }

  // Bourses description = titre
  const boursesDoublons = publiees.filter(
    (o) =>
      o.type === "BOURSE" &&
      o.description &&
      o.description.trim().toLowerCase() === o.intitule.trim().toLowerCase(),
  );
  console.log(`\nBourses description = titre: ${boursesDoublons.length}`);

  console.log(`\nTotal contenu blog détecté: ${blogCount}`);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
