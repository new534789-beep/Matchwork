import { config } from "dotenv";
config({ path: ".env.local" });
import { prisma } from "@/lib/prisma";

async function main() {
  const total = await prisma.fluxSource.count();
  console.log("Total sources (dev DB):", total);

  const parEtat = await prisma.fluxSource.groupBy({ by: ["etat"], _count: true });
  console.log("Par état:", JSON.stringify(parEtat));

  const parCategorie = await prisma.fluxSource.groupBy({ by: ["categorie"], _count: true });
  console.log("Par catégorie:", JSON.stringify(parCategorie));

  const benin = await prisma.fluxSource.findMany({
    where: {
      OR: [
        { url: { contains: "benin", mode: "insensitive" } },
        { url: { contains: ".bj", mode: "insensitive" } },
        { nom: { contains: "benin", mode: "insensitive" } },
        { nom: { contains: "bénin", mode: "insensitive" } },
      ],
    },
    select: { nom: true, url: true, actif: true, etat: true },
  });
  console.log(`\nSources Bénin (recherche large) : ${benin.length}`);
  benin.forEach((s) => console.log(`  [${s.etat}] ${s.nom} — ${s.url}`));
}

main().finally(() => prisma.$disconnect());
