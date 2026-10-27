// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Global middleware to protect API routes.
 * Allows unauthenticated access to authentication endpoints (`/api/auth/*`).
 * For all other `/api/*` routes, it verifies a valid JWT session token.
 * If the token is missing or invalid, the request is rejected with 401.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sanitizedHeaders = new Headers(request.headers);
  sanitizedHeaders.delete("x-user-id");
  sanitizedHeaders.delete("x-user-role");

  // Allow public auth routes and nextjs static files
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next") || pathname.startsWith("/api/health")) {
    return NextResponse.next({
      request: {
        headers: sanitizedHeaders,
      },
    });
  }

  // Only protect API routes – other routes (pages) can handle auth client‑side.
  if (pathname.startsWith("/api")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    sanitizedHeaders.set("x-user-id", String(token.sub));
    sanitizedHeaders.set("x-user-role", String((token as any).role ?? "USER"));
    return NextResponse.next({
      request: {
        headers: sanitizedHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: sanitizedHeaders,
    },
  });
}

export const config = {
  matcher: "/api/:path*",
};
