/**
 * GET /api/organisasi
 * Get all organisasi (active only by default)
 * POST /api/organisasi
 * Create organisasi baru (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';

    let query = supabase
      .from('organisasi_desa')
      .select('*', { count: 'exact' })
      .order('urutan', { ascending: true });

    // Jika tidak include all, hanya ambil yang aktif
    if (!includeAll) {
      query = query.eq('is_active', true);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data organisasi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, total: count },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Organisasi GET Error]', error);
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
    const {
      nama,
      singkatan,
      ketua,
      wakil_ketua,
      sekretaris,
      bendahara,
      jumlah_anggota,
      deskripsi,
      alamat,
      telepon,
      email,
      kategori,
      urutan,
    } = body;

    // Validation
    if (!nama || !ketua) {
      return NextResponse.json(
        { error: 'Nama organisasi dan ketua harus diisi' },
        { status: 400 }
      );
    }

    // Create organisasi entry
    const { data: newOrganisasi, error: createError } = await supabaseAdmin
      .from('organisasi_desa')
      .insert({
        nama,
        singkatan: singkatan || null,
        ketua,
        wakil_ketua: wakil_ketua || null,
        sekretaris: sekretaris || null,
        bendahara: bendahara || null,
        jumlah_anggota: jumlah_anggota || 0,
        deskripsi: deskripsi || null,
        alamat: alamat || null,
        telepon: telepon || null,
        email: email || null,
        kategori: kategori || 'organisasi_masyarakat',
        urutan: urutan || 0,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Gagal membuat organisasi: ' + createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Organisasi berhasil dibuat', data: newOrganisasi },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Organisasi POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
