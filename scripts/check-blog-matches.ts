import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const r = await p.opportunite.findMany({
    where: {
      statut: "publiee",
      actif: true,
      description: { contains: "cet article" },
      type: "BOURSE",
    },
    select: { id: true, intitule: true, description: true, organisme: true, source: true },
  });

  for (const o of r) {
    console.log("---");
    console.log("Titre:", o.intitule);
    console.log("Org:", o.organisme);
    console.log("Source:", o.source);
    console.log("Desc:", (o.description || "").slice(0, 400));
  }

  // Also check the Podcast emploi
  const podcast = await p.opportunite.findMany({
    where: {
      statut: "publiee",
      actif: true,
      intitule: { contains: "Podcast" },
    },
    select: { id: true, intitule: true, organisme: true, source: true },
  });
  console.log("\n--- Emplois avec 'Podcast' ---");
  for (const o of podcast) {
    console.log(`  "${o.intitule}" org=${o.organisme} source=${o.source}`);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
