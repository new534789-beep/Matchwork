import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TYPES_OPP } from "@/lib/opportunites";

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const b = (await req.json()) as Record<string, string | undefined>;
  const nom = (b.nom ?? "").trim();
  const url = (b.url ?? "").trim();
  if (!nom || !url) {
    return NextResponse.json({ erreur: "Nom et URL requis." }, { status: 400 });
  }
  const type = ["rss", "xml", "scrape"].includes(b.type ?? "") ? (b.type as string) : "rss";
  const categorie = (TYPES_OPP as readonly string[]).includes(b.categorie ?? "") ? (b.categorie as string) : "BOURSE";
  const s = await prisma.fluxSource.create({ data: { nom, url, type, categorie } });
  return NextResponse.json({
    ok: true,
    source: { id: s.id, nom: s.nom, url: s.url, type: s.type, categorie: s.categorie, actif: s.actif, etat: s.etat, dernierFetch: null },
  });
}
