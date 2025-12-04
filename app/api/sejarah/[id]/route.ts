/**
 * GET /api/sejarah/[id]
 * Get single sejarah entry
 * PATCH /api/sejarah/[id]
 * Update sejarah entry (admin only)
 * DELETE /api/sejarah/[id]
 * Delete sejarah entry (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'events';

    const tableName = type === 'kepala' ? 'sejarah_kepala_desa' : 'sejarah_desa';

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Sejarah ID GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { type = 'events', ...updateData } = body;

    const tableName = type === 'kepala' ? 'sejarah_kepala_desa' : 'sejarah_desa';

    // Build update object with only provided fields
    const updateFields: Record<string, unknown> = {};
    
    if (type === 'kepala') {
      const allowedFields = ['nama', 'periode_mulai', 'periode_selesai', 'pencapaian', 'keterangan', 'foto_url', 'foto_path', 'urutan', 'is_active'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      });
    } else {
      const allowedFields = ['tahun', 'judul', 'deskripsi', 'kategori', 'foto_url', 'foto_path', 'urutan', 'is_highlight', 'is_active'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      });
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diubah' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Sejarah ID PATCH Error]', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Sejarah ID PATCH Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'events';

    const tableName = type === 'kepala' ? 'sejarah_kepala_desa' : 'sejarah_desa';

    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Sejarah ID DELETE Error]', error);
      return NextResponse.json(
        { error: 'Gagal menghapus data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Data berhasil dihapus' }, { status: 200 });
  } catch (error) {
    console.error('[Sejarah ID DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
