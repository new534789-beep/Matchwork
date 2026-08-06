import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";
import { getMistralClient, hasMistralKey, MODELS } from "@/lib/ia/mistral";

// Sélection quotidienne des articles à relayer sur Facebook.
//
// Le choix des 2 articles (jugement de pertinence par l'IA) se fait ICI, côté
// serveur, et la réponse expose des champs PLATS (titre1/url1/titre2/url2…) :
// l'accès indexé à un tableau dans les templates Make s'est révélé peu fiable
// (Facebook recevait un message vide). Make n'a donc plus qu'à mapper des
// champs simples, sans logique.
const LIMITE_FACEBOOK = 2;

type Candidat = {
  id: string;
  titre: string;
  extrait: string;
  slug: string;
  imageCouverture: string | null;
};

/**
 * Demande à l'IA de classer les candidats par intérêt pour la page Facebook.
 * Renvoie les ids retenus, dans l'ordre. Fail-open : en cas d'erreur (quota,
 * réponse illisible), on retombe sur l'ordre chronologique — mieux vaut publier
 * les plus récents que ne rien publier du tout.
 */
async function classerParPertinence(candidats: Candidat[]): Promise<string[]> {
  if (candidats.length <= LIMITE_FACEBOOK || !hasMistralKey()) {
    return candidats.map((c) => c.id);
  }

  const liste = candidats
    .map((c) => `- id=${c.id} | titre: ${c.titre} | extrait: ${c.extrait}`)
    .join("\n");

  const prompt = `Voici des articles de blog Matchwork (plateforme de bourses et d'emplois en Afrique de l'Ouest) publiés récemment :

${liste}

Choisis les ${LIMITE_FACEBOOK} plus pertinents à relayer aujourd'hui sur la page Facebook : privilégie les opportunités concrètes, à fort intérêt pour un candidat ouest-africain, et dont l'organisme inspire confiance.

Réponds STRICTEMENT en JSON valide, sans texte autour : {"ids": ["id_choisi_1", "id_choisi_2"]}`;

  try {
    const client = getMistralClient();
    const reponse = await client.chat.complete({
      model: MODELS.large,
      temperature: 0.3,
      responseFormat: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const contenu = reponse.choices?.[0]?.message?.content;
    if (typeof contenu !== "string") return candidats.map((c) => c.id);

    const parsed = JSON.parse(contenu) as { ids?: unknown };
    if (!Array.isArray(parsed.ids)) return candidats.map((c) => c.id);

    const connus = new Set(candidats.map((c) => c.id));
    const retenus = parsed.ids.filter((id): id is string => typeof id === "string" && connus.has(id));

    // Complète avec les plus récents si l'IA en a renvoyé trop peu.
    for (const c of candidats) {
      if (retenus.length >= LIMITE_FACEBOOK) break;
      if (!retenus.includes(c.id)) retenus.push(c.id);
    }
    return retenus;
  } catch (err) {
    console.error("[fb-select] classement IA indisponible, ordre chronologique retenu :", err);
    return candidats.map((c) => c.id);
  }
}

export async function GET(req: Request) {
  const secret = process.env.MAKE_BLOG_INGEST_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const depuis = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const candidats = await prisma.article.findMany({
    where: { statut: "publie", facebookPostedLe: null, publieLe: { gte: depuis } },
    orderBy: { publieLe: "desc" },
    take: 30,
    select: { id: true, titre: true, extrait: true, slug: true, imageCouverture: true },
  });

  const idsOrdonnes = await classerParPertinence(candidats);
  const parId = new Map(candidats.map((c) => [c.id, c]));
  const retenus = idsOrdonnes
    .map((id) => parId.get(id))
    .filter((c): c is Candidat => Boolean(c))
    .slice(0, LIMITE_FACEBOOK);

  const plat: Record<string, string> = { nombre: String(retenus.length) };
  retenus.forEach((a, i) => {
    const n = i + 1;
    plat[`id${n}`] = a.id;
    plat[`titre${n}`] = a.titre;
    plat[`extrait${n}`] = a.extrait;
    plat[`url${n}`] = absoluteUrl(`/blog/${a.slug}`);
    plat[`image${n}`] = a.imageCouverture || absoluteUrl(`/api/og/blog/${a.slug}`);
  });

  // Champs toujours présents même sans article, pour que le mapping Make ne
  // casse pas quand il n'y a rien à publier (Facebook refuse un post vide, ce
  // qui est le comportement voulu : rien à dire, rien à poster).
  for (let n = retenus.length + 1; n <= LIMITE_FACEBOOK; n++) {
    plat[`id${n}`] = "";
    plat[`titre${n}`] = "";
    plat[`extrait${n}`] = "";
    plat[`url${n}`] = "";
    plat[`image${n}`] = "";
  }

  return NextResponse.json(plat);
}
