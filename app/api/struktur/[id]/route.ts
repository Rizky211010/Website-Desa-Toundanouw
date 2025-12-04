/**
 * GET /api/struktur/[id]
 * Get single struktur entry by ID
 * PATCH /api/struktur/[id]
 * Update struktur entry (admin only)
 * DELETE /api/struktur/[id]
 * Delete struktur entry (admin only)
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
      .from('struktur_pemerintahan')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Struktur pemerintahan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Struktur GET Detail Error]', error);
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
    const { jabatan, nama, nip, email, telepon, deskripsi, urutan, is_active } = body;

    // Build update object
    const updateData: Record<string, any> = {};
    if (jabatan) updateData.jabatan = jabatan;
    if (nama) updateData.nama = nama;
    if (nip !== undefined) updateData.nip = nip;
    if (email !== undefined) updateData.email = email;
    if (telepon !== undefined) updateData.telepon = telepon;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (urutan !== undefined) updateData.urutan = urutan;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update struktur
    const { data: updatedStuktur, error: updateError } = await supabaseAdmin
      .from('struktur_pemerintahan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update struktur: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Struktur pemerintahan berhasil diupdate', data: updatedStuktur },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Struktur PATCH Error]', error);
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

    // Soft delete (set is_active to false)
    const { error: deleteError } = await supabaseAdmin
      .from('struktur_pemerintahan')
      .update({ is_active: false })
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Gagal delete struktur: ' + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Struktur pemerintahan berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Struktur DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
