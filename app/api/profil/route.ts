/**
 * GET /api/profil
 * Get profil desa
 * PATCH /api/profil
 * Update profil desa (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get all rows and use first one (handle potential duplicates)
    const { data: rows, error } = await supabaseAdmin
      .from('profil_desa')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Profil GET Error]', error);
      return NextResponse.json(
        { error: 'Gagal mengambil profil desa' },
        { status: 500 }
      );
    }

    const data = rows && rows.length > 0 ? rows[0] : null;

    if (!data) {
      return NextResponse.json(
        { error: 'Profil desa tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[Profil GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
      nama_desa,
      kecamatan,
      kabupaten,
      provinsi,
      deskripsi,
      visi,
      misi,
      sejarah,
      geografis,
      statistik_penduduk,
      luas_wilayah,
      alamat,
      telepon,
      email,
      website,
      latitude,
      longitude,
      kepala_desa,
      sekretaris_desa,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (nama_desa) updateData.nama_desa = nama_desa;
    if (kecamatan) updateData.kecamatan = kecamatan;
    if (kabupaten) updateData.kabupaten = kabupaten;
    if (provinsi) updateData.provinsi = provinsi;
    if (deskripsi) updateData.deskripsi = deskripsi;
    if (visi) updateData.visi = visi;
    if (misi) updateData.misi = misi;
    if (sejarah) updateData.sejarah = sejarah;
    if (geografis) updateData.geografis = geografis;
    if (statistik_penduduk) updateData.statistik_penduduk = statistik_penduduk;
    if (luas_wilayah) updateData.luas_wilayah = luas_wilayah;
    if (alamat) updateData.alamat = alamat;
    if (telepon) updateData.telepon = telepon;
    if (email) updateData.email = email;
    if (website) updateData.website = website;
    if (latitude) updateData.latitude = latitude;
    if (longitude) updateData.longitude = longitude;
    if (kepala_desa) updateData.kepala_desa = kepala_desa;
    if (sekretaris_desa) updateData.sekretaris_desa = sekretaris_desa;

    // Get existing profil (handle duplicates - get all, use first)
    const { data: profilRows, error: getError } = await supabaseAdmin
      .from('profil_desa')
      .select('id')
      .order('updated_at', { ascending: false });

    if (getError) {
      return NextResponse.json(
        { error: 'Gagal mengambil profil desa' },
        { status: 500 }
      );
    }

    let result;
    
    if (profilRows && profilRows.length > 0) {
      // Update first/newest row
      result = await supabaseAdmin
        .from('profil_desa')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', profilRows[0].id)
        .select()
        .single();
      
      // Delete duplicates if any
      if (profilRows.length > 1) {
        const idsToDelete = profilRows.slice(1).map(r => r.id);
        await supabaseAdmin
          .from('profil_desa')
          .delete()
          .in('id', idsToDelete);
      }
    } else {
      // Insert new if not exists
      result = await supabaseAdmin
        .from('profil_desa')
        .insert(updateData)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json(
        { error: 'Gagal update profil: ' + result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Profil desa berhasil diupdate', data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Profil PATCH Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
