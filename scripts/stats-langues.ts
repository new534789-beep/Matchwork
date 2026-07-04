import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const all = await p.opportunite.findMany({
    where: { statut: "publiee", actif: true },
    select: { langueDetectee: true },
  });

  const langs = new Map<string, number>();
  for (const o of all) {
    const l = o.langueDetectee || "null";
    langs.set(l, (langs.get(l) || 0) + 1);
  }
  const sorted = [...langs.entries()].sort((a, b) => b[1] - a[1]);
  console.log("=== langueDetectee sur offres publiées ===");
  for (const [l, c] of sorted) console.log(`  ${l}: ${c}`);

  await p.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
