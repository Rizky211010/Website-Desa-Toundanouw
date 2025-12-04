-- =========================================================
-- SEED DATA: HERO SLIDES
-- =========================================================
-- 
-- File ini berisi template slide untuk hero banner
-- Jalankan di Supabase SQL Editor
-- 
-- =========================================================

-- Hapus data lama (opsional - uncomment jika ingin reset)
-- DELETE FROM public.hero_slides;

-- Insert 5 template slides
INSERT INTO public.hero_slides (title, subtitle, image_url, link_text, link_url, urutan, is_active)
VALUES 
(
  'Selamat Datang di Desa Toundanouw',
  'Kecamatan Touluaan, Kabupaten Minahasa Tenggara, Sulawesi Utara. Portal informasi desa dan layanan administrasi digital untuk kemudahan warga.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop',
  'Profil Desa',
  '/profil',
  1,
  true
),
(
  'Layanan E-Surat Digital',
  'Akses berbagai template surat administrasi desa secara online. Download, cetak, dan ajukan surat dengan mudah dari rumah Anda.',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=600&fit=crop',
  'Lihat Template Surat',
  '/surat',
  2,
  true
),
(
  'Potensi & Keindahan Desa',
  'Jelajahi keindahan alam, budaya, dan potensi wisata Desa Toundanouw. Dari pegunungan hingga tradisi leluhur yang masih terjaga.',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=600&fit=crop',
  'Jelajahi Potensi',
  '/potensi',
  3,
  true
),
(
  'Berita & Informasi Terkini',
  'Dapatkan update terbaru seputar kegiatan desa, pengumuman penting, dan informasi pembangunan Desa Toundanouw.',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=600&fit=crop',
  'Baca Berita',
  '/berita',
  4,
  true
),
(
  'Hubungi Kami',
  'Punya pertanyaan atau masukan? Hubungi kantor desa atau kirim pesan melalui formulir kontak online kami.',
  'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop',
  'Kontak Desa',
  '/kontak',
  5,
  true
)
ON CONFLICT DO NOTHING;

-- Verifikasi data
SELECT id, title, subtitle, urutan, is_active FROM public.hero_slides ORDER BY urutan;
