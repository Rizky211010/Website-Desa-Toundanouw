/**
 * POST /api/auth/register
 * Register akun admin baru (hanya untuk first-time setup)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, hashPassword } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    // Validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, dan full_name harus diisi' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name,
        role: 'admin',
        is_active: true,
      } as Record<string, unknown>)
      .select('id, email, full_name, role')
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Gagal membuat akun: ' + createError.message },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        message: 'Akun berhasil dibuat',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Auth Register Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
