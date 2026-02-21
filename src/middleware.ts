import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/") {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    ],
};