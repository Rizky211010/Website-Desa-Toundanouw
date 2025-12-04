/**
 * Profil & Struktur API utilities
 * Helper functions untuk interact dengan Profil dan Struktur API
 */

export type ProfilDesa = {
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
};

export type StrukturPemerintahan = {
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
};

/**
 * Get profil desa
 */
export async function getProfilDesa(): Promise<{ data: ProfilDesa }> {
  const response = await fetch('/api/profil');

  if (!response.ok) {
    throw new Error('Gagal mengambil profil desa');
  }

  return response.json();
}

/**
 * Update profil desa (admin only)
 */
export async function updateProfilDesa(
  updates: Partial<ProfilDesa>
): Promise<{ message: string; data: ProfilDesa }> {
  const response = await fetch('/api/profil', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal update profil desa');
  }

  return response.json();
}

/**
 * Get semua struktur pemerintahan (active only)
 */
export async function getStrukturPemerintahan(): Promise<{
  data: StrukturPemerintahan[];
  total: number;
}> {
  const response = await fetch('/api/struktur');

  if (!response.ok) {
    throw new Error('Gagal mengambil struktur pemerintahan');
  }

  return response.json();
}

/**
 * Get single struktur pemerintahan by ID
 */
export async function getStrukturPemerintahanDetail(
  id: string
): Promise<{ data: StrukturPemerintahan }> {
  const response = await fetch(`/api/struktur/${id}`);

  if (!response.ok) {
    throw new Error('Struktur pemerintahan tidak ditemukan');
  }

  return response.json();
}

/**
 * Create struktur pemerintahan (admin only)
 */
export async function createStrukturPemerintahan(
  jabatan: string,
  nama: string,
  nip?: string,
  email?: string,
  telepon?: string,
  deskripsi?: string,
  urutan?: number
): Promise<{ message: string; data: StrukturPemerintahan }> {
  const response = await fetch('/api/struktur', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      jabatan,
      nama,
      nip,
      email,
      telepon,
      deskripsi,
      urutan,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal membuat struktur pemerintahan');
  }

  return response.json();
}

/**
 * Update struktur pemerintahan (admin only)
 */
export async function updateStrukturPemerintahan(
  id: string,
  updates: Partial<StrukturPemerintahan>
): Promise<{ message: string; data: StrukturPemerintahan }> {
  const response = await fetch(`/api/struktur/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal update struktur pemerintahan');
  }

  return response.json();
}

/**
 * Delete struktur pemerintahan (admin only)
 */
export async function deleteStrukturPemerintahan(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/struktur/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal hapus struktur pemerintahan');
  }

  return response.json();
}

/**
 * Upload foto untuk struktur pemerintahan
 */
export async function uploadStrukturFoto(
  strukturId: string,
  file: File
): Promise<{ message: string; data: { path: string; url: string } }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/struktur/${strukturId}/upload-foto`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal upload foto');
  }

  return response.json();
}
