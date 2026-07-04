import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  // 1. Toutes les offres Djeli Africa
  const djeli = await p.opportunite.findMany({
    where: { organisme: { contains: "Djeli" } },
    select: { id: true, intitule: true, type: true, statut: true },
  });
  console.log(`=== Djeli Africa total: ${djeli.length} ===`);
  for (const o of djeli) console.log(`  [${o.type}] [${o.statut}] "${o.intitule.slice(0, 80)}"`);

  // 2. Sources RSS — trouver les organismes uniques des bourses publiées
  const boursesRSS = await p.opportunite.findMany({
    where: { type: "BOURSE", statut: "publiee", source: "RSS" },
    select: { organisme: true },
  });
  const orgs = new Map<string, number>();
  for (const b of boursesRSS) {
    orgs.set(b.organisme, (orgs.get(b.organisme) || 0) + 1);
  }
  const sorted = [...orgs.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n=== Top organismes BOURSE RSS publiées (${boursesRSS.length} total) ===`);
  for (const [org, cnt] of sorted.slice(0, 30)) console.log(`  ${cnt}x ${org}`);

  // 3. Dates suspectes
  const datesSuspectes = await p.opportunite.findMany({
    where: {
      statut: "publiee", actif: true,
      OR: [
        { dateLimite: { gt: new Date("2028-01-01") } },
        { dateLimite: { lt: new Date("2025-01-01") } },
      ],
    },
    select: { id: true, intitule: true, type: true, dateLimite: true, source: true, organisme: true },
    take: 30,
  });
  console.log(`\n=== Dates suspectes: ${datesSuspectes.length} ===`);
  for (const o of datesSuspectes) console.log(`  [${o.type}] ${o.dateLimite?.toISOString().slice(0,10)} "${o.intitule.slice(0,60)}" org=${o.organisme}`);

  // 4. Descriptions très courtes (< 30 chars) dans bourses publiées
  const bourses = await p.opportunite.findMany({
    where: { type: "BOURSE", statut: "publiee", actif: true },
    select: { id: true, intitule: true, description: true, source: true, organisme: true },
  });
  const descProblemes: string[] = [];
  for (const o of bourses) {
    const d = (o.description || "").trim();
    if (d.length < 30) {
      descProblemes.push(`  [courte] "${o.intitule.slice(0,50)}" desc="${d}" org=${o.organisme}`);
    }
  }
  console.log(`\n=== Bourses description < 30 chars: ${descProblemes.length} ===`);
  for (const e of descProblemes.slice(0, 15)) console.log(e);

  // 5. Titres qui ne ressemblent pas à des offres (blog, événement, actualité)
  const tousPublies = await p.opportunite.findMany({
    where: { statut: "publiee", actif: true },
    select: { id: true, intitule: true, type: true, description: true, source: true, organisme: true },
  });

  const blogMots = [
    "épisode", "episode", "podcast", "saison", "newsletter", "replay",
    "webinaire", "gagnantes", "mauvaises habitudes", "santé",
    "finale grandiose", "quarts de finale", "que s'est-il passé",
    "ce qui s'est passé", "retour sur", "retour en images",
    "top 10", "top 5", "classement", "palmarès",
    "interview exclusive", "à ne pas manquer", "à lire",
  ];

  const blogOffres: { type: string; intitule: string; org: string }[] = [];
  for (const o of tousPublies) {
    const titre = o.intitule.toLowerCase();
    const desc = (o.description || "").toLowerCase();
    if (blogMots.some(m => titre.includes(m) || desc.slice(0, 200).includes(m))) {
      blogOffres.push({ type: o.type, intitule: o.intitule.slice(0, 80), org: o.organisme });
    }
  }
  console.log(`\n=== Contenu blog/événement détecté: ${blogOffres.length} ===`);
  for (const o of blogOffres) console.log(`  [${o.type}] "${o.intitule}" org=${o.org}`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
