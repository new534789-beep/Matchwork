import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_PROMPT_ONBOARDING } from "@/lib/ia/prompts/onboarding";
import { rateLimit } from "@/lib/rate-limit";

// Champs réellement stockables dans le modèle Profil (protège contre les clés
// inattendues renvoyées par l'IA — une clé inconnue ferait planter Prisma).
const CHAMPS_PROFIL = new Set([
  "nomComplet", "dateNaissance", "lieuNaissance", "nationalite", "telephone", "adresse", "email", "signature", "linkedin",
  "bio", "formations", "experiences", "competences", "langues", "objectifs", "tonSouhaite",
]);

// Champs-listes stockés en JSON ; les autres champs valides sont du texte simple.
const CHAMPS_TABLEAU = new Set(["formations", "experiences", "competences", "langues"]);

// Convertit n'importe quelle valeur renvoyée par l'IA en texte lisible
// (l'IA renvoie parfois un objet/tableau là où on attend une chaîne).
function versTexte(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(versTexte).filter(Boolean).join(", ");
  if (typeof v === "object") return Object.values(v as Record<string, unknown>).map(versTexte).filter(Boolean).join(" · ");
  return String(v);
}

function parseTableau(val: unknown): unknown[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

function parseProfil(profil: Record<string, unknown>) {
  return {
    nomComplet: profil.nomComplet,
    dateNaissance: profil.dateNaissance,
    lieuNaissance: profil.lieuNaissance,
    nationalite: profil.nationalite,
    telephone: profil.telephone,
    adresse: profil.adresse,
    email: profil.email,
    signature: profil.signature,
    linkedin: profil.linkedin,
    bio: profil.bio,
    formations: parseTableau(profil.formations),
    experiences: parseTableau(profil.experiences),
    competences: parseTableau(profil.competences),
    langues: parseTableau(profil.langues),
    objectifs: profil.objectifs,
    tonSouhaite: profil.tonSouhaite,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const rl = await rateLimit(`onboarding:${session.user.id}`, 20, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { erreur: "Trop de messages. Attendez une minute." },
      { status: 429 }
    );
  }

  if (!hasMistralKey()) {
    return NextResponse.json({
      message: "L'IA n'est pas encore configurée (MISTRAL_API_KEY manquante). Ajoutez votre clé dans .env.local pour activer Blessing. En attendant, remplissez votre profil manuellement dans « Mon profil ».",
      sectionEnCours: "termine",
      onboardingTermine: true,
      historiqueMAJ: [],
    });
  }

  try {
    const { message, historique } = await req.json() as {
      message: string;
      historique: { role: "user" | "assistant"; content: string }[];
    };

    const profil = await prisma.profil.findUnique({ where: { userId: session.user.id } });
    const profilData = profil ? parseProfil(profil as unknown as Record<string, unknown>) : {};

    const systemAvecContexte = `${SYSTEM_PROMPT_ONBOARDING}

PROFIL ACTUEL (déjà collecté) :
${JSON.stringify(profilData, null, 2)}

Ne répète pas des questions sur des sections déjà renseignées. Continue là où la conversation s'est arrêtée.`;

    const client = getMistralClient();

    const messages = [
      { role: "system" as const, content: systemAvecContexte },
      ...(historique ?? []).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const result = await client.chat.complete({
      model: MODELS.small,
      messages,
      responseFormat: { type: "json_object" },
    });

    const texteReponse = (result.choices?.[0]?.message?.content as string) ?? "";

    let parsed: {
      message: string;
      section_en_cours: string;
      donnees_extraites?: Record<string, unknown>;
      onboarding_termine: boolean;
    };

    try {
      const match = texteReponse.match(/\{[\s\S]*\}/);
      parsed = match
        ? JSON.parse(match[0])
        : { message: texteReponse, section_en_cours: "inconnu", onboarding_termine: false };
    } catch {
      parsed = { message: texteReponse, section_en_cours: "inconnu", onboarding_termine: false };
    }

    if (parsed.donnees_extraites && Object.keys(parsed.donnees_extraites).length > 0) {
      const maj: Record<string, unknown> = {};
      const profilActuel = profilData as Record<string, unknown>;

      for (const [cle, valeur] of Object.entries(parsed.donnees_extraites)) {
        if (!CHAMPS_PROFIL.has(cle)) continue; // ignore les clés non stockables
        if (CHAMPS_TABLEAU.has(cle)) {
          // Champ-liste : fusionner avec l'existant et stocker en JSON
          const existant = Array.isArray(profilActuel[cle]) ? (profilActuel[cle] as unknown[]) : [];
          const ajout = Array.isArray(valeur) ? valeur : [valeur];
          maj[cle] = JSON.stringify([...existant, ...ajout]);
        } else {
          // Champ texte (nomComplet, bio, objectifs, tonSouhaite) : toujours une chaîne
          maj[cle] = typeof valeur === "string" ? valeur : versTexte(valeur);
        }
      }
      if (parsed.onboarding_termine) maj.complete = true;
      await prisma.profil.upsert({
        where: { userId: session.user.id },
        update: maj,
        create: { userId: session.user.id, ...maj },
      });
    } else if (parsed.onboarding_termine) {
      await prisma.profil.update({
        where: { userId: session.user.id },
        data: { complete: true },
      });
    }

    return NextResponse.json({
      message: parsed.message,
      sectionEnCours: parsed.section_en_cours,
      section_en_cours: parsed.section_en_cours,
      onboardingTermine: parsed.onboarding_termine,
      historiqueMAJ: [
        ...(historique ?? []),
        { role: "user", content: message },
        { role: "assistant", content: parsed.message },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Erreur onboarding IA:", msg);
    // En dev, on expose le message pour faciliter le diagnostic
    const detail = process.env.NODE_ENV !== "production" ? msg : "Erreur du service IA";
    return NextResponse.json({ erreur: detail }, { status: 500 });
  }
}
