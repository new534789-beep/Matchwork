import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Appelé par le scénario Make après publication effective sur Facebook, pour
// marquer l'article comme relayé (garde-fou anti double-post le lendemain).
export async function POST(req: Request) {
  const secret = process.env.MAKE_BLOG_INGEST_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const id = typeof b?.id === "string" ? b.id : null;
  if (!id) return NextResponse.json({ erreur: "id requis" }, { status: 400 });

  await prisma.article
    .update({ where: { id }, data: { facebookPostedLe: new Date() } })
    .catch((err) => console.error("[fb-mark] échec du marquage de l'article", id, err));

  return NextResponse.json({ ok: true });
}
