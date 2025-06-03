// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ['/interests'];
const authRoutes = ['/login', '/register', '/verify-email'];
const TOKEN_COOKIE_NAME = 'token'; // Ensure this matches

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const tokenCookie = request.cookies.get(TOKEN_COOKIE_NAME);
    const tokenValue = tokenCookie?.value; 

    if (isProtectedRoute) {
        if (!tokenValue) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    if (isAuthRoute) {
        if (tokenValue) {
            return NextResponse.redirect(new URL('/interests', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/interests/:path*',
        '/login',
        '/register',
        '/verify-email',
    ]
};