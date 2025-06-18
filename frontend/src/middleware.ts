import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasRoutePermission, getRedirectPathForRole } from '@/lib/permissions';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value?.toLowerCase();
  const url = request.nextUrl;

  console.log(`[Middleware] Checking access for: ${url.pathname}, role: ${role}, token: ${!!token}`);

  // Handle root path specifically
  if (url.pathname === '/') {
    if (token) {
      const redirectPath = getRedirectPathForRole(role || null);
      console.log(`[Middleware] Root path with token, redirecting to: ${redirectPath}`);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    // Allow the root route to handle its own redirection if no token
    return NextResponse.next();
  }
  
  // Check if user is accessing sign-in related pages
  const isAuthPage = url.pathname === '/sign-in';
  
  // If user is logged in and trying to access login pages
  if (token && isAuthPage) {
    const redirectPath = getRedirectPathForRole(role || null);
    console.log(`[Middleware] Sign-in path with token, redirecting to: ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  
  // If user is not logged in and accessing protected pages
  if (!token && !isAuthPage && url.pathname !== '/') {
    console.log(`[Middleware] Protected path without token, redirecting to: /sign-in`);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If user is logged in, check role-based permissions
  if (token && !isAuthPage) {
    const hasPermission = hasRoutePermission(url.pathname, role || null);
    
    if (!hasPermission) {
      console.log(`[Middleware] Access denied for role ${role || 'unknown'} to ${url.pathname}`);
      // Redirect to appropriate dashboard based on role
      const redirectPath = getRedirectPathForRole(role || null);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    console.log(`[Middleware] Access granted for role ${role || 'unknown'} to ${url.pathname}`);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/admin/:path*',
    '/pegawai/:path*',
    '/dashboard/:path*',
    '/list/:path*',
    '/profile/:path*'
  ],
};
