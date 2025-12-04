/**
 * Surat API utilities
 * Helper functions untuk interact dengan Surat API
 */

import { Tables } from './supabase';

export type SuratTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  file_format: string;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  content?: string;
};

export type SuratDownloadLog = {
  id: string;
  surat_id: string;
  ip_address: string | null;
  user_agent: string | null;
  downloaded_at: string;
};

/**
 * Get all surat templates (active untuk public, all untuk admin)
 */
export async function getSuratTemplates(
  category?: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ data: SuratTemplate[]; pagination: any }> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const response = await fetch(`/api/surat?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil surat templates');
  }

  return response.json();
}

/**
 * Get single surat template by ID or slug
 */
export async function getSuratTemplate(idOrSlug: string): Promise<{ data: SuratTemplate }> {
  const response = await fetch(`/api/surat/${idOrSlug}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Surat template tidak ditemukan');
  }

  return response.json();
}

/**
 * Create new surat template (admin only)
 */
export async function createSuratTemplate(
  name: string,
  content: string,
  description?: string,
  category?: string,
  file_format?: string
): Promise<{ message: string; data: SuratTemplate }> {
  const response = await fetch('/api/surat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name,
      content,
      description,
      category,
      file_format,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal membuat surat template');
  }

  return response.json();
}

/**
 * Update surat template (admin only)
 */
export async function updateSuratTemplate(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    content: string;
    category: string;
    file_format: string;
    is_active: boolean;
  }>
): Promise<{ message: string; data: SuratTemplate }> {
  const response = await fetch(`/api/surat/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal update surat template');
  }

  return response.json();
}

/**
 * Delete surat template (admin only)
 */
export async function deleteSuratTemplate(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/surat/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal hapus surat template');
  }

  return response.json();
}

/**
 * Upload file template untuk surat
 */
export async function uploadSuratFile(
  suratId: string,
  file: File
): Promise<{ message: string; data: { path: string; url: string; format: string } }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/surat/${suratId}/upload-file`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal upload file');
  }

  return response.json();
}

/**
 * Get download log untuk surat (admin only)
 */
export async function getSuratDownloadLog(
  suratId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: SuratDownloadLog[]; pagination: any }> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const response = await fetch(`/api/surat/${suratId}/downloads?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal mengambil download log');
  }

  return response.json();
}
