import { PrismaClient } from '@prisma/client';

const DB = 'postgresql://neondb_owner:npg_RDgAmsG3nZi9@ep-empty-grass-as9bylpg.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require';
process.env.DATABASE_URL = DB;
process.env.DIRECT_URL = DB;

const p = new PrismaClient({ datasourceUrl: DB });

async function count() {
  const total = await p.opportunite.count();
  const actives = await p.opportunite.count({ where: { actif: true } });
  const aValider = await p.opportunite.count({ where: { statut: 'a_valider' } });
  const byType = await p.$queryRaw`SELECT type, COUNT(*)::int as count FROM opportunites GROUP BY type ORDER BY count DESC`;
  return { total, actives, aValider, byType };
}

try {
  console.log('=== AVANT ===');
  const avant = await count();
  console.log(JSON.stringify(avant, null, 2));
} catch(e) {
  console.error(e);
} finally {
  await p.$disconnect();
}
