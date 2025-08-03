import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasRoutePermission, getRedirectPathForRole } from '@/lib/permissions';

// Enhanced cache for better performance
const authCheckCache = new Map<string, { result: NextResponse; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache to reduce excessive checks

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // FAST EXIT: Skip middleware for static assets, API routes, and other non-page requests
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/favicon') ||
    url.pathname.startsWith('/setup-admin') ||
    url.pathname.startsWith('/quick-admin') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value?.toLowerCase();
  
  // Cache key for performance - include more specific data
  const cacheKey = `${url.pathname}-${role || 'none'}-${!!token}`;
  const cached = authCheckCache.get(cacheKey);
  
  // Use cached result if available and still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Avoid redirect loops by checking if we're already at the destination
    if (cached.result.headers.get('location') === url.toString()) {
      return NextResponse.next();
    }
    return cached.result;
  }

  let response: NextResponse;

  // Handle root path quickly
  if (url.pathname === '/') {
    if (token) {
      const redirectPath = getRedirectPathForRole(role || null);
      // Avoid redirect if already at target path
      if (url.pathname === redirectPath) {
        response = NextResponse.next();
      } else {
        response = NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } else {
      response = NextResponse.next();
    }
  }
  // Handle sign-in page quickly  
  else if (url.pathname === '/sign-in') {
    if (token) {
      const redirectPath = getRedirectPathForRole(role || null);
      // Avoid redirect if already at target path
      if (url.pathname === redirectPath) {
        response = NextResponse.next();
      } else {
        response = NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } else {
      response = NextResponse.next();
    }
  }
  // Handle protected routes
  else {
    if (!token) {
      // Avoid redirect loop to sign-in
      if (url.pathname === '/sign-in') {
        response = NextResponse.next();
      } else {
        response = NextResponse.redirect(new URL('/sign-in', request.url));
      }
    } else {
      const hasPermission = hasRoutePermission(url.pathname, role || null);
      if (!hasPermission) {
        const redirectPath = getRedirectPathForRole(role || null);
        // Avoid redirect if already at target path
        if (url.pathname === redirectPath) {
          response = NextResponse.next();
        } else {
          response = NextResponse.redirect(new URL(redirectPath, request.url));
        }
      } else {
        response = NextResponse.next();
      }
    }
  }
  
  // Cache the response for future requests
  authCheckCache.set(cacheKey, {
    result: response,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries periodically (every 100 requests)
  if (authCheckCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of authCheckCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        authCheckCache.delete(key);
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    // Only run middleware on essential routes that need immediate redirects
    '/',
    '/sign-in',
    '/admin',
    // Protected dashboard routes
    '/dashboard/admin/:path*',
    '/dashboard/pegawai/:path*',
  ],
};
