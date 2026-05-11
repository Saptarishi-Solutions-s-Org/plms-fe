import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/services",
  "/features",
  "/use-cases",
  "/why-plms",
  "/security",
  "/request-demo",
  "/faqs",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/maintenance",
  "/not-authorized",
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return [...PUBLIC_PATHS].some((path) => path !== "/" && pathname.startsWith(`${path}/`));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isPublicPath(pathname) && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
