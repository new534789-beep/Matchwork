// Relance l'ingestion complète (RSS + scrape)
// Usage: node scripts/reingerer.js

// Charger le .env.local pour MISTRAL_API_KEY
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
}

async function main() {
  // Import dynamique ESM-compatible via tsx/ts-node n'est pas dispo ici.
  // On appelle directement via le module compilé. Utilisons le require register.
  // En fait le projet utilise Next.js avec TypeScript — on va utiliser tsx pour exécuter.
  console.log('MISTRAL_API_KEY present:', !!process.env.MISTRAL_API_KEY);
  console.log('DATABASE_URL:', process.env.DATABASE_URL || '(sera override)');

  // On force le DATABASE_URL
  process.env.DATABASE_URL = 'file:C:/Users/hp/reelle mathwork/matchwork/prisma/dev.db';

  const { ingererToutesLesSources } = require('../lib/ingestion/recuperateur');
  const rapport = await ingererToutesLesSources();
  console.log('\n=== RAPPORT INGESTION ===');
  console.log(JSON.stringify(rapport, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
