/**
 * GET /api/potensi
 * Get all potensi desa (with optional filtering)
 * POST /api/potensi
 * Create new potensi entry (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const kategori = searchParams.get('kategori');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let query = supabaseAdmin
      .from('potensi_desa')
      .select('*', { count: 'exact' });

    // Filter by kategori
    if (kategori) {
      query = query.eq('kategori', kategori);
    }

    // Sort by urutan then by created_at
    query = query.order('urutan', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil potensi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data,
        pagination: {
          total: count,
          limit,
          offset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Potensi GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { kategori, nama, deskripsi, nilai_ekonomi, pemilik, kontak, lokasi, urutan, foto_path, foto_url } = body;

    // Validation
    if (!kategori || !nama) {
      return NextResponse.json(
        { error: 'Kategori dan nama harus diisi' },
        { status: 400 }
      );
    }

    // Create potensi entry
    const { data: newPotensi, error: createError } = await supabaseAdmin
      .from('potensi_desa')
      .insert({
        kategori,
        nama,
        deskripsi: deskripsi || null,
        nilai_ekonomi: nilai_ekonomi || null,
        pemilik: pemilik || null,
        kontak: kontak || null,
        lokasi: lokasi || null,
        urutan: urutan || 0,
        foto_path: foto_path || null,
        foto_url: foto_url || null,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Gagal membuat potensi: ' + createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Potensi desa berhasil dibuat', data: newPotensi },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Potensi POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
