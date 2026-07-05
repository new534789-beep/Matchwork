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

async function decodeJwt(token: string, secret: string) {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const [headerB64, payloadB64, sigB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !sigB64) return null;

    const sigData = Uint8Array.from(atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigData, enc.encode(`${headerB64}.${payloadB64}`));
    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    return payload as { id?: string; role?: string; exp?: number };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.AUTH_SECRET ?? "";

  const cookieName =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const token = cookieName ? await decodeJwt(cookieName, secret) : null;

  if (pathname.startsWith("/admin")) {
    if (!token) return redirectConnexion(req);
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
    }
    return NextResponse.next();
  }

  const estPrivee = routesPrivees.some((r) => pathname.startsWith(r));

  if (estPrivee && !token) return redirectConnexion(req);

  if ((pathname === "/connexion" || pathname === "/inscription") && token) {
    return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
