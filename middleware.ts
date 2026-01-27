import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('better-auth.session_token');

    if (!sessionCookie) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify session with the auth API
    try {
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });

      if (!sessionResponse.ok) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const session = await sessionResponse.json();

      // Check if user has admin or staff role
      if (!session?.user?.role || !['admin', 'staff'].includes(session.user.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // If verification fails, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
