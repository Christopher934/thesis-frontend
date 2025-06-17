import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value?.toLowerCase();
  const url = request.nextUrl;
  
  // Check if user is accessing sign-in related pages
  const isAuthPage = url.pathname === '/' || url.pathname === '/sign-in';
  
  // If user is logged in and trying to access login pages
  if (token && isAuthPage) {
    const redirectPath = role === 'admin' ? '/admin' : '/pegawai';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  
  // If user is not logged in and accessing protected pages
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/sign-in', '/admin/:path*', '/pegawai/:path*', '/dashboard/:path*'],
};
