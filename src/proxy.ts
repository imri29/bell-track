import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasSessionCookie(req: NextRequest) {
  return req.cookies
    .getAll()
    .some(({ name }) => name.includes("authjs.session-token"));
}

export function proxy(req: NextRequest) {
  const isAuthenticated = hasSessionCookie(req);
  const isSignInPage = req.nextUrl.pathname === "/signin";

  if (isAuthenticated && isSignInPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (!isAuthenticated && !isSignInPage) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
