/**
 * POST /api/auth/logout
 * Logout dengan menghapus auth cookie
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { message: 'Logout berhasil' },
      { status: 200 }
    );

    // Delete auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete immediately
    });

    return response;
  } catch (error) {
    console.error('[Auth Logout Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
