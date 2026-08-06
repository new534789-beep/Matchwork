import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  motDePasse: z.string().min(8, "Minimum 8 caractères"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = await rateLimit(`reinit-mdp:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ erreur: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ erreur: parsed.error.errors[0].message }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  const user = await prisma.user.findUnique({
    where: { resetTokenHash: tokenHash },
    select: { id: true, resetTokenExpire: true },
  });

  if (!user || !user.resetTokenExpire || user.resetTokenExpire < new Date()) {
    return NextResponse.json({ erreur: "Ce lien est invalide ou a expiré. Refaites une demande." }, { status: 400 });
  }

  const hash = await bcrypt.hash(parsed.data.motDePasse, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { motDePasse: hash, resetTokenHash: null, resetTokenExpire: null },
  });

  return NextResponse.json({ succes: true });
}
