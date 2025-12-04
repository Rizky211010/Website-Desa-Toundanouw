/**
 * Organisasi API utilities
 * Helper functions untuk interact dengan Organisasi Desa API
 */

export type Organisasi = {
  id: string;
  nama: string;
  singkatan: string | null;
  ketua: string;
  wakil_ketua: string | null;
  sekretaris: string | null;
  bendahara: string | null;
  jumlah_anggota: number;
  deskripsi: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  foto_url: string | null;
  kategori: string; // 'lembaga_desa', 'organisasi_masyarakat', 'kelompok_usaha'
  urutan: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateOrganisasiInput = {
  nama: string;
  singkatan?: string;
  ketua: string;
  wakil_ketua?: string;
  sekretaris?: string;
  bendahara?: string;
  jumlah_anggota?: number;
  deskripsi?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  kategori?: string;
  urutan?: number;
};

/**
 * Get semua organisasi (active only untuk publik)
 */
export async function getOrganisasiList(includeInactive = false): Promise<{
  data: Organisasi[];
  total: number;
}> {
  const url = includeInactive ? '/api/organisasi?all=true' : '/api/organisasi';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Gagal mengambil data organisasi');
  }

  return response.json();
}

/**
 * Get single organisasi by ID
 */
export async function getOrganisasiDetail(id: string): Promise<{ data: Organisasi }> {
  const response = await fetch(`/api/organisasi/${id}`);

  if (!response.ok) {
    throw new Error('Gagal mengambil detail organisasi');
  }

  return response.json();
}

/**
 * Create organisasi baru (admin only)
 */
export async function createOrganisasi(
  input: CreateOrganisasiInput
): Promise<{ message: string; data: Organisasi }> {
  const response = await fetch('/api/organisasi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal membuat organisasi');
  }

  return response.json();
}

/**
 * Update organisasi (admin only)
 */
export async function updateOrganisasi(
  id: string,
  updates: Partial<Organisasi>
): Promise<{ message: string; data: Organisasi }> {
  const response = await fetch(`/api/organisasi/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal update organisasi');
  }

  return response.json();
}

/**
 * Delete organisasi (admin only)
 */
export async function deleteOrganisasi(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/organisasi/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal menghapus organisasi');
  }

  return response.json();
}
