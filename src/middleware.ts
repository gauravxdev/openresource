import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session, User } from "better-auth";

type SessionData = {
    session: Session;
    user: User & { role?: string };
} | null;

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/api/auth", "/api"];

const roleBasedRoutes: Record<string, string[]> = {
    "/admin": ["admin"],
    "/user": ["user"],
    "/contributor": ["contributor", "admin"],
    "/dashboard": ["admin", "contributor"],
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
            headers: {
                cookie: request.headers.get("cookie") ?? "",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error('Session Fetch Failed');
        }

        // redirect to sign in if not authenticated
        const sessionData = await response.json() as SessionData;
        if (!sessionData?.user) {
            const signInUrl = new URL('sign-in', request.url);
            signInUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(signInUrl);
        }

        const allowedRoles = roleBasedRoutes[pathname];
        if (allowedRoles) {
            const userRole = sessionData.user.role!
            if (!allowedRoles.includes(userRole)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
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
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    ],
};