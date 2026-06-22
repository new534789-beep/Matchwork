import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(8, "Minimum 8 caractères"),
});

export async function POST(req: NextRequest) {
  try {
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

    const hash = await bcrypt.hash(motDePasse, 12);
    const user = await prisma.user.create({
      data: {
        email,
        motDePasse: hash,
        profil: { create: {} },
      },
      select: { id: true, email: true },
    });

    return NextResponse.json({ succes: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("Erreur inscription:", err);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}
