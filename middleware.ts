/**
 * Middleware untuk protect admin routes
 * Redirect ke login jika belum authenticated
 */

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only apply to /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check auth token
  const authToken = request.cookies.get('auth_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isForgotPasswordPage = request.nextUrl.pathname === '/admin/forgot-password';

  // If on login/forgot-password page and already authenticated, redirect to dashboard
  if ((isLoginPage || isForgotPasswordPage) && authToken) {
    try {
      const response = await fetch(
        `${request.nextUrl.protocol}//${request.nextUrl.host}/api/auth/me`,
        {
          headers: {
            Cookie: `auth_token=${authToken}`,
          },
        }
      );

      if (response.ok) {
        // Already logged in, redirect to dashboard
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    } catch {
      // Error checking, proceed to login page
    }
    return NextResponse.next();
  }

  // Allow login and forgot-password pages without auth
  if (isLoginPage || isForgotPasswordPage) {
    return NextResponse.next();
  }

  if (!authToken) {
    // Redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify token is still valid
  try {
    const response = await fetch(
      `${request.nextUrl.protocol}//${request.nextUrl.host}/api/auth/me`,
      {
        headers: {
          Cookie: `auth_token=${authToken}`,
        },
      }
    );

    if (!response.ok) {
      // Token expired or invalid
      const loginUrl = new URL('/admin/login', request.url);
      const res = NextResponse.redirect(loginUrl);
      // Clear the invalid cookie
      res.cookies.delete('auth_token');
      return res;
    }
  } catch {
    // Error checking auth, allow request to proceed
    // The page component will handle auth check
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: ['/admin/:path*'],
};
