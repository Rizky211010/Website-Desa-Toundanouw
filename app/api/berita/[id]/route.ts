/**
 * GET /api/berita/[id]
 * Get single berita by ID or slug
 * PATCH /api/berita/[id]
 * Update berita (with role-based access)
 * DELETE /api/berita/[id]
 * Delete berita (with role-based access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { canEditBerita, canDeleteBerita, canChangeBeritaStatus, type BeritaStatus, type UserRole } from '@/lib/roles';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Try to fetch by ID or slug
    let query = supabaseAdmin.from('berita').select(
      `
      id,
      title,
      slug,
      content,
      excerpt,
      category,
      status,
      thumbnail_url,
      view_count,
      published_at,
      created_at,
      updated_at,
      users:author_id(id, full_name, email)
      `
    );

    let data, error;

    // Try by ID first (UUID format check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      ({ data, error } = await query.eq('id', id).single());
    }

    // If not found or not UUID, try by slug
    if (error || !data) {
      ({ data, error } = await supabaseAdmin.from('berita').select(
        `
        id,
        title,
        slug,
        content,
        excerpt,
        category,
        status,
        thumbnail_url,
        view_count,
        published_at,
        created_at,
        updated_at,
        users:author_id(id, full_name, email)
        `
      ).eq('slug', id).single());
    }

    if (error || !data) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if published (only published articles for public)
    const authToken = request.cookies.get('auth_token')?.value;
    if (data.status !== 'published' && !authToken) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabaseAdmin
      .from('berita')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id);

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Berita GET Detail Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
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

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Get existing berita
    const { data: existingBerita, error: fetchError } = await supabaseAdmin
      .from('berita')
      .select('id, author_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingBerita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check permission to edit
    if (!canEditBerita(currentUser.role, currentUser.id, existingBerita.author_id)) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk mengedit berita ini' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, excerpt, category, status, published_at, thumbnail_url, thumbnail_path, rejected_reason } = body;

    // Check permission to change status
    if (status && status !== existingBerita.status) {
      const canChangeStatus = canChangeBeritaStatus(
        currentUser.role,
        existingBerita.status as BeritaStatus,
        status as BeritaStatus,
        currentUser.id,
        existingBerita.author_id
      );

      if (!canChangeStatus) {
        return NextResponse.json(
          { error: 'Anda tidak memiliki izin untuk mengubah status berita ke ' + status },
          { status: 403 }
        );
      }
    }

    // Update berita
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    
    if (status) {
      updateData.status = status;
      
      // Set published_at when publishing
      if (status === 'published' && !published_at) {
        updateData.published_at = new Date().toISOString();
        updateData.reviewed_by = currentUser.id;
        updateData.reviewed_at = new Date().toISOString();
      }
      
      // Set rejected_reason and reviewer when rejecting
      if (status === 'rejected') {
        updateData.rejected_reason = rejected_reason || null;
        updateData.reviewed_by = currentUser.id;
        updateData.reviewed_at = new Date().toISOString();
      }
      
      // Clear rejected_reason when status changes from rejected
      if (existingBerita.status === 'rejected' && status !== 'rejected') {
        updateData.rejected_reason = null;
      }
    }
    
    if (published_at) updateData.published_at = published_at;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (thumbnail_path !== undefined) updateData.thumbnail_path = thumbnail_path;
    if (title && !body.slug) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    const { data: updatedBerita, error: updateError } = await supabaseAdmin
      .from('berita')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update berita: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Berita berhasil diupdate', data: updatedBerita },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Berita PATCH Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
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

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Get berita to check ownership and thumbnail
    const { data: berita, error: fetchError } = await supabaseAdmin
      .from('berita')
      .select('id, author_id, thumbnail_path')
      .eq('id', id)
      .single();

    if (fetchError || !berita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check permission to delete
    if (!canDeleteBerita(currentUser.role, currentUser.id, berita.author_id)) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk menghapus berita ini' },
        { status: 403 }
      );
    }

    // Delete thumbnail from storage if exists
    if (berita.thumbnail_path) {
      await supabaseAdmin.storage
        .from('berita')
        .remove([berita.thumbnail_path]);
    }

    // Delete berita
    const { error: deleteError } = await supabaseAdmin
      .from('berita')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Gagal delete berita: ' + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Berita berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Berita DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
