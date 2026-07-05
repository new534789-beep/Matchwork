/**
 * Traduit en français les offres déjà en base (affichage 100% français).
 *   npm run offres:traduire          → traduit celles dont la langue détectée n'est pas "fr"
 *   npm run offres:traduire -- --tout → tente la traduction de TOUTES les offres visibles
 *
 * N'invente rien ; un champ déjà en français est conservé. La langue d'origine
 * (langueDetectee) n'est pas modifiée (elle sert à rédiger le dossier).
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { Mistral } from "@mistralai/mistralai";

// Charge .env.local (tsx ne le fait pas) pour DATABASE_URL + MISTRAL_API_KEY.
try {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* pas de .env.local */ }
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";

const prisma = new PrismaClient();
const apiKey = process.env.MISTRAL_API_KEY;

const SYS = `Tu es un traducteur professionnel. Traduis FIDÈLEMENT en français les champs fournis (INTITULE, DESCRIPTION, CONDITIONS).
Si un champ est déjà en français, renvoie-le TEL QUEL. Ne résume pas, ne reformule pas, n'invente RIEN.
Réponds en JSON strict : {"intitule":"...","description":"...","conditions":"..."} ("conditions" vaut "" si absent).`;

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function traduire(client: Mistral, o: { intitule: string; description: string; conditions: string | null }) {
  const src = [
    `INTITULE: ${o.intitule}`,
    `DESCRIPTION: ${o.description}`,
    o.conditions ? `CONDITIONS: ${o.conditions}` : "",
  ].filter(Boolean).join("\n\n").slice(0, 9000);
  const res = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "system", content: SYS }, { role: "user", content: src }],
    responseFormat: { type: "json_object" },
  });
  const raw = (res.choices?.[0]?.message?.content as string) ?? "";
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  const p = JSON.parse(m[0]) as { intitule?: string; description?: string; conditions?: string };
  if (!p.intitule && !p.description) return null;
  return {
    intitule: (p.intitule || o.intitule).slice(0, 240),
    description: (p.description || o.description).slice(0, 4000),
    conditions: p.conditions ? p.conditions.slice(0, 2000) : o.conditions,
  };
}

async function main() {
  if (!apiKey) { console.error("MISTRAL_API_KEY manquante (.env.local)."); process.exit(1); }
  const tout = process.argv.includes("--tout");
  const client = new Mistral({ apiKey });

  const where: Record<string, unknown> = { statut: { in: ["a_valider", "revue_manuelle", "publiee"] } };
  if (!tout) where.langueDetectee = { notIn: ["fr"] };

  const offres = await prisma.opportunite.findMany({
    where,
    select: { id: true, intitule: true, description: true, conditions: true, langueDetectee: true },
  });

  console.log(`${offres.length} offre(s) à traiter${tout ? " (mode --tout)" : " (langue ≠ fr)"}…`);
  let ok = 0, skip = 0, err = 0;

  for (let i = 0; i < offres.length; i++) {
    const o = offres[i];
    if (o.langueDetectee === "fr" && !tout) { skip++; continue; }
    try {
      const tr = await traduire(client, { intitule: o.intitule, description: o.description, conditions: o.conditions });
      if (tr) {
        await prisma.opportunite.update({ where: { id: o.id }, data: { intitule: tr.intitule, description: tr.description, conditions: tr.conditions } });
        ok++;
      } else skip++;
    } catch {
      err++;
    }
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${offres.length} (traduits ${ok}, erreurs ${err})`);
    await dormir(250);
  }

  console.log(`\nOK : ${ok} traduites, ${skip} ignorées, ${err} erreurs.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
