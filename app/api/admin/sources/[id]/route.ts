import { NextResponse } from "next/server";
import { getAdminSession, journaliserActionAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TYPES_OPP } from "@/lib/opportunites";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const b = (await req.json()) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (typeof b.nom === "string") data.nom = b.nom.trim();
  if (typeof b.url === "string") data.url = b.url.trim();
  if (b.type === "rss" || b.type === "xml" || b.type === "scrape") data.type = b.type;
  if (typeof b.categorie === "string" && (TYPES_OPP as readonly string[]).includes(b.categorie)) data.categorie = b.categorie;
  if (typeof b.actif === "boolean") data.actif = b.actif;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ erreur: "Rien à mettre à jour." }, { status: 400 });
  }
  const s = await prisma.fluxSource.update({ where: { id }, data }).catch(() => null);
  if (!s) return NextResponse.json({ erreur: "Source introuvable" }, { status: 404 });
  await journaliserActionAdmin(session.user!.id as string, "source.maj", id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const s = await prisma.fluxSource.delete({ where: { id } }).catch(() => null);
  if (!s) return NextResponse.json({ erreur: "Source introuvable" }, { status: 404 });
  await journaliserActionAdmin(session.user!.id as string, "source.suppression", id);
  return NextResponse.json({ ok: true });
}
