/**
 * POST /api/hero-slides/seed
 * Seed hero slides dengan data template (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const templateSlides = [
  {
    title: 'Selamat Datang di Desa Toundanouw',
    subtitle: 'Kecamatan Touluaan, Kabupaten Minahasa Tenggara, Sulawesi Utara. Portal informasi desa dan layanan administrasi digital untuk kemudahan warga.',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop',
    link_text: 'Profil Desa',
    link_url: '/profil',
    urutan: 1,
    is_active: true,
  },
  {
    title: 'Layanan E-Surat Digital',
    subtitle: 'Akses berbagai template surat administrasi desa secara online. Download, cetak, dan ajukan surat dengan mudah dari rumah Anda.',
    image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=600&fit=crop',
    link_text: 'Lihat Template Surat',
    link_url: '/surat',
    urutan: 2,
    is_active: true,
  },
  {
    title: 'Potensi & Keindahan Desa',
    subtitle: 'Jelajahi keindahan alam, budaya, dan potensi wisata Desa Toundanouw. Dari pegunungan hingga tradisi leluhur yang masih terjaga.',
    image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=600&fit=crop',
    link_text: 'Jelajahi Potensi',
    link_url: '/potensi',
    urutan: 3,
    is_active: true,
  },
  {
    title: 'Berita & Informasi Terkini',
    subtitle: 'Dapatkan update terbaru seputar kegiatan desa, pengumuman penting, dan informasi pembangunan Desa Toundanouw.',
    image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=600&fit=crop',
    link_text: 'Baca Berita',
    link_url: '/berita',
    urutan: 4,
    is_active: true,
  },
  {
    title: 'Hubungi Kami',
    subtitle: 'Punya pertanyaan atau masukan? Hubungi kantor desa atau kirim pesan melalui formulir kontak online kami.',
    image_url: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop',
    link_text: 'Kontak Desa',
    link_url: '/kontak',
    urutan: 5,
    is_active: true,
  },
];

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

    // Check if slides already exist
    const { count } = await supabaseAdmin
      .from('hero_slides')
      .select('*', { count: 'exact', head: true });

    if ((count || 0) > 0) {
      return NextResponse.json(
        { error: 'Sudah ada slide. Hapus semua slide terlebih dahulu jika ingin reset.' },
        { status: 400 }
      );
    }

    // Insert template slides
    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .insert(templateSlides)
      .select();

    if (error) {
      console.error('[Hero Slides Seed Error]', error);
      return NextResponse.json(
        { error: 'Gagal membuat template slides: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Berhasil membuat ${data.length} template slides`,
      data,
    });
  } catch (error) {
    console.error('[Hero Slides Seed Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE method to clear all slides (for reset)
export async function DELETE(request: NextRequest) {
  try {
    // Check auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error } = await supabaseAdmin
      .from('hero_slides')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('[Hero Slides Delete All Error]', error);
      return NextResponse.json(
        { error: 'Gagal menghapus slides: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Semua slides berhasil dihapus',
    });
  } catch (error) {
    console.error('[Hero Slides Delete All Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
