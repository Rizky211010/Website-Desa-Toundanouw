/**
 * GET /api/surat/[id]
 * Get single surat template by ID or slug
 * PATCH /api/surat/[id]
 * Update surat template (admin only)
 * DELETE /api/surat/[id]
 * Delete surat template (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Gunakan supabaseAdmin untuk bypass RLS
    const query = supabaseAdmin.from('surat_templates').select(`
      id,
      name,
      slug,
      description,
      content,
      category,
      file_format,
      file_url,
      file_path,
      is_active,
      created_at,
      updated_at
    `);

    let data, error;

    // Try by ID first (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      ({ data, error } = await query.eq('id', id).single());
    } else {
      // Try by slug
      ({ data, error } = await query.eq('slug', id).single());
    }

    if (error || !data) {
      return NextResponse.json(
        { error: 'Surat template tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if active (only active for public)
    const authToken = request.cookies.get('auth_token')?.value;
    if (!data.is_active && !authToken) {
      return NextResponse.json(
        { error: 'Surat template tidak ditemukan' },
        { status: 404 }
      );
    }

    // Log download (hanya jika bukan dari admin panel)
    const referer = request.headers.get('referer') || '';
    const isFromAdmin = referer.includes('/admin');
    
    if (!isFromAdmin) {
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await supabaseAdmin.from('surat_downloads').insert({
        surat_id: data.id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Surat GET Detail Error]', error);
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

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, content, category, file_format, is_active } = body;

    // Update surat template
    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (file_format) updateData.file_format = file_format;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (name && !body.slug) {
      updateData.slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    const { data: updatedSurat, error: updateError } = await supabaseAdmin
      .from('surat_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update surat: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Surat template berhasil diupdate', data: updatedSurat },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Surat PATCH Error]', error);
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

    const { id } = await context.params;

    // Delete surat template
    const { error: deleteError } = await supabaseAdmin
      .from('surat_templates')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Gagal delete surat: ' + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Surat template berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Surat DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
