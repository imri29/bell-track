import { auth } from "./auth";

export const middleware = auth((req) => {
  const isSignInPage = req.nextUrl.pathname === "/signin";

  if (req.auth && isSignInPage) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  if (!req.auth && !isSignInPage) {
    return Response.redirect(new URL("/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
