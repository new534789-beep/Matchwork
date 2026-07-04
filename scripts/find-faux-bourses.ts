import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const bourses = await p.opportunite.findMany({
    where: { type: "BOURSE" },
    select: { id: true, intitule: true, description: true },
  });

  const suspects: { id: string; intitule: string; desc: string; raison: string }[] = [];

  for (const b of bourses) {
    const desc = (b.description || "").toLowerCase();
    const titre = b.intitule.toLowerCase();

    if (desc.includes("poste chez") || desc.includes("poste au") || desc.includes("poste à")) {
      suspects.push({ id: b.id, intitule: b.intitule, desc: desc.slice(0, 80), raison: "desc=poste" });
    } else if (desc.startsWith("poste ")) {
      suspects.push({ id: b.id, intitule: b.intitule, desc: desc.slice(0, 80), raison: "desc commence par Poste" });
    } else if (titre.includes("hiring") || titre.includes("recrute") || titre.includes("job opening")) {
      suspects.push({ id: b.id, intitule: b.intitule, desc: desc.slice(0, 80), raison: "titre emploi" });
    }
  }

  console.log(`Bourses totales: ${bourses.length}`);
  console.log(`Suspects: ${suspects.length}`);
  for (const s of suspects.slice(0, 30)) {
    console.log(`  [${s.raison}] "${s.intitule.slice(0, 60)}" => "${s.desc}"`);
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
