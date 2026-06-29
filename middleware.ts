import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasAuthSessionCookie } from "@/lib/auth/cookies";

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isLoggedIn = hasAuthSessionCookie(request.cookies);

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|font).*)",
  ],
};
