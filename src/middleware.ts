import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!sessionCookie && !pathname.startsWith('/login') && !pathname.startsWith('/register') && !pathname.startsWith('/forgot-password')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access an auth page, redirect to dashboard
  if (sessionCookie && (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Special case for root, if logged in go to dashboard
  if (pathname === '/' && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Special case for root, if not logged in go to login (already handled by page.tsx redirect)
  if (pathname === '/' && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
