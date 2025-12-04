/**
 * GET /api/sejarah
 * Get all sejarah desa entries
 * POST /api/sejarah
 * Create new sejarah entry (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'events'; // 'events' or 'kepala'
    const kategori = searchParams.get('kategori');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    if (type === 'kepala') {
      // Get kepala desa history
      let query = supabaseAdmin
        .from('sejarah_kepala_desa')
        .select('*')
        .order('urutan', { ascending: true });
      
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Sejarah Kepala GET Error]', error);
        return NextResponse.json(
          { error: 'Gagal memuat data kepala desa' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data }, { status: 200 });
    }

    // Get sejarah events
    let query = supabaseAdmin
      .from('sejarah_desa')
      .select('*')
      .order('urutan', { ascending: true });

    if (kategori && kategori !== 'semua') {
      query = query.eq('kategori', kategori);
    }

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Sejarah GET Error]', error);
      return NextResponse.json(
        { error: 'Gagal memuat data sejarah' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Sejarah GET Error]', error);
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
    const { type = 'events', ...data } = body;

    if (type === 'kepala') {
      // Create kepala desa entry
      const { nama, periode_mulai, periode_selesai, pencapaian, keterangan, foto_url, foto_path, urutan } = data;

      if (!nama || !periode_mulai) {
        return NextResponse.json(
          { error: 'Nama dan periode mulai wajib diisi' },
          { status: 400 }
        );
      }

      const { data: newKepala, error } = await supabaseAdmin
        .from('sejarah_kepala_desa')
        .insert({
          nama,
          periode_mulai,
          periode_selesai: periode_selesai || null,
          pencapaian: pencapaian || null,
          keterangan: keterangan || null,
          foto_url: foto_url || null,
          foto_path: foto_path || null,
          urutan: urutan || 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('[Sejarah Kepala POST Error]', error);
        return NextResponse.json(
          { error: 'Gagal menambah data kepala desa' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: newKepala }, { status: 201 });
    }

    // Create sejarah event
    const { tahun, judul, deskripsi, kategori, foto_url, foto_path, urutan, is_highlight } = data;

    if (!tahun || !judul || !deskripsi) {
      return NextResponse.json(
        { error: 'Tahun, judul, dan deskripsi wajib diisi' },
        { status: 400 }
      );
    }

    const { data: newSejarah, error } = await supabaseAdmin
      .from('sejarah_desa')
      .insert({
        tahun,
        judul,
        deskripsi,
        kategori: kategori || 'umum',
        foto_url: foto_url || null,
        foto_path: foto_path || null,
        urutan: urutan || 0,
        is_highlight: is_highlight || false,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Sejarah POST Error]', error);
      return NextResponse.json(
        { error: 'Gagal menambah data sejarah' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newSejarah }, { status: 201 });
  } catch (error) {
    console.error('[Sejarah POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
