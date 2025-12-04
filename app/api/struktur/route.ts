/**
 * GET /api/struktur
 * Get struktur pemerintahan (staff/officials)
 * POST /api/struktur
 * Create struktur pemerintahan entry (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error, count } = await supabase
      .from('struktur_pemerintahan')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('urutan', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil struktur pemerintahan: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, total: count },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Struktur GET Error]', error);
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
    const { jabatan, nama, nip, email, telepon, deskripsi, urutan } = body;

    // Validation
    if (!jabatan || !nama) {
      return NextResponse.json(
        { error: 'Jabatan dan nama harus diisi' },
        { status: 400 }
      );
    }

    // Create struktur entry
    const { data: newStuktur, error: createError } = await supabaseAdmin
      .from('struktur_pemerintahan')
      .insert({
        jabatan,
        nama,
        nip: nip || null,
        email: email || null,
        telepon: telepon || null,
        deskripsi: deskripsi || null,
        urutan: urutan || 0,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Gagal membuat struktur: ' + createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Struktur pemerintahan berhasil dibuat', data: newStuktur },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Struktur POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
