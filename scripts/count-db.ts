import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { prisma } from "@/lib/prisma";

async function main() {
  const total = await prisma.opportunite.count();
  const publiees = await prisma.opportunite.count({ where: { statut: "publiee" } });
  const aValider = await prisma.opportunite.count({ where: { statut: "a_valider" } });
  const rejetees = await prisma.opportunite.count({ where: { statut: "rejetee" } });
  console.log(`Total: ${total} | Publiees: ${publiees} | A valider: ${aValider} | Rejetees: ${rejetees}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
