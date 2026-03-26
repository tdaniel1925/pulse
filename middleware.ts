import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware - Auth Protection
 * Based on DEPENDENCY-MAP.md - UI/Dashboard Dependencies
 *
 * Protects routes:
 * - /dashboard/* - Requires authentication
 * - /pages/* - Requires authentication
 * - /social/* - Requires authentication
 * - /settings/* - Requires authentication
 * - /admin/* - Requires authentication + admin role
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if accessing protected route
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/pages') ||
    request.nextUrl.pathname.startsWith('/social') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/admin');

  // Redirect to login if not authenticated
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes require additional check
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    // TODO: Check if user has admin role
    // For now, just allow (implement role check in Phase 4)
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pages/:path*',
    '/social/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
