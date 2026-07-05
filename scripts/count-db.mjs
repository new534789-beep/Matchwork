import { config } from "dotenv";
config({ path: ".env.local" });

const { PrismaClient } = await import("./prisma-import.mjs");
const p = new PrismaClient();
const total = await p.opportunite.count();
const publiees = await p.opportunite.count({ where: { statut: "publiee" } });
const aValider = await p.opportunite.count({ where: { statut: "a_valider" } });
const rejetees = await p.opportunite.count({ where: { statut: "rejetee" } });
console.log(`Total: ${total} | Publiees: ${publiees} | A valider: ${aValider} | Rejetees: ${rejetees}`);
await p.$disconnect();
