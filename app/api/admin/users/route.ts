/**
 * GET /api/admin/users
 * List semua admin users
 * 
 * POST /api/admin/users
 * Create admin user baru
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, hashPassword } from '@/lib/supabase-admin';
import { type UserRole } from '@/lib/roles';

interface CurrentUser {
  id: string;
  role: UserRole;
}

// GET - List all admin users
export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is super_admin
    const { data } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', authToken)
      .single();
    const currentUser = data as CurrentUser | null;

    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Hanya Super Admin yang dapat mengakses' },
        { status: 403 }
      );
    }

    // Fetch all users (excluding password_hash)
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Users GET Error]', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('[Admin Users GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is super_admin
    const { data: currentUserData } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', authToken)
      .single();
    const currentUser = currentUserData as CurrentUser | null;

    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Hanya Super Admin yang dapat menambah user' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password, full_name, role } = body;

    // Validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama harus diisi' },
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

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash,
        full_name,
        role: role || 'admin',
        is_active: true,
      } as Record<string, unknown>)
      .select('id, email, full_name, role, is_active, created_at')
      .single();

    if (error) {
      console.error('[Admin Users POST Error]', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'User berhasil dibuat',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Users POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
