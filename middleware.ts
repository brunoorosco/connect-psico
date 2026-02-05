import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
   // Lista de IPs a bloquear
  const BLOCKED_IP_PREFIXES = ["185.212.","45.84."];
  
  // Obtém o IP do usuário (funciona na Vercel)
  const ip = req.ip || req.headers.get('x-forwarded-for') || '127.0.0.1';


if (BLOCKED_IP_PREFIXES.some(prefix => ip.startsWith(prefix))) {
  return new NextResponse("Access denied", { status: 403 });
}

  const isLoggedIn =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token");

  const { pathname } = req.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin");

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
