import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { classer } from "@/lib/orientation/classement";
import {
  ExplicationIndisponible,
  construireDonnees,
  expliquer,
} from "@/lib/orientation/explication";
import { FILIERES_PUBLIQUES } from "@/lib/orientation/donnees";
import { ReleveInvalide } from "@/lib/orientation/calcul";
import type { Serie } from "@/lib/orientation/types";

const SERIES_CONNUES = new Set<string>(FILIERES_PUBLIQUES.flatMap((f) => f.series));

// On reçoit le relevé et les préférences, pas des moyennes : le serveur
// recalcule tout lui-même. Un client ne peut donc pas faire commenter des
// chiffres qu'il aurait fabriqués.
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

  try {
    const releve = {
      serie: d.serie as Serie,
      moyenneGenerale: d.moyenneGenerale ?? undefined,
      lignes: d.lignes,
    };
    const classees = classer(releve, {
      diplome: d.diplome,
      serie: d.serie as Serie,
      // Les intérêts inconnus sont ignorés par le moteur de correspondance.
      interets: d.interets as never[],
      priorite: d.priorite,
      zone: d.zone,
    });
    const texte = await expliquer(construireDonnees(releve, classees));
    return NextResponse.json({ explication: texte });
  } catch (e) {
    if (e instanceof ReleveInvalide) {
      return NextResponse.json({ erreur: e.message }, { status: 400 });
    }
    // Explication absente : la page reste parfaitement lisible sans elle.
    if (e instanceof ExplicationIndisponible) {
      console.warn("[orientation] explication écartée :", e.message);
      return NextResponse.json({ explication: null }, { status: 200 });
    }
    console.error("[orientation] explication échouée", e);
    return NextResponse.json({ explication: null }, { status: 200 });
  }
}
