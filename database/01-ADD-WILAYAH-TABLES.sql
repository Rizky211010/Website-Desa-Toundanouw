-- =========================================================
-- 🗺️ TAMBAH TABEL WILAYAH & PENDUDUK - DESA TOUNDANOUW
-- =========================================================
-- 
-- File ini menambahkan tabel-tabel yang diperlukan untuk
-- fitur Wilayah Desa dan Penduduk yang belum ada di database.
-- 
-- Jalankan file ini di Supabase SQL Editor
-- =========================================================

-- =========================================================
-- BAGIAN 1: TABEL WILAYAH
-- =========================================================

-- ---------------------------------------------------------
-- 1.1 WILAYAH DESA (Data Geografis)
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
-- 1.2 PENGGUNAAN LAHAN
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
-- 1.3 UPDATE TABEL JAGA (Tambah kolom yang kurang)
-- ---------------------------------------------------------
-- Hapus kolom lama yang tidak dipakai (jika ada)
ALTER TABLE public.jaga DROP COLUMN IF EXISTS kode;
ALTER TABLE public.jaga DROP COLUMN IF EXISTS jumlah_rt;
ALTER TABLE public.jaga DROP COLUMN IF EXISTS luas_wilayah;
ALTER TABLE public.jaga DROP COLUMN IF EXISTS batas_utara;
ALTER TABLE public.jaga DROP COLUMN IF EXISTS batas_selatan;
ALTER TABLE public.jaga DROP COLUMN IF EXISTS batas_timur;
ALTER TABLE public.jaga DROP COLUMN IF EXISTS batas_barat;

-- Tambah kolom baru yang diperlukan
ALTER TABLE public.jaga ADD COLUMN IF NOT EXISTS area VARCHAR(100);
ALTER TABLE public.jaga ADD COLUMN IF NOT EXISTS urutan INTEGER DEFAULT 0;

-- =========================================================
-- BAGIAN 2: TABEL PENDUDUK
-- =========================================================

-- ---------------------------------------------------------
-- 2.1 KELOMPOK UMUR
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
-- 2.2 PEKERJAAN PENDUDUK
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
-- 2.3 PENDIDIKAN PENDUDUK
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
-- 2.4 AGAMA PENDUDUK
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

-- ---------------------------------------------------------
-- 2.5 UPDATE STATISTIK PENDUDUK (Hapus kolom lama, sesuaikan struktur)
-- ---------------------------------------------------------
-- Hapus kolom-kolom lama yang tidak dipakai
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS tahun;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS usia_0_4;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS usia_5_14;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS usia_15_24;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS usia_25_54;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS usia_55_64;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS usia_65_plus;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS tidak_sekolah;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS sd;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS smp;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS sma;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS diploma;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS sarjana;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS pascasarjana;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS petani;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS nelayan;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS pedagang;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS pns;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS swasta;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS wiraswasta;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS buruh;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS tidak_bekerja;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS pelajar;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS ibu_rumah_tangga;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS lainnya;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS islam;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS kristen;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS katolik;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS hindu;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS buddha;
ALTER TABLE public.statistik_penduduk DROP COLUMN IF EXISTS konghucu;

-- Pastikan kolom yang diperlukan ada
-- (total_jiwa, total_kk, laki_laki, perempuan sudah ada)

-- =========================================================
-- BAGIAN 3: INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_jaga_urutan ON public.jaga(urutan);
CREATE INDEX IF NOT EXISTS idx_penggunaan_lahan_urutan ON public.penggunaan_lahan(urutan);
CREATE INDEX IF NOT EXISTS idx_kelompok_umur_urutan ON public.kelompok_umur(urutan);
CREATE INDEX IF NOT EXISTS idx_pekerjaan_penduduk_urutan ON public.pekerjaan_penduduk(urutan);
CREATE INDEX IF NOT EXISTS idx_pendidikan_penduduk_urutan ON public.pendidikan_penduduk(urutan);
CREATE INDEX IF NOT EXISTS idx_agama_penduduk_urutan ON public.agama_penduduk(urutan);

-- =========================================================
-- BAGIAN 4: SEED DATA (Data Default)
-- =========================================================

-- Seed Kelompok Umur
INSERT INTO public.kelompok_umur (range_umur, label, jumlah, urutan) VALUES
  ('0-4', 'Balita', 0, 1),
  ('5-14', 'Anak-anak', 0, 2),
  ('15-24', 'Remaja', 0, 3),
  ('25-44', 'Dewasa Muda', 0, 4),
  ('45-64', 'Dewasa', 0, 5),
  ('65+', 'Lansia', 0, 6)
ON CONFLICT DO NOTHING;

-- =========================================================
-- SELESAI! 🎉
-- =========================================================
