import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cookie-based auth: tokens live in httpOnly cookies on the API domain.
 * With cross-origin frontend we cannot read those cookies here, so route
 * protection is done client-side via ProtectedRoute (auth context + API).
 * This middleware passes through; no cookie checks.
 */
export function middleware(request: NextRequest) {
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/super-admin", "/super-admin/:path*", "/profile", "/profile/:path*", "/orders", "/orders/:path*", "/checkout"],
};
