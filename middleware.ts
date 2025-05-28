import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get('isLoggedIn')?.value;

  // Allow login page access
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Redirect to login if not logged in
  if (!isLoggedIn && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
