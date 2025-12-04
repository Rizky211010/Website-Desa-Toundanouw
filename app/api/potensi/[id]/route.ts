/**
 * GET /api/potensi/[id]
 * Get single potensi by ID
 * PATCH /api/potensi/[id]
 * Update potensi (admin only)
 * DELETE /api/potensi/[id]
 * Delete potensi (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    const { data, error } = await supabase
      .from('potensi_desa')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Potensi desa tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Potensi GET Detail Error]', error);
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

    const { id } = await context.params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { kategori, nama, deskripsi, nilai_ekonomi, pemilik, kontak, lokasi, urutan, foto_path, foto_url } = body;

    // Build update object
    const updateData: Record<string, any> = {};
    if (kategori) updateData.kategori = kategori;
    if (nama) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (nilai_ekonomi !== undefined) updateData.nilai_ekonomi = nilai_ekonomi;
    if (pemilik !== undefined) updateData.pemilik = pemilik;
    if (kontak !== undefined) updateData.kontak = kontak;
    if (lokasi !== undefined) updateData.lokasi = lokasi;
    if (urutan !== undefined) updateData.urutan = urutan;
    if (foto_path !== undefined) updateData.foto_path = foto_path;
    if (foto_url !== undefined) updateData.foto_url = foto_url;

    // Update potensi
    const { data: updatedPotensi, error: updateError } = await supabaseAdmin
      .from('potensi_desa')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update potensi: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Potensi desa berhasil diupdate', data: updatedPotensi },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Potensi PATCH Error]', error);
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

    const { id } = await context.params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Get potensi to get file path if exists
    const { data: potensi, error: getError } = await supabaseAdmin
      .from('potensi_desa')
      .select('foto_path')
      .eq('id', id)
      .single();

    if (getError || !potensi) {
      return NextResponse.json(
        { error: 'Potensi desa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete file from storage if exists
    if (potensi.foto_path) {
      await supabaseAdmin.storage
        .from('potensi')
        .remove([potensi.foto_path]);
    }

    // Delete potensi entry
    const { error: deleteError } = await supabaseAdmin
      .from('potensi_desa')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Gagal delete potensi: ' + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Potensi desa berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Potensi DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
