import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  /* ------------------------------------
   * 🔒 Bloqueio simples por IP
   * ------------------------------------ */
  const BLOCKED_IP_PREFIXES = ["185.212.", "45.84."]

  const forwardedFor = req.headers.get("x-forwarded-for")
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"

  if (BLOCKED_IP_PREFIXES.some(prefix => ip.startsWith(prefix))) {
    return new NextResponse("Access denied", { status: 403 })
  }

  /* ------------------------------------
   * 🔐 Auth simples
   * ------------------------------------ */
  const isLoggedIn =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token")

  const pathname = req.nextUrl.pathname

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  /* ------------------------------------
   * ✅ SEMPRE continuar
   * ------------------------------------ */
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
