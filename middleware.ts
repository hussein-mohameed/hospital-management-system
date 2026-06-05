import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET || "hospital-os-super-secure-session-secret-key-2026-cairo";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Define public paths
  const isPublicPath = path === "/login";
  
  // Exclude static assets and API routes
  const isAsset =
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp)$/);

  if (isAsset) {
    return NextResponse.next();
  }

  // Get session cookie
  const cookie = req.cookies.get("session")?.value;

  let session = null;
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie, encodedKey, {
        algorithms: ["HS256"],
      });
      session = payload;
    } catch (err) {
      // Session invalid or expired
    }
  }

  // Redirect to login if not authenticated and trying to access a protected page
  if (!session && !isPublicPath) {
    const isMockMode = 
      !process.env.DATABASE_URL || 
      process.env.DATABASE_URL.includes("[PASSWORD]") || 
      process.env.DATABASE_URL.includes("[REGION]") ||
      process.env.MOCK_DATABASE === "true";

    if (isMockMode) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", req.nextUrl.origin);
    // Preserve current URL as redirect query param
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if authenticated and trying to access login page
  if (session && isPublicPath) {
    const homeUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  // Allow request through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
