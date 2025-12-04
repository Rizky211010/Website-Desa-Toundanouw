/**
 * Supabase Client - Client-side dan Server-side configuration
 * Untuk digunakan di browser, Client Components, dan API Routes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Check if environment variables are configured
const hasValidConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Use placeholder values during build time when env vars are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING-ANON-KEY-SET-ENV-VAR';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Warn when environment variables are missing (works both client and server side)
if (!hasValidConfig && process.env.NODE_ENV === 'development') {
  console.warn(
    'Missing Supabase environment variables. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BeritaRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  thumbnail_url: string | null;
  thumbnail_path: string | null;
  author_id: string;
  view_count: number;
  published_at: string | null;
  rejected_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SuratTemplateRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  file_path: string | null;
  file_url: string | null;
  file_format: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuratDownloadRow {
  id: string;
  surat_id: string;
  ip_address: string | null;
  user_agent: string | null;
  downloaded_at: string;
}

export interface ProfilDesaRow {
  id: string;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  deskripsi: string | null;
  visi: string | null;
  misi: string | null;
  sejarah: string | null;
  geografis: string | null;
  statistik_penduduk: number | null;
  luas_wilayah: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  kepala_desa: string | null;
  sekretaris_desa: string | null;
  updated_at: string;
}

export interface StrukturPemerintahanRow {
  id: string;
  jabatan: string;
  nama: string;
  nip: string | null;
  email: string | null;
  telepon: string | null;
  foto_path: string | null;
  foto_url: string | null;
  deskripsi: string | null;
  urutan: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PotensiDesaRow {
  id: string;
  kategori: string;
  nama: string;
  deskripsi: string | null;
  nilai_ekonomi: string | null;
  pemilik: string | null;
  kontak: string | null;
  lokasi: string | null;
  foto_path: string | null;
  foto_url: string | null;
  urutan: number | null;
  created_at: string;
  updated_at: string;
}

export interface GaleriRow {
  id: string;
  judul: string;
  deskripsi: string | null;
  kategori: string | null;
  foto_path: string;
  foto_url: string | null;
  urutan: number | null;
  is_featured: boolean;
  author_id: string | null;
  uploaded_at: string;
  updated_at: string;
}

export interface WilayahDesaRow {
  id: string;
  luas_wilayah: number | null;
  ketinggian: number | null;
  curah_hujan: number | null;
  suhu_min: number | null;
  suhu_max: number | null;
  batas_utara: string | null;
  batas_selatan: string | null;
  batas_barat: string | null;
  batas_timur: string | null;
  google_maps_url: string | null;
  google_maps_embed: string | null;
  updated_at: string;
}

export interface JagaRow {
  id: string;
  nama: string;
  kepala_jaga: string | null;
  area: string | null;
  jumlah_kk: number;
  jumlah_jiwa: number;
  deskripsi: string | null;
  urutan: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PenggunaanLahanRow {
  id: string;
  jenis: string;
  luas: number | null;
  persentase: number | null;
  urutan: number;
  created_at: string;
  updated_at: string;
}

// Penduduk interfaces
export interface StatistikPendudukRow {
  id: string;
  total_jiwa: number;
  total_kk: number;
  laki_laki: number;
  perempuan: number;
  updated_at: string;
}

export interface KelompokUmurRow {
  id: string;
  range_umur: string;
  label: string | null;
  jumlah: number;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface PekerjaanPendudukRow {
  id: string;
  jenis: string;
  jumlah: number;
  icon: string | null;
  urutan: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PendidikanPendudukRow {
  id: string;
  tingkat: string;
  jumlah: number;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface AgamaPendudukRow {
  id: string;
  nama: string;
  jumlah: number;
  persentase: number;
  urutan: number;
  created_at: string;
  updated_at: string;
}

// Sejarah interfaces
export interface SejarahDesaRow {
  id: string;
  tahun: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  foto_path: string | null;
  foto_url: string | null;
  urutan: number;
  is_highlight: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SejarahKepalaDesaRow {
  id: string;
  nama: string;
  periode_mulai: string;
  periode_selesai: string | null;
  foto_path: string | null;
  foto_url: string | null;
  pencapaian: string | null;
  keterangan: string | null;
  urutan: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Backward compatibility
export type Tables = {
  users: { Row: UserRow };
  berita: { Row: BeritaRow };
  surat_templates: { Row: SuratTemplateRow };
  surat_downloads: { Row: SuratDownloadRow };
  profil_desa: { Row: ProfilDesaRow };
  struktur_pemerintahan: { Row: StrukturPemerintahanRow };
  potensi_desa: { Row: PotensiDesaRow };
  galeri: { Row: GaleriRow };
  wilayah_desa: { Row: WilayahDesaRow };
  jaga: { Row: JagaRow };
  penggunaan_lahan: { Row: PenggunaanLahanRow };
  statistik_penduduk: { Row: StatistikPendudukRow };
  kelompok_umur: { Row: KelompokUmurRow };
  pekerjaan_penduduk: { Row: PekerjaanPendudukRow };
  pendidikan_penduduk: { Row: PendidikanPendudukRow };
  agama_penduduk: { Row: AgamaPendudukRow };
  sejarah_desa: { Row: SejarahDesaRow };
  sejarah_kepala_desa: { Row: SejarahKepalaDesaRow };
};

export type Database = {
  public: {
    Tables: Tables;
  };
};

// ============================================================================
// SUPABASE CLIENTS
// ============================================================================

// Public client (untuk client-side)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any, 'public', any> = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Admin client (untuk server-side API routes)
// Menggunakan service_role key - bypasskan RLS policies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: SupabaseClient<any, 'public', any> = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : supabase; // Fallback ke public client jika service role tidak ada
