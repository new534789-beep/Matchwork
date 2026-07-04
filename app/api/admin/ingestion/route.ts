import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { retirerExpirees } from "@/lib/ingestion/expiration";
import { getParametre, setParametre } from "@/lib/parametres";

export const maxDuration = 60;

const CLE_RUN = "robot_run_courant";
const CLE_DERNIER = "robot_dernier_run";

type Acc = {
  debutAt: string; finAt?: string;
  creees: number; aValider: number; revueManuelle: number; rejetees: number; doublons: number;
  sourcesOk: number; sourcesPanne: number; sourcesTraitees: number; expirees?: number;
};

function accVide(): Acc {
  return { debutAt: new Date().toISOString(), creees: 0, aValider: 0, revueManuelle: 0, rejetees: 0, doublons: 0, sourcesOk: 0, sourcesPanne: 0, sourcesTraitees: 0 };
}

// Déclenchement manuel (bouton « Récupérer maintenant » / panneau robot).
// Par lots : passer { skip, take } et boucler jusqu'à `termine: true`.
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { action?: string; skip?: number; take?: number };

  if (body.action === "expirer") {
    const expirees = await retirerExpirees();
    return NextResponse.json({ ok: true, expirees });
  }

  const skip = Number(body.skip) || 0;
  const take = body.take ? Number(body.take) : undefined; // undefined = tout d'un coup

  // Au 1er lot : on démarre un nouveau run.
  if (skip === 0) await setParametre(CLE_RUN, JSON.stringify(accVide()));

  const rapport = await ingererToutesLesSources({ skip, take });

  // Accumule ce lot dans le run courant.
  let acc: Acc;
  try { acc = JSON.parse(await getParametre(CLE_RUN, "")) as Acc; } catch { acc = accVide(); }
  acc.creees += rapport.creees;
  acc.aValider += rapport.aValider;
  acc.revueManuelle += rapport.revueManuelle;
  acc.rejetees += rapport.rejetees;
  acc.doublons += rapport.doublons;
  acc.sourcesOk += rapport.details.filter((d) => d.etat === "ok").length;
  acc.sourcesPanne += rapport.sourcesEnPanne;
  acc.sourcesTraitees += rapport.sources;
  await setParametre(CLE_RUN, JSON.stringify(acc));

  const termine = !take || skip + rapport.sources >= rapport.totalActives;
  let expirees = 0;
  if (termine) {
    expirees = await retirerExpirees();
    acc.finAt = new Date().toISOString();
    acc.expirees = expirees;
    await setParametre(CLE_DERNIER, JSON.stringify(acc));
  }

  return NextResponse.json({
    ok: true,
    rapport,
    termine,
    prochainSkip: skip + rapport.sources,
    totalActives: rapport.totalActives,
    ...(termine ? { expirees } : {}),
  });
}
