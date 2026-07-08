import { NextResponse } from "next/server";
import { getAdminSession, journaliserActionAdmin } from "@/lib/admin";
import { setParametre, CLES_PARAMETRES } from "@/lib/parametres";

const CLES_AUTORISEES: string[] = Object.values(CLES_PARAMETRES);

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }
  const b = (await req.json()) as { reglages?: Record<string, unknown> };
  const reglages = b.reglages ?? {};

  const appliques: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(reglages)) {
    if (CLES_AUTORISEES.includes(cle) && typeof valeur === "string") {
      await setParametre(cle, valeur.trim());
      appliques[cle] = valeur.trim();
    }
  }
  if (Object.keys(appliques).length > 0) {
    await journaliserActionAdmin(session.user!.id as string, "parametres.maj", undefined, appliques);
  }
  return NextResponse.json({ ok: true });
}
