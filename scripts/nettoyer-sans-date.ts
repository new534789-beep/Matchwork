import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const avant = await prisma.opportunite.count();
  const sansDate = await prisma.opportunite.findMany({
    where: { dateLimite: null },
    select: { id: true, intitule: true },
  });

  console.log(`Total offres : ${avant}`);
  console.log(`Sans date limite : ${sansDate.length}`);

  if (sansDate.length === 0) {
    console.log("Rien à supprimer.");
    return;
  }

  for (const o of sansDate) {
    await prisma.documentGenere.deleteMany({ where: { dossier: { opportuniteId: o.id } } });
    await prisma.dossier.deleteMany({ where: { opportuniteId: o.id } });
    await prisma.interaction.deleteMany({ where: { opportuniteId: o.id } });
  }

  const { count } = await prisma.opportunite.deleteMany({ where: { dateLimite: null } });
  console.log(`Supprimées : ${count}`);

  const apres = await prisma.opportunite.count();
  console.log(`Restantes : ${apres}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
export {};
