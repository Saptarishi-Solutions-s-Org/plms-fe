import { NextRequest, NextResponse } from "next/server";

const REFRESH_COOKIE = "plms_refresh_token";
const USER_HINT_COOKIE = "plms_user_hint";

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

function parseUserHint(value?: string) {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return [...PUBLIC_PATHS].some((path) => path !== "/" && pathname.startsWith(`${path}/`));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  const userHint = parseUserHint(req.cookies.get(USER_HINT_COOKIE)?.value);

  if (pathname === "/login" && refreshToken && userHint?.orgCode) {
    return NextResponse.redirect(
      new URL(`/${userHint.orgCode}/dashboard`, req.url),
    );
  }

  const protectedOrgMatch = pathname.match(/^\/([^/]+)\/dashboard(?:\/.*)?$/);
  if (protectedOrgMatch) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const requestedOrgCode = protectedOrgMatch[1];
    if (userHint?.orgCode && userHint.orgCode !== requestedOrgCode) {
      return NextResponse.redirect(
        new URL(`/${userHint.orgCode}/dashboard`, req.url),
      );
    }
  }

  if (!isPublicPath(pathname) && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
