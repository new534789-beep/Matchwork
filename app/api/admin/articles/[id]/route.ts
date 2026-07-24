import { NextResponse } from "next/server";
import { getAdminSession, journaliserActionAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// Éditer un article (statut publie/archive, titre, extrait, etc.).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const b = (await req.json()) as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (typeof b.statut === "string" && ["publie", "archive"].includes(b.statut)) data.statut = b.statut;
  if (typeof b.titre === "string") data.titre = b.titre.trim();
  if (typeof b.extrait === "string") data.extrait = b.extrait.trim();
  if (typeof b.contenu === "string") data.contenu = b.contenu.trim();
  if (typeof b.categorie === "string") data.categorie = b.categorie.trim() || null;
  if (typeof b.imageCouverture === "string") data.imageCouverture = b.imageCouverture.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ erreur: "Rien à mettre à jour." }, { status: 400 });
  }

  const article = await prisma.article.update({ where: { id }, data }).catch(() => null);
  if (!article) return NextResponse.json({ erreur: "Article introuvable" }, { status: 404 });
  await journaliserActionAdmin(session.user!.id as string, "article.maj", id, data);
  return NextResponse.json({ ok: true });
}

// Suppression définitive.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const article = await prisma.article.delete({ where: { id } }).catch(() => null);
  if (!article) return NextResponse.json({ erreur: "Article introuvable" }, { status: 404 });
  await journaliserActionAdmin(session.user!.id as string, "article.suppression", id);
  return NextResponse.json({ ok: true });
}
