import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { setParametre, CLES_PARAMETRES } from "@/lib/parametres";

const CLES_AUTORISEES: string[] = Object.values(CLES_PARAMETRES);

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const b = (await req.json()) as { reglages?: Record<string, unknown> };
  const reglages = b.reglages ?? {};

  for (const [cle, valeur] of Object.entries(reglages)) {
    if (CLES_AUTORISEES.includes(cle) && typeof valeur === "string") {
      await setParametre(cle, valeur.trim());
    }
  }
  return NextResponse.json({ ok: true });
}
