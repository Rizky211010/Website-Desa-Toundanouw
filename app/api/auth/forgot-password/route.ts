/**
 * POST /api/auth/forgot-password
 * Mengirim email reset password dengan token
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email harus diisi' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, is_active')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success message to prevent email enumeration
    // Even if user doesn't exist
    if (fetchError || !user) {
      return NextResponse.json({
        message: 'Jika email terdaftar, Anda akan menerima link reset password.',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json({
        message: 'Jika email terdaftar, Anda akan menerima link reset password.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Token expires in 1 hour
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Save token to database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        reset_token: resetTokenHash,
        reset_token_expires: resetTokenExpiry,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Forgot Password] Error saving token:', updateError);
      return NextResponse.json(
        { error: 'Gagal memproses permintaan' },
        { status: 500 }
      );
    }

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // TODO: Send email with reset link
    // For development only - log the reset URL
    if (process.env.NODE_ENV === 'development') {
      console.log('========================================');
      console.log('[RESET PASSWORD LINK]');
      console.log(`User: ${user.full_name} (${email})`);
      console.log(`URL: ${resetUrl}`);
      console.log(`Expires: ${resetTokenExpiry}`);
      console.log('========================================');
    }

    // In production, integrate with email service like:
    // - Nodemailer with SMTP
    // - SendGrid
    // - Resend
    // - AWS SES
    
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Desa Toundanouw <noreply@toundanouw.id>',
    //   to: email,
    //   subject: 'Reset Password - Desa Toundanouw',
    //   html: `
    //     <h1>Reset Password</h1>
    //     <p>Halo ${user.full_name},</p>
    //     <p>Klik link berikut untuk reset password:</p>
    //     <a href="${resetUrl}">Reset Password</a>
    //     <p>Link ini berlaku selama 1 jam.</p>
    //   `,
    // });

    return NextResponse.json({
      message: 'Jika email terdaftar, Anda akan menerima link reset password.',
      // Include reset URL in development for testing
      ...(process.env.NODE_ENV === 'development' && { 
        debug: { resetUrl, expiresAt: resetTokenExpiry } 
      }),
    });

  } catch (error) {
    console.error('[Forgot Password Error]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
