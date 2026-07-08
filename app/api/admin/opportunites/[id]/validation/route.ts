import { NextResponse } from "next/server";
import { getAdminSession, journaliserActionAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// Approuver (→ publiee, visible dans le fil) ou rejeter (→ rejetee) une opportunité en attente.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const { action, dateLimite } = (await req.json()) as { action?: string; dateLimite?: string };

  if (action !== "approuver" && action !== "rejeter") {
    return NextResponse.json({ erreur: "Action invalide" }, { status: 400 });
  }

  const statut = action === "approuver" ? "publiee" : "rejetee";

  // À l'approbation, l'admin peut fixer/corriger la date limite à la main
  // (utile pour les items « revue manuelle » dont la date était absente/incertaine).
  const data: { statut: string; actif: boolean; dateLimite?: Date } = {
    statut,
    actif: action === "approuver",
  };
  if (action === "approuver" && dateLimite) {
    const d = new Date(dateLimite);
    if (!isNaN(d.getTime())) data.dateLimite = d;
  }

  const opp = await prisma.opportunite
    .update({ where: { id }, data })
    .catch(() => null);

  if (!opp) return NextResponse.json({ erreur: "Opportunité introuvable" }, { status: 404 });
  await journaliserActionAdmin(session.user!.id as string, `opportunite.${action}`, id);
  return NextResponse.json({ ok: true, statut });
}
