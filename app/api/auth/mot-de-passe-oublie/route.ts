import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { normaliserEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const MESSAGE_GENERIQUE = { message: "Si un compte existe avec cet e-mail, un lien de réinitialisation vient d'être envoyé." };
const EXPIRATION_MS = 60 * 60 * 1000; // 1h

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = await rateLimit(`mdp-oublie:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ erreur: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json(MESSAGE_GENERIQUE);

  const email = normaliserEmail(parsed.data.email);

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, motDePasse: true } });
    // Un compte créé uniquement via Google (motDePasse vide) n'a pas de mot de
    // passe à réinitialiser — on renvoie quand même le message générique pour
    // ne jamais révéler si un email existe ou sa méthode de connexion.
    if (user && user.motDePasse) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: { resetTokenHash: tokenHash, resetTokenExpire: new Date(Date.now() + EXPIRATION_MS) },
      });

      const lien = `https://matchworks.app/reinitialiser-mot-de-passe?token=${token}`;
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const from = process.env.EMAIL_EXPEDITEUR || "onboarding@resend.dev";
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: [email],
            subject: "Réinitialisez votre mot de passe Matchwork",
            html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">
              <p>Vous avez demandé à réinitialiser votre mot de passe Matchwork.</p>
              <p><a href="${lien}" style="color:#7c3aed;font-weight:600">Choisir un nouveau mot de passe</a></p>
              <p style="color:#888;font-size:12px">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
            </div>`,
          }),
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Erreur mot-de-passe-oublie:", err);
    // Ne jamais faire échouer côté client : même en cas de panne technique on
    // renvoie le message générique pour ne pas révéler d'information.
  }

  return NextResponse.json(MESSAGE_GENERIQUE);
}
