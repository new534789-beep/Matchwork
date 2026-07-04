/**
 * Désigne un utilisateur comme administrateur (rôle « admin »).
 *
 *   npm run admin:designer -- <email>
 *
 * Le compte doit déjà exister (s'inscrire d'abord dans l'app). Après exécution,
 * l'utilisateur doit se RECONNECTER pour que son JWT contienne le rôle « admin ».
 */
import { PrismaClient } from "@prisma/client";

// En dev, tsx ne charge pas .env.local : on retombe sur la base locale si besoin
// (Prisma résout ce chemin relativement au dossier prisma/).
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim();
  if (!email) {
    console.error("Usage : npm run admin:designer -- <email>");
    process.exit(1);
  }

  const existant = await prisma.user.findUnique({ where: { email } });
  if (!existant) {
    console.error(`Aucun utilisateur avec l'email « ${email} ». Crée d'abord le compte dans l'app, puis relance.`);
    process.exit(1);
  }

  if (existant.role === "admin") {
    console.log(`${email} est déjà admin. Rien à faire.`);
    return;
  }

  await prisma.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`OK : ${email} est maintenant admin. Reconnecte-toi pour rafraîchir ta session.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
