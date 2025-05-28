import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";
import { configRoutes } from "./config/routes";
import { createRouteMatchers } from "./lib/route";
import { auth as midAuth } from "@/auth";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const {
    isPublicRoute,
    isProtectedRoute,
    isApiRoute,
    isAuthRoute,
    isStudentRoute,
    isSupervisorRoute,
  } = createRouteMatchers(configRoutes, req);

  const isLoggedIn = !!req.auth;

  const session = await midAuth();

  const userRole = session?.user.role; 
  const userId = session?.user.id;
  // @ts-ignore
  const isProfileCompleted = session?.user.isProfileCompleted;

  const hasAccess =
    (userRole === "SUPERVISOR" && isSupervisorRoute) ||
    (userRole === "DEFAULT" && isStudentRoute) ||
    userRole === "ADMIN";

  if (isProtectedRoute && isLoggedIn && !hasAccess) {
    return NextResponse.redirect(new URL("/auth/access-denied", req.url));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (
    isLoggedIn &&
    !isProfileCompleted &&
    !req.nextUrl.pathname.startsWith(`/app/professional/${userId}/profile`)
  ) {
    return NextResponse.redirect(
      new URL(`/app/professional/${userId}/profile`, req.url)
    );
  }
});

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
