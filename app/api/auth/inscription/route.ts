import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { COOKIE_REF, parserRef } from "@/lib/attribution";

const schema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(8, "Minimum 8 caractères"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = await rateLimit(`inscription:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { erreur: "Trop de tentatives. Réessayez dans 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erreur: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, motDePasse } = parsed.data;

    const existant = await prisma.user.findUnique({ where: { email } });
    if (existant) {
      return NextResponse.json(
        { erreur: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const attribution = parserRef(req.cookies.get(COOKIE_REF)?.value);

    const hash = await bcrypt.hash(motDePasse, 12);
    const user = await prisma.user.create({
      data: {
        email,
        motDePasse: hash,
        profil: { create: {} },
        sourceAcquisition: attribution?.source,
        refAcquisition: attribution?.ref,
      },
      select: { id: true, email: true },
    });

    const reponse = NextResponse.json({ succes: true, userId: user.id }, { status: 201 });
    reponse.cookies.delete(COOKIE_REF);
    return reponse;
  } catch (err) {
    console.error("Erreur inscription:", err);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
