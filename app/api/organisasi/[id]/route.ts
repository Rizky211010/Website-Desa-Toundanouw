/**
 * GET /api/organisasi/[id]
 * Get single organisasi by ID
 * PATCH /api/organisasi/[id]
 * Update organisasi (admin only)
 * DELETE /api/organisasi/[id]
 * Delete organisasi (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('organisasi_desa')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Organisasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Organisasi GET by ID Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();

    // Build update object
    const updateData: Record<string, any> = {};
    const allowedFields = [
      'nama', 'singkatan', 'ketua', 'wakil_ketua', 'sekretaris',
      'bendahara', 'jumlah_anggota', 'deskripsi', 'alamat',
      'telepon', 'email', 'foto_url', 'kategori', 'urutan', 'is_active'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('organisasi_desa')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal update organisasi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Organisasi berhasil diupdate', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Organisasi PATCH Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('organisasi_desa')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menghapus organisasi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Organisasi berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Organisasi DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
