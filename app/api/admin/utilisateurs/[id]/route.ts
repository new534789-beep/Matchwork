import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// Suspendre / réactiver un compte, ou changer son plan.
// On ne touche JAMAIS au contenu du coffre-fort.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const b = (await req.json()) as { suspendu?: unknown; plan?: unknown };

  const cible = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!cible) return NextResponse.json({ erreur: "Utilisateur introuvable" }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (typeof b.suspendu === "boolean") {
    if (cible.role === "admin" && b.suspendu) {
      return NextResponse.json({ erreur: "Impossible de suspendre un administrateur." }, { status: 400 });
    }
    data.suspendu = b.suspendu;
  }

  if (typeof b.plan === "string" && ["gratuit", "payant"].includes(b.plan)) {
    data.plan = b.plan;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ erreur: "Rien à mettre à jour." }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
