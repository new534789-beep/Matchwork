/**
 * Passe les opportunités expirées en `expiree` (dev). Le serveur doit tourner.
 *
 *   npm run ingest:expirer
 */
export {};

async function main() {
  const base = process.env.MATCHWORK_URL || "http://localhost:3000";
  const secret = process.env.CRON_SECRET;
  const res = await fetch(`${base}/api/cron/ingestion?action=expirer`, {
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error("Échec :", e instanceof Error ? e.message : e, "\n(le serveur de dev tourne-t-il ?)");
  process.exit(1);
});
