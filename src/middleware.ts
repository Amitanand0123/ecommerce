import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ['/interests']
const authRoutes = ['/login', '/register', '/verify-email']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    if (isProtectedRoute) {
        return NextResponse.next()
    }
    if (isAuthRoute) {
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/interests/:path*',
        '/login',
        '/register',
        '/verify-email'
    ]
}