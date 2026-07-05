import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { prisma } from "@/lib/prisma";

async function main() {
  const sources = await prisma.fluxSource.findMany({
    select: { id: true, nom: true, type: true, actif: true },
    orderBy: { type: "asc" },
  });
  const byType: Record<string, { total: number; actives: number }> = {};
  for (const s of sources) {
    if (!byType[s.type]) byType[s.type] = { total: 0, actives: 0 };
    byType[s.type].total++;
    if (s.actif) byType[s.type].actives++;
  }
  console.log("Sources par type:");
  for (const [type, c] of Object.entries(byType)) {
    console.log(`  ${type}: ${c.actives} actives / ${c.total} total`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
