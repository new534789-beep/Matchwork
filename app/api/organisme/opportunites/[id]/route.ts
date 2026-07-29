import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaEdit = z.object({
  type: z.enum(["BOURSE", "EMPLOI", "STAGE", "FORMATION", "ADMISSION", "RECOMPENSE", "APPEL_PROJET"]).optional(),
  intitule: z.string().min(5).max(500).optional(),
  description: z.string().min(20).max(10000).optional(),
  conditions: z.string().max(5000).optional(),
  dateLimite: z.string().optional(),
  lien: z.string().url().max(1000).optional(),
  actif: z.boolean().optional(),
});

// Une offre du portail B2B n'appartient à l'organisme connecté que si son
// libellé `organisme` correspond au sien ET qu'elle vient bien de ce canal
// (même convention que GET/POST /api/organisme/opportunites) — empêche de
// modifier une offre d'un autre organisme ou une offre ingérée ailleurs.
async function opportuniteDeLOrganisme(id: string, organismeNom: string) {
  return prisma.opportunite.findFirst({ where: { id, organisme: organismeNom, source: "portail_b2b" } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  const organisme = await prisma.organisme.findUnique({ where: { userId: session.user.id } });
  if (!organisme) return NextResponse.json({ erreur: "Organisme introuvable" }, { status: 403 });

  const { id } = await params;
  const existante = await opportuniteDeLOrganisme(id, organisme.nom);
  if (!existante) return NextResponse.json({ erreur: "Offre introuvable" }, { status: 404 });

  const parsed = schemaEdit.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ erreur: "Données invalides", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.type !== undefined) data.type = d.type;
  if (d.intitule !== undefined) data.intitule = d.intitule.trim();
  if (d.description !== undefined) data.description = d.description.trim();
  if (d.conditions !== undefined) data.conditions = d.conditions.trim() || null;
  if (d.dateLimite !== undefined) data.dateLimite = d.dateLimite ? new Date(d.dateLimite) : null;
  if (d.lien !== undefined) data.lien = d.lien.trim() || null;
  // Une offre retirée (actif=false) ne redevient jamais "publiee" toute seule :
  // si l'organisme n'est pas vérifié, remettre en ligne repasse par validation.
  if (d.actif !== undefined) {
    data.actif = d.actif;
    if (d.actif) data.statut = organisme.verifie ? "publiee" : "a_valider";
    else data.statut = "rejetee";
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ erreur: "Rien à mettre à jour." }, { status: 400 });
  }

  const opp = await prisma.opportunite.update({ where: { id }, data });
  return NextResponse.json(opp);
}
