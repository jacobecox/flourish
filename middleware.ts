import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/auth"];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  if (PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(p))) return true;
  // Public recipe detail: /recipes/[id] — but not /recipes/new or /recipes/[id]/edit
  if (/^\/recipes\/(?!new$)[^/]+$/.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isPublic(pathname)) return NextResponse.next();

  // Note: we read the raw cookie here rather than calling getSession() because middleware
  // runs on the Edge runtime where the full Node.js crypto API may not be available.
  // Full signature verification happens in lib/auth.ts for server components and actions.
  const session = request.cookies.get("flourish-session");
  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so the login page can redirect back after sign-in.
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
