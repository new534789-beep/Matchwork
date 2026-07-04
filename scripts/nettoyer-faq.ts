import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const offres = await p.opportunite.findMany({
    where: {
      statut: "publiee",
      actif: true,
      organisme: { in: ["Le blog des étudiants d'Afrique francophone", "Le Boursier"] },
    },
    select: { id: true, intitule: true, organisme: true, description: true },
  });

  console.log(`Total offres de ces sources: ${offres.length}`);

  const idsARetirer: string[] = [];
  for (const o of offres) {
    const t = o.intitule.toLowerCase();
    const d = (o.description || "").toLowerCase().slice(0, 300);

    const estFAQ =
      t.includes("faut-il") || t.includes("peut-on") ||
      t.includes("est-il possible") || t.includes("8 étapes") ||
      t.includes("étapes pour") || t.includes("comment ") ||
      t.includes("04 des meilleures") || t.includes("05 des meilleures") ||
      t.includes("financer sa thèse") || t.includes("bourses d'excellence pour écoles");

    const descGuide =
      d.startsWith("le texte présente") || d.startsWith("vous devez absolument") ||
      d.includes("les meilleures écoles d'ingénieur en france offrent");

    if (estFAQ || descGuide) {
      idsARetirer.push(o.id);
      console.log(`  RETIRER: "${o.intitule.slice(0, 80)}"`);
    } else {
      console.log(`  GARDER:  "${o.intitule.slice(0, 80)}"`);
    }
  }

  if (idsARetirer.length > 0) {
    const res = await p.opportunite.updateMany({
      where: { id: { in: idsARetirer } },
      data: { statut: "rejetee", actif: false },
    });
    console.log(`\n${res.count} offres blog/FAQ retirées`);
  }

  const n = await p.opportunite.count({ where: { type: "BOURSE", statut: "publiee", actif: true } });
  console.log(`Bourses restantes: ${n}`);

  await p.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
