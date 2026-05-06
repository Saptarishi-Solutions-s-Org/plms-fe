import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken");

  const pathname = req.nextUrl.pathname;

  const isHomePage = pathname === "/";

  const isDashboardPage = pathname.includes("/dashboard");

  if (!accessToken && isDashboardPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (accessToken && isHomePage) {
    const orgCode = req.cookies.get("orgCode")?.value;

    if (orgCode) {
      return NextResponse.redirect(new URL(`/${orgCode}/dashboard`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/:orgCode/dashboard/:path*"],
};
