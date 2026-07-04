import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { getParametre } from "@/lib/parametres";
import { RobotPanel } from "@/components/admin/RobotPanel";

export const dynamic = "force-dynamic";

export default async function PageRobot() {
  const [aValider, actives, ok, panne, inconnu, dernierRaw] = await Promise.all([
    prisma.opportunite.count({ where: { statut: { in: ["a_valider", "revue_manuelle"] } } }),
    prisma.fluxSource.count({ where: { actif: true } }),
    prisma.fluxSource.count({ where: { actif: true, etat: "ok" } }),
    prisma.fluxSource.count({ where: { actif: true, etat: "panne" } }),
    prisma.fluxSource.count({ where: { actif: true, etat: "inconnu" } }),
    getParametre("robot_dernier_run", ""),
  ]);

  let dernier = null;
  try { dernier = dernierRaw ? JSON.parse(dernierRaw) : null; } catch { dernier = null; }

  return (
    <>
      <EnteteAdmin titre="Robot de collecte" sousTitre="État du robot et déclenchement de la collecte (RSS + scraping)" />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full" style={{ maxWidth: 900 }}>
        <RobotPanel initial={{ aValider, actives, ok, panne, inconnu, dernier }} />
      </main>
    </>
  );
}
