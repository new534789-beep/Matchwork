import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererDossierPdf } from "@/lib/pdf/generer-dossier";
import { getProfilActif } from "@/lib/profil/actif";

type Props = { params: Promise<{ id: string }> };

function estEmail(v: string | null | undefined): v is string {
  return !!v && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

/**
 * Envoie le dossier par e-mail via Resend.
 *   mode "self"        → au candidat lui-même (bouton « Recevoir par e-mail »).
 *   mode "candidature" → à l'adresse EXPLICITE de l'offre (canal=email). Jamais devinée.
 * Expéditeur = adresse technique ; « Répondre à » = l'e-mail du candidat ;
 * pièce jointe = le MÊME PDF mis en page que celui du bouton « Télécharger »
 * (voir lib/pdf/generer-dossier.ts) — jamais le texte brut : un recruteur ne
 * doit jamais recevoir un rendu différent de ce que le candidat a vu.
 */
export async function POST(req: Request, { params }: Props) {
  const session = await auth();
  const emailCandidat = session?.user?.email;
  if (!session?.user?.id || !emailCandidat) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { mode } = (await req.json().catch(() => ({}))) as { mode?: string };
  const estCandidature = mode === "candidature";

  const [dossier, profil] = await Promise.all([
    prisma.dossier.findUnique({
      where: { id },
      include: {
        opportunite: { select: { intitule: true, organisme: true, canalCandidature: true, cibleCandidature: true } },
        docsGeneres: { select: { type: true, contenu: true } },
      },
    }),
    getProfilActif(session.user.id),
  ]);
  if (!dossier || dossier.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  // Destinataire — JAMAIS deviné.
  let destinataire: string;
  if (estCandidature) {
    if (dossier.opportunite.canalCandidature !== "email" || !estEmail(dossier.opportunite.cibleCandidature)) {
      return NextResponse.json({ erreur: "Aucune adresse e-mail explicite dans l'offre — postulez via le lien." }, { status: 400 });
    }
    destinataire = dossier.opportunite.cibleCandidature.trim();
  } else {
    destinataire = emailCandidat;
  }

  if (dossier.docsGeneres.length === 0) {
    return NextResponse.json({ erreur: "Aucun document à envoyer." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, erreur: "Envoi e-mail non configuré (RESEND_API_KEY manquante)." }, { status: 200 });
  }
  const from = process.env.EMAIL_EXPEDITEUR || "onboarding@resend.dev";

  const pdfBytes = await genererDossierPdf(dossier, {
    nom: profil?.nomComplet ?? profil?.signature ?? "Candidat",
    signature: profil?.signature ?? profil?.nomComplet ?? "",
    adresse: profil?.adresse ?? null,
    telephone: profil?.telephone ?? null,
    email: profil?.email ?? null,
  });
  const nomFichierPdf = `Matchwork-${dossier.opportunite.organisme.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  const attachments = [{ filename: nomFichierPdf, content: Buffer.from(pdfBytes).toString("base64") }];

  const sujet = estCandidature
    ? `Candidature — ${dossier.opportunite.intitule}`
    : `Votre dossier — ${dossier.opportunite.intitule}`;

  const intro = estCandidature
    ? `Bonjour,<br><br>Veuillez trouver ci-joint ma candidature pour « ${dossier.opportunite.intitule} » (${dossier.opportunite.organisme}). Vous pouvez me répondre directement à cette adresse.<br><br>Cordialement.`
    : `Voici votre dossier pour « ${dossier.opportunite.intitule} » (${dossier.opportunite.organisme}). Les documents sont en pièces jointes.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [destinataire],
        reply_to: emailCandidat,
        subject: sujet,
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">${intro}</div>`,
        attachments,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, erreur: `Échec de l'envoi (${res.status}). ${detail.slice(0, 180)}` },
        { status: 200 },
      );
    }
    return NextResponse.json({ ok: true, destinataire });
  } catch {
    return NextResponse.json({ ok: false, erreur: "Erreur réseau lors de l'envoi." }, { status: 200 });
  }
}
