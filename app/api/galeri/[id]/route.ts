/**
 * GET /api/galeri/[id]
 * Get single galeri by ID
 * PATCH /api/galeri/[id]
 * Update galeri (with role-based access)
 * DELETE /api/galeri/[id]
 * Delete galeri (with role-based access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { canEditGaleri, canDeleteGaleri, type UserRole } from '@/lib/roles';

// Helper untuk mendapatkan user dari auth token
async function getAuthUser(authToken: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, is_active')
    .eq('id', authToken)
    .single();
  return user as { id: string; email: string; full_name: string; role: UserRole; is_active: boolean } | null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('galeri')
      .select('*, users:author_id(id, full_name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Galeri tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Galeri GET Detail Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user
    const currentUser = await getAuthUser(authToken);
    if (!currentUser || !currentUser.is_active) {
      return NextResponse.json(
        { error: 'User tidak valid atau tidak aktif' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Get existing galeri to check ownership
    const { data: existingGaleri, error: fetchError } = await supabaseAdmin
      .from('galeri')
      .select('id, author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingGaleri) {
      return NextResponse.json(
        { error: 'Galeri tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check permission to edit
    if (!canEditGaleri(currentUser.role, currentUser.id, existingGaleri.author_id)) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk mengedit galeri ini' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { judul, deskripsi, kategori, urutan, is_featured } = body;

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (judul) updateData.judul = judul;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (kategori) updateData.kategori = kategori;
    
    // Admin and super_admin can change urutan and is_featured
    if (urutan !== undefined) updateData.urutan = urutan;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    // Update galeri
    const { data: updatedGaleri, error: updateError } = await supabaseAdmin
      .from('galeri')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update galeri: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Galeri berhasil diupdate', data: updatedGaleri },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Galeri PATCH Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user
    const currentUser = await getAuthUser(authToken);
    if (!currentUser || !currentUser.is_active) {
      return NextResponse.json(
        { error: 'User tidak valid atau tidak aktif' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Get galeri to check ownership and get file path
    const { data: galeri, error: getError } = await supabaseAdmin
      .from('galeri')
      .select('id, author_id, foto_path')
      .eq('id', id)
      .single();

    if (getError || !galeri) {
      return NextResponse.json(
        { error: 'Galeri tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check permission to delete
    if (!canDeleteGaleri(currentUser.role, currentUser.id, galeri.author_id)) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk menghapus galeri ini' },
        { status: 403 }
      );
    }

    // Delete file from storage
    if (galeri.foto_path) {
      await supabaseAdmin.storage
        .from('galeri')
        .remove([galeri.foto_path]);
    }

    // Delete galeri entry
    const { error: deleteError } = await supabaseAdmin
      .from('galeri')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Gagal delete galeri: ' + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Galeri berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Galeri DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
