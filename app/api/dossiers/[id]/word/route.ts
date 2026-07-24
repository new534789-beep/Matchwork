import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererDossierWord, labelDoc } from "@/lib/word/generer-dossier";
import { getProfilActif } from "@/lib/profil/actif";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifie" }, { status: 401 });
  }

  const { id } = await params;
  const docId = new URL(req.url).searchParams.get("docId");

  const [dossier, profil] = await Promise.all([
    prisma.dossier.findUnique({
      where: { id },
      include: {
        opportunite: { select: { intitule: true, organisme: true, dateLimite: true } },
        docsGeneres: true,
      },
    }),
    getProfilActif(session.user.id),
  ]);

  if (!dossier || dossier.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  // docId présent → n'exporter QUE ce document (bouton par document) ; absent → dossier complet.
  const docsGeneres = docId ? dossier.docsGeneres.filter((d) => d.id === docId) : dossier.docsGeneres;
  if (docsGeneres.length === 0) {
    return NextResponse.json({ erreur: "Aucun document genere" }, { status: 400 });
  }

  const buffer = await genererDossierWord(
    { ...dossier, docsGeneres },
    {
      nom: profil?.nomComplet ?? profil?.signature ?? "Candidat",
      signature: profil?.signature ?? profil?.nomComplet ?? "",
      adresse: profil?.adresse ?? null,
      telephone: profil?.telephone ?? null,
      email: profil?.email ?? null,
    }
  );

  const organisme = dossier.opportunite.organisme.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = docId && docsGeneres[0]
    ? `Matchwork-${labelDoc(docsGeneres[0].type).replace(/[^a-zA-Z0-9]/g, "_")}-${organisme}.docx`
    : `Matchwork-${organisme}.docx`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
