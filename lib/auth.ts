import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function hasGoogleAuth(): boolean {
  return !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (!user || !user.motDePasse) return null;

      const valid = await bcrypt.compare(parsed.data.password, user.motDePasse);
      if (!valid) return null;
      if (user.suspendu) return null; // compte suspendu : connexion bloquée

      return { id: user.id, email: user.email, plan: user.plan, role: user.role };
    },
  }),
];

// Provider Google ajouté uniquement si configuré (évite un crash sans clés)
if (hasGoogleAuth()) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  providers,
  callbacks: {
    // À la connexion Google : on s'assure qu'un utilisateur (+ profil) existe en base
    // Exécuté uniquement côté Node (handler de connexion), jamais dans le middleware Edge.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;
        try {
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, motDePasse: "", profil: { create: {} } },
          });
          if (dbUser.suspendu) return false;
          user.id = dbUser.id;
          (user as { plan?: string; role?: string }).plan = dbUser.plan;
          (user as { plan?: string; role?: string }).role = dbUser.role;
        } catch (e) {
          console.error("[auth] signIn callback error:", e);
          return false;
        }
      }
      return true;
    },
    // Sans Prisma : ce callback tourne aussi dans le middleware Edge.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.plan = (user as { plan?: string }).plan;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { plan?: string }).plan = token.plan as string;
        (session.user as { role?: string }).role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
});
