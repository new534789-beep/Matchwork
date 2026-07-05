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

function redirectConnexion(req: NextRequest) {
  const url = new URL("/connexion", req.url);
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function getSessionCookie(req: NextRequest): string | undefined {
  return (
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value
  );
}

function getRoleFromCookie(req: NextRequest): string | undefined {
  const role = req.cookies.get("matchwork.role")?.value;
  return role;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = getSessionCookie(req);

  if (pathname.startsWith("/admin")) {
    if (!session) return redirectConnexion(req);
    const role = getRoleFromCookie(req);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
    }
    return NextResponse.next();
  }

  const estPrivee = routesPrivees.some((r) => pathname.startsWith(r));

  if (estPrivee && !session) return redirectConnexion(req);

  if ((pathname === "/connexion" || pathname === "/inscription") && session) {
    return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
