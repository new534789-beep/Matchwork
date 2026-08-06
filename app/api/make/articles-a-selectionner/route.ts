import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";

// Appelé une fois par jour par le scénario Make "sélection Facebook quotidienne" :
// renvoie les articles publiés récemment et jamais encore relayés sur Facebook,
// pour que Mistral AI choisisse les 2 plus pertinents (voir facebookPostedLe).
export async function GET(req: Request) {
  const secret = process.env.MAKE_BLOG_INGEST_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const depuis = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const articles = await prisma.article.findMany({
    where: { statut: "publie", facebookPostedLe: null, publieLe: { gte: depuis } },
    orderBy: { publieLe: "desc" },
    take: 30,
    select: {
      id: true,
      titre: true,
      extrait: true,
      categorie: true,
      slug: true,
      publieLe: true,
      imageCouverture: true,
      opportunite: { select: { organisme: true, dateLimite: true } },
    },
  });


  return NextResponse.json({
    ok: true,
    articles: articles.map((a) => ({
      id: a.id,
      titre: a.titre,
      extrait: a.extrait,
      categorie: a.categorie,
      organisme: a.opportunite?.organisme ?? null,
      dateLimite: a.opportunite?.dateLimite ?? null,
      url: absoluteUrl(`/blog/${a.slug}`),
      image: a.imageCouverture || absoluteUrl(`/api/og/blog/${a.slug}`),
    })),
  });
}
