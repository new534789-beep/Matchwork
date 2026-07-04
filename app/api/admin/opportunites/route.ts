import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TYPES_OPP } from "@/lib/opportunites";

// Ajout manuel d'une opportunité vérifiée → publiée directement (ne passe pas par la file).
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  const b = (await req.json()) as Record<string, string | undefined>;
  const intitule = (b.intitule ?? "").trim();
  const organisme = (b.organisme ?? "").trim();
  const description = (b.description ?? "").trim();

  if (!intitule || !organisme || !description) {
    return NextResponse.json({ erreur: "Intitulé, organisme et description sont requis." }, { status: 400 });
  }

  const type = (TYPES_OPP as readonly string[]).includes(b.type ?? "") ? (b.type as string) : "BOURSE";

  const opp = await prisma.opportunite.create({
    data: {
      type,
      organisme,
      intitule,
      description,
      source: "MANUEL",
      lien: b.lien?.trim() || null,
      conditions: b.conditions?.trim() || null,
      exigenceLangue: b.exigenceLangue?.trim() || null,
      langueDetectee: b.langueDetectee?.trim() || "fr",
      dateLimite: b.dateLimite ? new Date(b.dateLimite) : null,
      statut: "publiee",
      actif: true,
    },
  });

  return NextResponse.json({ ok: true, id: opp.id });
}
