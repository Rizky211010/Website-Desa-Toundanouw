-- =========================================================
-- 🏠 DATABASE MASTER SETUP - DESA TOUNDANOUW
-- =========================================================
-- 
-- File ini berisi SEMUA SQL yang diperlukan untuk setup 
-- database website Desa Toundanouw dari awal.
-- 
-- Jalankan file ini di Supabase SQL Editor untuk:
-- 1. Membuat semua tabel
-- 2. Membuat indexes
-- 3. Setup RLS (Row Level Security)
-- 4. Insert data awal (seed data)
-- 
-- =========================================================

-- =========================================================
-- BAGIAN 1: EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- BAGIAN 2: TABEL UTAMA
-- =========================================================

-- ---------------------------------------------------------
-- 2.1 USERS (Akun Admin)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.2 PROFIL DESA
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profil_desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_desa VARCHAR(255) NOT NULL DEFAULT 'Desa Toundanouw',
  kecamatan VARCHAR(255) NOT NULL DEFAULT 'Touluaan',
  kabupaten VARCHAR(255) NOT NULL DEFAULT 'Minahasa Tenggara',
  provinsi VARCHAR(255) NOT NULL DEFAULT 'Sulawesi Utara',
  kode_pos VARCHAR(10),
  deskripsi TEXT,
  visi TEXT,
  misi TEXT,
  sejarah TEXT,
  geografis TEXT,
  luas_wilayah VARCHAR(100),
  alamat VARCHAR(500),
  telepon VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  kepala_desa VARCHAR(255),
  sekretaris_desa VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.3 BERITA
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.berita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  category VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  thumbnail_url VARCHAR(500),
  thumbnail_path VARCHAR(255),
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.4 SURAT TEMPLATES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surat_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  content TEXT NOT NULL,
  file_path VARCHAR(255),
  file_url VARCHAR(500),
  file_format VARCHAR(20) NOT NULL DEFAULT 'docx',
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.5 SURAT DOWNLOADS (Log)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surat_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_id UUID NOT NULL REFERENCES public.surat_templates(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.6 STRUKTUR PEMERINTAHAN
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.struktur_pemerintahan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jabatan VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  nip VARCHAR(50),
  email VARCHAR(255),
  telepon VARCHAR(20),
  foto_path VARCHAR(255),
  foto_url VARCHAR(500),
  deskripsi TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.7 GALERI
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  kategori VARCHAR(100) DEFAULT 'umum',
  foto_path VARCHAR(255),
  foto_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  urutan INTEGER DEFAULT 0,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.8 ORGANISASI DESA
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organisasi_desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  singkatan VARCHAR(50),
  kategori VARCHAR(100) DEFAULT 'organisasi_masyarakat',
  deskripsi TEXT,
  ketua VARCHAR(255),
  wakil_ketua VARCHAR(255),
  sekretaris VARCHAR(255),
  bendahara VARCHAR(255),
  jumlah_anggota INTEGER DEFAULT 0,
  alamat VARCHAR(500),
  telepon VARCHAR(20),
  email VARCHAR(255),
  foto_path VARCHAR(255),
  foto_url VARCHAR(500),
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2.9 POTENSI DESA
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.potensi_desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(500),
  foto_path VARCHAR(255),
  foto_url VARCHAR(500),
  kontak VARCHAR(255),
  harga VARCHAR(100),
  jam_operasional VARCHAR(100),
  fasilitas TEXT,
  nilai_ekonomi VARCHAR(255),
  pemilik VARCHAR(255),
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- BAGIAN 3: TABEL WILAYAH & KEPENDUDUKAN
-- =========================================================

-- ---------------------------------------------------------
-- 3.1 WILAYAH DESA (Data Geografis)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wilayah_desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  luas_wilayah NUMERIC(10, 2),
  ketinggian NUMERIC(10, 2),
  curah_hujan NUMERIC(10, 2),
  suhu_min NUMERIC(5, 2),
  suhu_max NUMERIC(5, 2),
  batas_utara VARCHAR(255),
  batas_selatan VARCHAR(255),
  batas_barat VARCHAR(255),
  batas_timur VARCHAR(255),
  google_maps_url TEXT,
  google_maps_embed TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3.2 JAGA (Wilayah/Dusun)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jaga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  kepala_jaga VARCHAR(255),
  area VARCHAR(100),
  jumlah_kk INTEGER DEFAULT 0,
  jumlah_jiwa INTEGER DEFAULT 0,
  deskripsi TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3.3 PENGGUNAAN LAHAN
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.penggunaan_lahan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis VARCHAR(255) NOT NULL,
  luas NUMERIC(10, 2),
  persentase NUMERIC(5, 2),
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3.4 STATISTIK PENDUDUK
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.statistik_penduduk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_jiwa INTEGER DEFAULT 0,
  total_kk INTEGER DEFAULT 0,
  laki_laki INTEGER DEFAULT 0,
  perempuan INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3.5 KELOMPOK UMUR
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kelompok_umur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  range_umur VARCHAR(50) NOT NULL,
  label VARCHAR(100),
  jumlah INTEGER DEFAULT 0,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3.6 PEKERJAAN PENDUDUK
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pekerjaan_penduduk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis VARCHAR(255) NOT NULL,
  jumlah INTEGER DEFAULT 0,
  icon VARCHAR(100),
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3.7 PENDIDIKAN PENDUDUK
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pendidikan_penduduk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tingkat VARCHAR(255) NOT NULL,
  jumlah INTEGER DEFAULT 0,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3.8 AGAMA PENDUDUK
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agama_penduduk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  jumlah INTEGER DEFAULT 0,
  persentase NUMERIC(5, 2) DEFAULT 0,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- BAGIAN 4: TABEL SEJARAH
-- =========================================================

-- ---------------------------------------------------------
-- 4.1 SEJARAH DESA (Timeline)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sejarah_desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tahun VARCHAR(20) NOT NULL,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori VARCHAR(100) DEFAULT 'umum',
  foto_path VARCHAR(255),
  foto_url VARCHAR(500),
  urutan INTEGER DEFAULT 0,
  is_highlight BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 4.2 SEJARAH KEPALA DESA
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sejarah_kepala_desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  periode_mulai VARCHAR(4) NOT NULL,
  periode_selesai VARCHAR(4),
  foto_path VARCHAR(255),
  foto_url VARCHAR(500),
  pencapaian TEXT,
  keterangan TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- BAGIAN 5: TABEL FITUR LAINNYA
-- =========================================================

-- ---------------------------------------------------------
-- 5.1 HERO SLIDES (Slider Homepage)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  image_url VARCHAR(500),
  image_path VARCHAR(255),
  link_url VARCHAR(500),
  link_text VARCHAR(100),
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5.2 SITE SETTINGS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description VARCHAR(500),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5.3 MESSAGES (Pesan Kontak)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5.4 NOTIFICATIONS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5.5 ACTIVITY LOG
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  entity_title VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- BAGIAN 6: INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON public.users(reset_token);

CREATE INDEX IF NOT EXISTS idx_berita_status ON public.berita(status);
CREATE INDEX IF NOT EXISTS idx_berita_slug ON public.berita(slug);
CREATE INDEX IF NOT EXISTS idx_berita_published_at ON public.berita(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_berita_category ON public.berita(category);

CREATE INDEX IF NOT EXISTS idx_surat_templates_is_active ON public.surat_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_surat_templates_slug ON public.surat_templates(slug);
CREATE INDEX IF NOT EXISTS idx_surat_downloads_surat_id ON public.surat_downloads(surat_id);

CREATE INDEX IF NOT EXISTS idx_struktur_urutan ON public.struktur_pemerintahan(urutan);
CREATE INDEX IF NOT EXISTS idx_organisasi_kategori ON public.organisasi_desa(kategori);
CREATE INDEX IF NOT EXISTS idx_potensi_kategori ON public.potensi_desa(kategori);

CREATE INDEX IF NOT EXISTS idx_galeri_kategori ON public.galeri(kategori);
CREATE INDEX IF NOT EXISTS idx_galeri_uploaded_at ON public.galeri(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_galeri_is_featured ON public.galeri(is_featured);

CREATE INDEX IF NOT EXISTS idx_jaga_nama ON public.jaga(nama);
CREATE INDEX IF NOT EXISTS idx_jaga_urutan ON public.jaga(urutan);
CREATE INDEX IF NOT EXISTS idx_penggunaan_lahan_urutan ON public.penggunaan_lahan(urutan);
CREATE INDEX IF NOT EXISTS idx_kelompok_umur_urutan ON public.kelompok_umur(urutan);
CREATE INDEX IF NOT EXISTS idx_pekerjaan_penduduk_urutan ON public.pekerjaan_penduduk(urutan);
CREATE INDEX IF NOT EXISTS idx_pendidikan_penduduk_urutan ON public.pendidikan_penduduk(urutan);
CREATE INDEX IF NOT EXISTS idx_agama_penduduk_urutan ON public.agama_penduduk(urutan);

CREATE INDEX IF NOT EXISTS idx_sejarah_desa_tahun ON public.sejarah_desa(tahun);
CREATE INDEX IF NOT EXISTS idx_sejarah_desa_urutan ON public.sejarah_desa(urutan);
CREATE INDEX IF NOT EXISTS idx_sejarah_kepala_periode ON public.sejarah_kepala_desa(periode_mulai);

CREATE INDEX IF NOT EXISTS idx_hero_slides_urutan ON public.hero_slides(urutan);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- =========================================================
-- BAGIAN 7: ROW LEVEL SECURITY (RLS)
-- =========================================================

ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "berita_published_readable" ON public.berita;
CREATE POLICY "berita_published_readable" ON public.berita
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "surat_templates_readable" ON public.surat_templates;
CREATE POLICY "surat_templates_readable" ON public.surat_templates
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "surat_downloads_insertable" ON public.surat_downloads;
CREATE POLICY "surat_downloads_insertable" ON public.surat_downloads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "galeri_readable" ON public.galeri;
CREATE POLICY "galeri_readable" ON public.galeri
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "hero_slides_readable" ON public.hero_slides;
CREATE POLICY "hero_slides_readable" ON public.hero_slides
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "messages_insertable" ON public.messages;
CREATE POLICY "messages_insertable" ON public.messages
  FOR INSERT WITH CHECK (true);

-- =========================================================
-- BAGIAN 8: SEED DATA
-- =========================================================

-- Admin User (Password: Admin123!)
INSERT INTO public.users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@toundanouw.id',
  '$2b$10$.bbN.eBYLpW4s4YN2tARH.mbIeA8a4rFqkJgfflny.rLrEaRU3fB.',
  'Administrator Desa',
  'super_admin',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$.bbN.eBYLpW4s4YN2tARH.mbIeA8a4rFqkJgfflny.rLrEaRU3fB.',
  role = 'super_admin',
  is_active = true;

-- Profil Desa
INSERT INTO public.profil_desa (nama_desa, kecamatan, kabupaten, provinsi, kepala_desa, latitude, longitude)
SELECT 'Desa Toundanouw', 'Touluaan', 'Minahasa Tenggara', 'Sulawesi Utara', 'Kepala Desa Toundanouw', 1.3808, 124.7772
WHERE NOT EXISTS (SELECT 1 FROM public.profil_desa WHERE nama_desa = 'Desa Toundanouw');

-- Statistik Penduduk Default
INSERT INTO public.statistik_penduduk (total_jiwa, total_kk, laki_laki, perempuan)
SELECT 0, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.statistik_penduduk LIMIT 1);

-- Kelompok Umur Default
INSERT INTO public.kelompok_umur (range_umur, label, jumlah, urutan) VALUES
  ('0-4', 'Balita', 0, 1),
  ('5-14', 'Anak-anak', 0, 2),
  ('15-24', 'Remaja', 0, 3),
  ('25-44', 'Dewasa Muda', 0, 4),
  ('45-64', 'Dewasa', 0, 5),
  ('65+', 'Lansia', 0, 6)
ON CONFLICT DO NOTHING;

-- Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('site_name', 'Desa Toundanouw', 'Nama website'),
  ('site_tagline', 'Portal Informasi Desa Toundanouw', 'Tagline website'),
  ('contact_email', 'admin@toundanouw.id', 'Email kontak'),
  ('contact_phone', '', 'Nomor telepon')
ON CONFLICT (key) DO NOTHING;

-- Sample Surat Templates
INSERT INTO public.surat_templates (name, slug, description, content, category, file_format, is_active)
VALUES
  ('Surat Keterangan Domisili', 'surat-keterangan-domisili', 
   'Surat keterangan yang menyatakan bahwa seseorang benar-benar berdomisili di wilayah desa.',
   'Template surat keterangan domisili', 'kependudukan', 'pdf', true),
  ('Surat Keterangan Usaha', 'surat-keterangan-usaha', 
   'Surat keterangan yang menyatakan bahwa seseorang memiliki usaha di wilayah desa.',
   'Template surat keterangan usaha', 'usaha', 'pdf', true),
  ('Surat Pengantar SKCK', 'surat-pengantar-skck', 
   'Surat pengantar untuk mengurus SKCK di kepolisian.',
   'Template surat pengantar SKCK', 'kependudukan', 'pdf', true),
  ('Surat Keterangan Tidak Mampu', 'surat-keterangan-tidak-mampu', 
   'Surat keterangan untuk warga yang membutuhkan bantuan.',
   'Template surat keterangan tidak mampu', 'umum', 'pdf', true)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- SELESAI! 🎉
-- =========================================================
-- Login dengan:
-- Email: admin@toundanouw.id
-- Password: Admin123!
-- =========================================================
