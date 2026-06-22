import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const routesPrivees = [
  "/profil",
  "/coffre-fort",
  "/onboarding",
  "/opportunites",
  "/dossiers",
  "/candidatures",
  "/compte",
  "/parametres",
];

const routesPubliques = ["/", "/connexion", "/inscription"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const estPrivee = routesPrivees.some((r) => pathname.startsWith(r));
  const estPublique = routesPubliques.includes(pathname);

  if (estPrivee && !session) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/connexion" || pathname === "/inscription") && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
