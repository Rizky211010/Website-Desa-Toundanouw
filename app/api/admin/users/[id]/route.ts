/**
 * GET /api/admin/users/[id]
 * Get single user by ID
 * 
 * PUT /api/admin/users/[id]
 * Update user by ID
 * 
 * DELETE /api/admin/users/[id]
 * Delete/deactivate user by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, hashPassword } from '@/lib/supabase-admin';
import { type UserRole, canManageUser } from '@/lib/roles';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CurrentUser {
  id: string;
  role: UserRole;
}

// GET - Get single user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active, last_login_at, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('[Admin User GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user
    const { data: currentUserData } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', authToken)
      .single();
    const currentUser = currentUserData as CurrentUser | null;

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized - User tidak ditemukan' },
        { status: 401 }
      );
    }

    // Get user to update
    const { data: userToUpdate } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single();

    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check permission using canManageUser
    if (!canManageUser(currentUser.role, userToUpdate.role as UserRole) && currentUser.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden - Anda tidak memiliki izin untuk mengubah user ini' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password, full_name, role, is_active } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Format email tidak valid' },
          { status: 400 }
        );
      }

      // Check if email already used by another user
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email sudah digunakan user lain' },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    if (full_name) {
      updateData.full_name = full_name;
    }

    if (role) {
      updateData.role = role;
    }

    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active;
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password minimal 6 karakter' },
          { status: 400 }
        );
      }
      updateData.password_hash = await hashPassword(password);
    }

    // Update user
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData as Record<string, unknown>)
      .eq('id', id)
      .select('id, email, full_name, role, is_active, last_login_at, created_at')
      .single();

    if (error) {
      console.error('[Admin User PUT Error]', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'User berhasil diupdate',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Admin User PUT Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete/deactivate user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log('[DELETE User] Starting delete for ID:', id);

    // Verify auth
    const authToken = request.cookies.get('auth_token')?.value;
    console.log('[DELETE User] Auth token present:', !!authToken);
    
    if (!authToken) {
      console.log('[DELETE User] No auth token found');
      return NextResponse.json(
        { error: 'Unauthorized - Silakan login kembali' },
        { status: 401 }
      );
    }

    // Verify user is super_admin
    const { data: currentUserData, error: authError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', authToken)
      .single();
    
    console.log('[DELETE User] Current user query result:', { currentUserData, authError });
    
    const currentUser = currentUserData as CurrentUser | null;

    if (!currentUser) {
      console.log('[DELETE User] User not found for auth token');
      return NextResponse.json(
        { error: 'Unauthorized - User tidak ditemukan' },
        { status: 401 }
      );
    }

    // Check if user exists and get their role
    const { data: userToDelete } = await supabaseAdmin
      .from('users')
      .select('id, full_name, role')
      .eq('id', id)
      .single();

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Use canManageUser to check permissions
    if (!canManageUser(currentUser.role, userToDelete.role as UserRole)) {
      console.log('[DELETE User] User does not have permission. Manager role:', currentUser.role, 'Target role:', userToDelete.role);
      return NextResponse.json(
        { error: 'Forbidden - Anda tidak memiliki izin untuk menghapus user ini' },
        { status: 403 }
      );
    }

    // Prevent self-delete
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      );
    }

    // Prevent deleting the last super_admin
    if (userToDelete.role === 'super_admin') {
      const { count } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'super_admin')
        .eq('is_active', true);
      
      if ((count || 0) <= 1) {
        return NextResponse.json(
          { error: 'Tidak dapat menghapus Super Admin terakhir' },
          { status: 400 }
        );
      }
    }

    // Hard delete - permanently remove user from database
    console.log('[DELETE User] Attempting to delete user:', id);
    
    const { error, count } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    console.log('[DELETE User] Delete result:', { error, count });

    if (error) {
      console.error('[Admin User DELETE Error] Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to delete user: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[DELETE User] User deleted successfully');
    return NextResponse.json(
      { message: 'User berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Admin User DELETE Error] Exception:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
