import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { ReleveInvalide } from "@/lib/orientation/calcul";
import { classer } from "@/lib/orientation/classement";
import { FILIERES_PUBLIQUES } from "@/lib/orientation/donnees";
import type { Serie } from "@/lib/orientation/types";
import { genererPlanOrientationPdf } from "@/lib/pdf/plan-orientation";
import { getProfilActif } from "@/lib/profil/actif";

const SERIES_CONNUES = new Set<string>(FILIERES_PUBLIQUES.flatMap((f) => f.series));

// Comme pour l'explication, on reçoit le relevé et non des moyennes : le
// serveur recalcule tout, donc le PDF ne peut pas contenir de chiffres
// fabriqués par le client.
const schema = z.object({
  serie: z.string().refine((s) => SERIES_CONNUES.has(s), "Série inconnue du guide."),
  moyenneGenerale: z.number().min(0).max(20).nullable().optional(),
  lignes: z
    .array(
      z.object({
        matiere: z.string().min(1).max(120),
        note: z.number().min(0).max(20),
        coefficient: z.number().gt(0).max(20),
        epreuveEcrite: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(30),
  diplome: z.enum(["bac", "dt", "deat"]),
  interets: z.array(z.string().max(40)).max(20),
  priorite: z.enum(["bourse", "passion", "emploi", "proximite"]),
  zone: z.string().max(200),
  explication: z.string().max(4000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  let brut: unknown;
  try {
    brut = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Requête illisible." }, { status: 400 });
  }

  const parse = schema.safeParse(brut);
  if (!parse.success) {
    return NextResponse.json(
      { erreur: parse.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  const d = parse.data;

  // Le nom vient du profil authentifié, jamais du corps de la requête :
  // un client ne peut pas se generer un PDF au nom de quelqu'un d'autre.
  const profil = await getProfilActif(session.user.id);
  const nom = profil?.nomComplet?.trim() || session.user.name?.trim() || null;

  try {
    const releve = {
      serie: d.serie as Serie,
      moyenneGenerale: d.moyenneGenerale ?? undefined,
      lignes: d.lignes,
    };
    const classees = classer(releve, {
      diplome: d.diplome,
      serie: d.serie as Serie,
      interets: d.interets as never[],
      priorite: d.priorite,
      zone: d.zone,
    });

    const octets = await genererPlanOrientationPdf({
      nom,
      serie: d.serie,
      moyenneGenerale: d.moyenneGenerale ?? undefined,
      notes: d.lignes,
      classees,
      explication: d.explication ?? null,
    });

    return new NextResponse(Buffer.from(octets), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="plan-orientation-serie-${d.serie.replace(/[^A-Za-z0-9]/g, "")}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof ReleveInvalide) {
      return NextResponse.json({ erreur: e.message }, { status: 400 });
    }
    console.error("[orientation] génération du PDF échouée", e);
    return NextResponse.json(
      { erreur: "La génération du PDF a échoué." },
      { status: 500 },
    );
  }
}
