import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingererToutesLesSources } from "@/lib/ingestion/recuperateur";
import { retirerExpirees } from "@/lib/ingestion/expiration";

export const maxDuration = 60;

/**
 * Calcule un lot (skip/take) à partir du nombre RÉEL de sources actives,
 * réparti sur `diviseur` appels — plutôt que des bornes fixes qui deviennent
 * incomplètes à mesure que le catalogue de sources grossit. `index` va de 0
 * à `diviseur - 1`. Garantit que toute source active est visitée au moins
 * une fois par cycle complet, quel que soit le nombre total de sources.
 */
async function calculerLot(diviseur: number, index: number): Promise<{ skip: number; take: number }> {
  const totalActives = await prisma.fluxSource.count({ where: { actif: true } });
  const taille = Math.max(1, Math.ceil(totalActives / diviseur));
  return { skip: index * taille, take: taille };
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  if (action === "expirer") {
    const expirees = await retirerExpirees();
    return NextResponse.json({ ok: true, expirees });
  }

  const diviseur = url.searchParams.get("diviseur");
  const index = url.searchParams.get("index");
  const { skip, take } = diviseur && index
    ? await calculerLot(parseInt(diviseur, 10), parseInt(index, 10))
    : { skip: parseInt(url.searchParams.get("skip") || "0", 10), take: parseInt(url.searchParams.get("take") || "5", 10) };

  const rapport = await ingererToutesLesSources({ skip, take });
  return NextResponse.json({ ok: true, rapport, lot: { skip, take } });
}
