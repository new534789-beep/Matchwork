import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  // 1. Sources suspectes (blog, boursier)
  const allFlux = await p.fluxSource.findMany({
    select: { id: true, nom: true, url: true, categorie: true, actif: true },
  });

  console.log("=== Sources suspectes (blog/boursier) ===");
  for (const f of allFlux) {
    const n = f.nom.toLowerCase();
    const u = f.url.toLowerCase();
    if (n.includes("blog") || n.includes("boursier") || u.includes("blog")) {
      console.log(`  [${f.actif ? "ON" : "OFF"}] [${f.categorie}] "${f.nom}" => ${f.url}`);
    }
  }

  // 2. Top organismes bourses
  const bourses = await p.opportunite.findMany({
    where: { type: "BOURSE", statut: "publiee", actif: true },
    select: { organisme: true },
  });
  const orgs = new Map<string, number>();
  for (const b of bourses) orgs.set(b.organisme, (orgs.get(b.organisme) || 0) + 1);
  const sorted = [...orgs.entries()].sort((a, b) => b[1] - a[1]);
  console.log("\n=== Top organismes BOURSE publiées ===");
  for (const [org, cnt] of sorted.slice(0, 30)) console.log(`  ${cnt}x ${org}`);

  // 3. Echantillon d'offres de chaque organisme suspect
  const orgsSuspects = sorted
    .filter(([org]) => {
      const l = org.toLowerCase();
      return l.includes("blog") || l.includes("boursier") || l.includes("info") || l.includes("étudiant");
    })
    .map(([org]) => org);

  if (orgsSuspects.length > 0) {
    console.log("\n=== Echantillon offres organismes suspects ===");
    for (const org of orgsSuspects) {
      const sample = await p.opportunite.findMany({
        where: { organisme: org, statut: "publiee", actif: true, type: "BOURSE" },
        select: { intitule: true, description: true },
        take: 3,
      });
      console.log(`\n  --- ${org} ---`);
      for (const o of sample) {
        console.log(`  Titre: "${o.intitule.slice(0, 80)}"`);
        console.log(`  Desc: "${(o.description || "").slice(0, 150)}"`);
      }
    }
  }

  // 4. Offres en langues étrangères (titre contient des caractères non-latins ou des mots clés)
  const toutes = await p.opportunite.findMany({
    where: { statut: "publiee", actif: true },
    select: { id: true, intitule: true, type: true, description: true },
  });

  let nonFr = 0;
  for (const o of toutes) {
    const t = o.intitule;
    // Detect German, English, Chinese, Korean, Arabic, etc.
    if (/[一-鿿]/.test(t) || /[가-힯]/.test(t) || /[؀-ۿ]/.test(t)) {
      if (nonFr < 10) console.log(`\n  NON-LATIN [${o.type}] "${t.slice(0, 70)}"`);
      nonFr++;
    }
  }

  // Count offers with German/English keywords
  let enCount = 0;
  let deCount = 0;
  for (const o of toutes) {
    const t = o.intitule.toLowerCase();
    if (/\b(engineer|manager|developer|analyst|assistant|coordinator|specialist|intern|senior)\b/.test(t)) enCount++;
    if (/\b(praktikum|werkstudent|mitarbeiter|sachbearbeiter|ausbildung)\b/.test(t)) deCount++;
  }
  console.log(`\n=== Langues détectées ===`);
  console.log(`  Non-latin: ${nonFr}`);
  console.log(`  Anglais (mots-clés): ${enCount}`);
  console.log(`  Allemand (mots-clés): ${deCount}`);

  await p.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
