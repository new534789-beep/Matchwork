import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { GestionBlog } from "@/components/admin/GestionBlog";

export const dynamic = "force-dynamic";

export default async function PageAdminBlog() {
  const rows = await prisma.article.findMany({
    orderBy: [{ statut: "asc" }, { publieLe: "desc" }],
    select: {
      id: true,
      slug: true,
      titre: true,
      categorie: true,
      statut: true,
      publieLe: true,
      opportunite: { select: { intitule: true } },
    },
  });

  const initial = rows.map((a) => ({
    id: a.id,
    slug: a.slug,
    titre: a.titre,
    categorie: a.categorie,
    statut: a.statut,
    publieLe: a.publieLe.toISOString(),
    opportuniteIntitule: a.opportunite?.intitule ?? null,
  }));

  return (
    <>
      <EnteteAdmin titre="Blog" sousTitre={`${initial.length} article${initial.length > 1 ? "s" : ""} au total`} />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full">
        <GestionBlog initial={initial} />
      </main>
    </>
  );
}
