import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session, User } from "better-auth";

type SessionData = {
  session: Session;
  user: User & { role?: string };
} | null;

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/api",
  "/browse",
  "/categories",
  "/category",
  "/android-apps",
  "/windows-apps",
  "/github-repos",
  "/resource",
  "/tags",
  "/u",
  "/ingest",
];

const roleBasedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/user": ["user"],
  "/contributor": ["contributor", "admin"],
  "/dashboard": ["contributor", "admin"],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if session cookie exists before making API call
  const cookies = request.headers.get("cookie") ?? "";
  const hasSessionCookie =
    cookies.includes("better-auth") || cookies.includes("session_token");

  if (!hasSessionCookie) {
    // No session cookie, redirect to sign in immediately
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const response = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: cookies,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Session Fetch Failed");
    }

    // redirect to sign in if not authenticated
    const sessionData = (await response.json()) as SessionData;
    if (!sessionData?.user) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const matchedRoute = Object.keys(roleBasedRoutes).find(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (matchedRoute) {
      const allowedRoles = roleBasedRoutes[matchedRoute];
      const userRole = sessionData.user.role ?? "user";
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Auth check failed:", error);
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|ingest|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
