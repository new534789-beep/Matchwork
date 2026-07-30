import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { COOKIE_REF, parserRef } from "@/lib/attribution";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ─── Résilience aux coupures passagères de la base ───────────────────────────
// Neon (serverless) peut refuser des connexions quelques secondes : réveil de
// la branche après mise en veille, redémarrage du pooler après une rotation de
// mot de passe, pic de charge saturant le pool. Ces erreurs sont TRANSITOIRES.
// Sans reprise, la moindre seconde d'indisponibilité fait échouer une connexion
// utilisateur — et, pire, le callback signIn la traduisait en « Accès refusé »
// (voir plus bas), message qui laisse croire à un bannissement.
const CODES_TRANSITOIRES = ["P1001", "P1002", "P1008", "P1017", "P2024"];

function estErreurTransitoire(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as { name?: string; code?: string; message?: string };
  if (err.name === "PrismaClientInitializationError") return true;
  if (err.code && CODES_TRANSITOIRES.includes(err.code)) return true;
  return /can't reach database server|connection pool|connection closed/i.test(err.message ?? "");
}

/** Rejoue `fn` sur erreur transitoire de base (backoff court). Relance l'erreur d'origine si elle persiste. */
async function avecReprise<T>(fn: () => Promise<T>, tentatives = 3): Promise<T> {
  let derniere: unknown;
  for (let i = 0; i < tentatives; i++) {
    try {
      return await fn();
    } catch (e) {
      derniere = e;
      if (!estErreurTransitoire(e) || i === tentatives - 1) throw e;
      await new Promise((r) => setTimeout(r, 250 * (i + 1)));
    }
  }
  throw derniere;
}

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

      // Reprise sur coupure passagère : sans elle, une seconde d'indisponibilité
      // de la base se présentait à l'utilisateur comme « identifiants invalides ».
      const user = await avecReprise(() => prisma.user.findUnique({ where: { email: parsed.data.email } }));
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
      allowDangerousEmailAccountLinking: false,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
          // upsert ne dit pas s'il a créé ou juste relu — on distingue nous-mêmes
          // pour ne poser l'attribution d'acquisition qu'à la toute première
          // connexion (jamais réécrite sur les connexions suivantes).
          const existant = await avecReprise(() => prisma.user.findUnique({ where: { email } }));
          let dbUser = existant;
          if (!dbUser) {
            // Attribution d'acquisition : OPTIONNELLE. La lecture du cookie via
            // next/headers cookies() peut lever une exception selon le contexte
            // dans lequel Auth.js invoque ce callback (hors du scope de requête
            // Next lors du callback OAuth) — c'était la cause du « ACCÈS refusé »
            // sur la connexion Google. Elle ne doit JAMAIS empêcher la création
            // du compte ni la connexion : on dégrade proprement en « sans
            // attribution ».
            let attribution: { source: string; ref: string } | null = null;
            try {
              attribution = parserRef((await cookies()).get(COOKIE_REF)?.value);
            } catch (e) {
              console.warn("[auth] cookie d'attribution ignoré:", (e as Error)?.message);
            }
            dbUser = await avecReprise(() =>
              prisma.user.create({
                data: {
                  email,
                  motDePasse: "",
                  profils: { create: {} },
                  sourceAcquisition: attribution?.source,
                  refAcquisition: attribution?.ref,
                },
              })
            );
          }
          if (dbUser.suspendu) return false;
          user.id = dbUser.id;
          (user as { plan?: string; role?: string }).plan = dbUser.plan;
          (user as { plan?: string; role?: string }).role = dbUser.role;
        } catch (e) {
          const err = e as Error;
          console.error("[auth] signIn callback error:", err?.name, err?.message, e);
          // `return false` signifie « cet utilisateur n'a PAS le droit de se
          // connecter » → Auth.js affiche « Accès refusé / Vous n'avez pas la
          // permission de vous connecter ». C'est faux et alarmant quand la
          // cause est une panne technique (base injoignable) : l'utilisateur
          // croit être banni alors qu'il suffirait de réessayer. On ne renvoie
          // donc `false` que pour un vrai refus (compte suspendu, e-mail
          // manquant — traités plus haut) et on relance l'erreur technique,
          // qu'Auth.js présentera comme une erreur temporaire.
          throw e;
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
