import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/connexion", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
    }
    return NextResponse.next();
  }

  const estPrivee = routesPrivees.some((r) => pathname.startsWith(r));

  if (estPrivee && !token) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/connexion" || pathname === "/inscription") && token) {
    return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
