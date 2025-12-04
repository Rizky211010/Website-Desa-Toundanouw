/**
 * POST /api/auth/reset-password
 * Reset password menggunakan token dari email
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, hashPassword } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password, confirmPassword } = body;

    // Validation
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, dan password harus diisi' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password dan konfirmasi password tidak sama' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, reset_token, reset_token_expires')
      .eq('email', email.toLowerCase())
      .eq('reset_token', tokenHash)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Token reset tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json(
        { error: 'Token reset sudah kadaluarsa. Silakan minta link reset baru.' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and clear reset token
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Reset Password] Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Gagal mereset password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    });

  } catch (error) {
    console.error('[Reset Password Error]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password
 * Validasi token sebelum menampilkan form reset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: 'Token atau email tidak ditemukan' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, reset_token_expires')
      .eq('email', email.toLowerCase())
      .eq('reset_token', tokenHash)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { valid: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Token sudah kadaluarsa' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
    });

  } catch (error) {
    console.error('[Validate Reset Token Error]', error);
    return NextResponse.json(
      { valid: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
