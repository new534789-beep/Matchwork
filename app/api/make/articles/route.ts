import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";

const CATEGORIES_VALIDES = ["actualite", "bourses", "candidature", "emploi", "projets"];

// Le scénario Make appelle ce endpoint une fois l'article rédigé (déclenché par
// notifierOpportunitePubliee dans lib/blog/notifier-make.ts). Le slug est
// toujours régénéré côté serveur (voir lib/prisma.ts) : Make ne le fournit pas.
export async function POST(req: Request) {
  const secret = process.env.MAKE_BLOG_INGEST_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ erreur: "JSON invalide" }, { status: 400 });

  const titre = typeof b.titre === "string" ? b.titre.trim() : "";
  const extrait = typeof b.extrait === "string" ? b.extrait.trim() : "";
  const contenu = typeof b.contenu === "string" ? b.contenu.trim() : "";
  if (!titre || !extrait || !contenu) {
    return NextResponse.json({ erreur: "titre, extrait et contenu sont requis." }, { status: 400 });
  }

  const categorie = typeof b.categorie === "string" && CATEGORIES_VALIDES.includes(b.categorie) ? b.categorie : "actualite";
  const motsCles = Array.isArray(b.motsCles) ? b.motsCles.filter((m) => typeof m === "string") : [];
  const imageCouverture = typeof b.imageCouverture === "string" ? b.imageCouverture.trim() || null : null;
  const seoTitre = typeof b.seoTitre === "string" ? b.seoTitre.trim() || null : null;
  const seoDescription = typeof b.seoDescription === "string" ? b.seoDescription.trim() || null : null;
  const opportuniteId = typeof b.opportuniteId === "string" ? b.opportuniteId.trim() || null : null;

  try {
    const article = await prisma.article.create({
      data: {
        // Toujours régénéré côté serveur par l'extension Prisma (lib/prisma.ts)
        // avant l'écriture réelle — valeur ici uniquement pour satisfaire le
        // typage (le champ est requis par le schéma, jamais fourni par Make).
        slug: "",
        titre,
        extrait,
        contenu,
        categorie,
        motsCles: JSON.stringify(motsCles),
        imageCouverture,
        seoTitre,
        seoDescription,
        opportuniteId,
      },
    });
    return NextResponse.json({ ok: true, id: article.id, slug: article.slug, url: absoluteUrl(`/blog/${article.slug}`) });
  } catch (err) {
    // Contrainte unique sur opportuniteId : un article existe déjà pour cette
    // offre (double déclenchement du webhook Make) — réponse idempotente.
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      const existant = await prisma.article.findUnique({ where: { opportuniteId: opportuniteId! } });
      if (existant) {
        return NextResponse.json({ ok: true, id: existant.id, slug: existant.slug, url: absoluteUrl(`/blog/${existant.slug}`), deduplique: true });
      }
    }
    console.error("[blog] échec création article depuis Make :", err);
    return NextResponse.json({ erreur: "Échec de la création de l'article." }, { status: 500 });
  }
}
