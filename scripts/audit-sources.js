const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:C:/Users/hp/reelle mathwork/matchwork/prisma/dev.db' } } });

async function main() {
  const sources = await prisma.fluxSource.findMany({
    where: { actif: true },
    select: { id: true, nom: true, url: true, type: true, etat: true, categorie: true },
    orderBy: { nom: 'asc' },
  });

  console.log('=== SOURCES RSS ACTIVES ===\n');

  let ok = 0, panne = 0;
  const rss = [], scrape = [];

  for (const s of sources) {
    const tag = s.etat === 'ok' ? 'OK' : 'XX';
    if (s.etat === 'ok') ok++; else panne++;
    const line = `${tag} [${s.type}] ${s.nom.padEnd(35)} | ${s.categorie || '?'} | ${s.url.slice(0, 80)}`;
    if (s.type === 'scrape') scrape.push(line);
    else rss.push(line);
  }

  console.log('--- RSS ---');
  rss.forEach(l => console.log(l));
  console.log('\n--- SCRAPE ---');
  scrape.forEach(l => console.log(l));
  console.log('\n--- BILAN ---');
  console.log('OK:', ok, '| Panne:', panne, '| Total:', sources.length);

  await prisma['$disconnect']();
}
main().catch(e => { console.error(e); process.exit(1); });
