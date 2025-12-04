/**
 * POST /api/auth/login
 * Login dengan email dan password
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, verifyPassword } from '@/lib/supabase-admin';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, password_hash, role, is_active')
      .eq('email', email)
      .single();

    const user = data as UserData | null;

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Akun tidak aktif' },
        { status: 403 }
      );
    }

    // Check if role is valid (only super_admin and admin allowed)
    // Cast to string to allow checking against invalid roles from DB
    const userRole = user.role as string;
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Akun Anda tidak memiliki akses admin' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', user.id);

    // Create response
    const response = NextResponse.json(
      {
        message: 'Login berhasil',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set secure cookie with user session
    response.cookies.set({
      name: 'auth_token',
      value: user.id, // In production, use JWT token!
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
