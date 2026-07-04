import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

// Sources RSS qui sont des blogs — identifiées par audit
const FLUX_A_DESACTIVER = [
  "djeli",
  "Simoon CV (blog)",
];

async function main() {
  for (const nom of FLUX_A_DESACTIVER) {
    const res = await p.fluxSource.updateMany({
      where: { nom: { contains: nom } },
      data: { actif: false, message: "Désactivé : source blog, contenu non pertinent" },
    });
    console.log(`Désactivé "${nom}": ${res.count} source(s)`);
  }

  // Retirer aussi les 3 emplois Spotify/Bosch qui ont été faux-positifs (Podcast, Saisonbedarf)
  // Ce sont de vrais emplois mais "Podcast" et "Saison" ont matché — les republier
  const faux = await p.opportunite.findMany({
    where: {
      statut: "rejetee",
      OR: [
        { intitule: { contains: "Full Stack Engineer - Podcast" } },
        { intitule: { contains: "Saisonbedarf" } },
      ],
    },
    select: { id: true, intitule: true, source: true },
  });

  if (faux.length > 0) {
    const ids = faux.map(f => f.id);
    await p.opportunite.updateMany({
      where: { id: { in: ids } },
      data: { statut: "publiee", actif: true },
    });
    console.log(`\nRepublié ${faux.length} vrais emplois (faux positifs du filtre blog):`);
    for (const f of faux) console.log(`  "${f.intitule.slice(0, 70)}"`);
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
