import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

// Sources RSS qui sont des blogs, pas des sites de bourses/emplois
const SOURCES_BLOG = [
  "Djeli Africa",
];

// Mots dans le titre qui indiquent du contenu blog/article, pas une offre
const TITRES_BLOG = [
  "épisode", "episode", "podcast", "saison",
  "newsletter", "replay", "webinaire",
  "miss université", "mauvaises habitudes",
  "finale grandiose", "quarts de finale",
  "que s'est-il passé", "ce qui s'est passé",
  "retour sur", "retour en images",
  "top 10 des", "top 5 des",
  "interview exclusive",
  "grandes gagnantes",
  "excellentes pour votre",
  "un premier épisode",
  "un grand défi relevé",
  "la dernière ligne droite",
];

async function main() {
  // 1. Lister toutes les FluxSource
  const flux = await p.fluxSource.findMany({
    select: { id: true, nom: true, url: true, categorie: true, actif: true },
  });
  console.log("=== Toutes les FluxSource ===");
  for (const f of flux) console.log(`  [${f.actif ? "ON" : "OFF"}] [${f.categorie}] "${f.nom}" => ${f.url}`);

  // 2. Désactiver les sources blog
  let desactivees = 0;
  for (const f of flux) {
    if (SOURCES_BLOG.some(s => f.nom.toLowerCase().includes(s.toLowerCase()))) {
      await p.fluxSource.update({ where: { id: f.id }, data: { actif: false, message: "Désactivé : source blog, pas d'offres" } });
      desactivees++;
      console.log(`\n  DÉSACTIVÉE: "${f.nom}"`);
    }
  }

  // 3. Supprimer du fil toutes les offres des sources blog
  const offresBlog = await p.opportunite.findMany({
    where: {
      statut: "publiee",
      actif: true,
      fluxSource: { nom: { in: SOURCES_BLOG } },
    },
    select: { id: true, intitule: true, organisme: true },
  });

  // Aussi chercher par organisme au cas où fluxSourceId est null
  const offresParOrg = await p.opportunite.findMany({
    where: {
      statut: "publiee",
      actif: true,
      organisme: { in: SOURCES_BLOG },
    },
    select: { id: true, intitule: true, organisme: true },
  });

  const idsARetirer = new Set([...offresBlog.map(o => o.id), ...offresParOrg.map(o => o.id)]);
  console.log(`\n=== Offres de sources blog à retirer: ${idsARetirer.size} ===`);
  for (const o of [...offresBlog, ...offresParOrg]) {
    console.log(`  "${o.intitule.slice(0, 70)}" org=${o.organisme}`);
  }

  if (idsARetirer.size > 0) {
    const res = await p.opportunite.updateMany({
      where: { id: { in: [...idsARetirer] } },
      data: { statut: "rejetee", actif: false },
    });
    console.log(`  => ${res.count} offres retirées du fil`);
  }

  // 4. Détecter et retirer les titres blog dans TOUTES les offres publiées
  const toutesPubliees = await p.opportunite.findMany({
    where: { statut: "publiee", actif: true },
    select: { id: true, intitule: true, type: true, organisme: true },
  });

  const idsTitresBlog: string[] = [];
  for (const o of toutesPubliees) {
    const titre = o.intitule.toLowerCase();
    if (TITRES_BLOG.some(m => titre.includes(m))) {
      idsTitresBlog.push(o.id);
      console.log(`  BLOG: [${o.type}] "${o.intitule.slice(0, 70)}" org=${o.organisme}`);
    }
  }

  if (idsTitresBlog.length > 0) {
    const res = await p.opportunite.updateMany({
      where: { id: { in: idsTitresBlog } },
      data: { statut: "rejetee", actif: false },
    });
    console.log(`  => ${res.count} offres blog retirées du fil`);
  }

  // 5. Résumé
  const totalRetire = idsARetirer.size + idsTitresBlog.length;
  console.log(`\n=== RÉSUMÉ ===`);
  console.log(`  Sources RSS désactivées: ${desactivees}`);
  console.log(`  Offres retirées (source blog): ${idsARetirer.size}`);
  console.log(`  Offres retirées (titre blog): ${idsTitresBlog.length}`);
  console.log(`  Total retiré: ${totalRetire}`);

  // 6. État final
  const nBourses = await p.opportunite.count({ where: { type: "BOURSE", statut: "publiee", actif: true } });
  const nEmplois = await p.opportunite.count({ where: { type: "EMPLOI", statut: "publiee", actif: true } });
  console.log(`\n  Bourses restantes: ${nBourses}`);
  console.log(`  Emplois restants: ${nEmplois}`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
