import { NextResponse } from "next/server";
import { getAdminSession, journaliserActionAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TYPES_OPP } from "@/lib/opportunites";

// Éditer une opportunité, ou la retirer / remettre en ligne (champ `actif` + `statut`).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const b = (await req.json()) as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (typeof b.intitule === "string") data.intitule = b.intitule.trim();
  if (typeof b.organisme === "string") data.organisme = b.organisme.trim();
  if (typeof b.description === "string") data.description = b.description.trim();
  if (typeof b.type === "string" && (TYPES_OPP as readonly string[]).includes(b.type)) data.type = b.type;
  if (typeof b.lien === "string") data.lien = b.lien.trim() || null;
  if (typeof b.conditions === "string") data.conditions = b.conditions.trim() || null;
  if (typeof b.exigenceLangue === "string") data.exigenceLangue = b.exigenceLangue.trim() || null;
  if (typeof b.langueDetectee === "string") data.langueDetectee = b.langueDetectee.trim() || null;
  if (typeof b.dateLimite === "string") data.dateLimite = b.dateLimite ? new Date(b.dateLimite) : null;
  if (typeof b.statut === "string" && ["a_valider", "publiee", "expiree", "rejetee"].includes(b.statut)) data.statut = b.statut;
  if (typeof b.actif === "boolean") data.actif = b.actif;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ erreur: "Rien à mettre à jour." }, { status: 400 });
  }

  const opp = await prisma.opportunite.update({ where: { id }, data }).catch(() => null);
  if (!opp) return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  await journaliserActionAdmin(session.user!.id as string, "opportunite.maj", id, data);
  return NextResponse.json({ ok: true });
}

// Suppression définitive (rare — préférer « retirer » via PATCH actif=false).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const opp = await prisma.opportunite.delete({ where: { id } }).catch(() => null);
  if (!opp) return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  await journaliserActionAdmin(session.user!.id as string, "opportunite.suppression", id);
  return NextResponse.json({ ok: true });
}
