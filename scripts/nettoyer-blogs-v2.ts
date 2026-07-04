import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

// Sources RSS qui sont des blogs déguisés en sites de bourses
const FLUX_A_DESACTIVER = [
  "leboursier",
];

// Organismes dont le contenu est principalement du blog/article
const ORGANISMES_BLOG = [
  "Le blog des étudiants d'Afrique francophone",
  "Le Boursier",
];

// Mots dans le titre/description qui indiquent un article, pas une offre
const SIGNAUX_ARTICLE = [
  "voici comment", "comment rédiger", "comment faire",
  "parcours d'excellence", "parcours académique",
  "coordonnées des ambassades", "liste de", "liste des",
  "questions-réponses", "ouvre le premier campus",
  "questions fréquentes", "conseils pour",
];

async function main() {
  // 1. Désactiver la source "leboursier"
  for (const nom of FLUX_A_DESACTIVER) {
    const res = await p.fluxSource.updateMany({
      where: { nom: { contains: nom }, actif: true },
      data: { actif: false, message: "Désactivé : contenu blog, pas de vraies offres" },
    });
    console.log(`Source désactivée "${nom}": ${res.count}`);
  }

  // 2. Examiner les offres des organismes blog
  let totalRetirees = 0;
  for (const org of ORGANISMES_BLOG) {
    const offres = await p.opportunite.findMany({
      where: { organisme: org, statut: "publiee", actif: true },
      select: { id: true, intitule: true, description: true, type: true },
    });

    const idsARetirer: string[] = [];
    for (const o of offres) {
      const titre = o.intitule.toLowerCase();
      const desc = (o.description || "").toLowerCase().slice(0, 300);

      // Si c'est un article/guide et pas une vraie offre
      const estArticle = SIGNAUX_ARTICLE.some((s) => titre.includes(s) || desc.includes(s));
      // Description qui commence par "Article" ou contient des patterns blog
      const descBlog = desc.startsWith("article ") || desc.includes("cet article") ||
        desc.includes("j'ai procédé") || desc.includes("dans cet article");
      // Titre qui est un guide/liste, pas une offre
      const titreGuide = titre.includes("cv de demande") || titre.includes("comment le rédiger") ||
        titre.includes("parcours d'excellence") || titre.includes("coordonnées des");

      if (estArticle || descBlog || titreGuide) {
        idsARetirer.push(o.id);
        console.log(`  BLOG [${o.type}] "${o.intitule.slice(0, 70)}"`);
      }
    }

    if (idsARetirer.length > 0) {
      const res = await p.opportunite.updateMany({
        where: { id: { in: idsARetirer } },
        data: { statut: "rejetee", actif: false },
      });
      console.log(`  => ${res.count} offres retirées de "${org}"`);
      totalRetirees += res.count;
    } else {
      console.log(`  Aucun article détecté pour "${org}" (${offres.length} offres)`);
    }

    // Afficher les offres restantes pour vérification
    const restantes = offres.filter((o) => !idsARetirer.includes(o.id));
    if (restantes.length > 0) {
      console.log(`\n  Offres conservées de "${org}" (${restantes.length}):`);
      for (const o of restantes) {
        console.log(`    [${o.type}] "${o.intitule.slice(0, 80)}"`);
        console.log(`      Desc: "${(o.description || "").slice(0, 120)}"`);
      }
    }
  }

  // 3. Résumé
  const nBourses = await p.opportunite.count({ where: { type: "BOURSE", statut: "publiee", actif: true } });
  const nEmplois = await p.opportunite.count({ where: { type: "EMPLOI", statut: "publiee", actif: true } });
  console.log(`\n=== RÉSUMÉ ===`);
  console.log(`  Offres retirées: ${totalRetirees}`);
  console.log(`  Bourses restantes: ${nBourses}`);
  console.log(`  Emplois restants: ${nEmplois}`);

  await p.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
