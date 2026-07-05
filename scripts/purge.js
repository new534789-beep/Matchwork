const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:C:/Users/hp/reelle mathwork/matchwork/prisma/dev.db' } } });

async function main() {
  const delDocs = await prisma.documentGenere.deleteMany({});
  console.log('Documents generes supprimes:', delDocs.count);

  const delDossiers = await prisma.dossier.deleteMany({});
  console.log('Dossiers supprimes:', delDossiers.count);

  const delInteractions = await prisma.interaction.deleteMany({});
  console.log('Interactions supprimees:', delInteractions.count);

  const delOpps = await prisma.opportunite.deleteMany({});
  console.log('Opportunites supprimees:', delOpps.count);

  console.log('\nBase purgee. Pret pour re-ingestion.');
  await prisma['$disconnect']();
}

main().catch(e => { console.error(e); process.exit(1); });
