import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const routesPrivees = [
  "/tableau-de-bord",
  "/profil",
  "/coffre-fort",
  "/onboarding",
  "/opportunites",
  "/dossiers",
  "/candidatures",
  "/compte",
  "/parametres",
];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth as { user?: { role?: string } } | null;

  // Espace admin : réservé au rôle « admin ». Cette URL donne accès à tout → protection stricte.
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = new URL("/connexion", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (session.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
    }
    return NextResponse.next();
  }

  const estPrivee = routesPrivees.some((r) => pathname.startsWith(r));

  if (estPrivee && !session) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/connexion" || pathname === "/inscription") && session) {
    return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
