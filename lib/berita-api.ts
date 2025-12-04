/**
 * Berita API utilities
 * Helper functions untuk interact dengan Berita API
 */

import { Tables } from './supabase';
import { BeritaStatus } from './roles';

export type BeritaListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  status: BeritaStatus;
  thumbnail_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  author_id?: string | null;
  rejected_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  users?: { full_name: string };
};

export type BeritaDetail = BeritaListItem & {
  content: string;
  updated_at: string;
  users?: {
    id: string;
    full_name: string;
    email: string;
  };
};

/**
 * Get all berita (published for public, all for admin)
 */
export async function getBerita(
  status?: BeritaStatus,
  category?: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ data: BeritaListItem[]; pagination: any }> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const response = await fetch(`/api/berita?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil berita');
  }

  return response.json();
}

/**
 * Get single berita by ID or slug
 */
export async function getBeritaDetail(idOrSlug: string): Promise<{ data: BeritaDetail }> {
  const response = await fetch(`/api/berita/${idOrSlug}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Berita tidak ditemukan');
  }

  return response.json();
}

/**
 * Create new berita (admin only)
 */
export async function createBerita(
  title: string,
  content: string,
  excerpt?: string,
  category?: string,
  status?: 'draft' | 'published'
): Promise<{ message: string; data: any }> {
  const response = await fetch('/api/berita', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title,
      content,
      excerpt,
      category,
      status,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal membuat berita');
  }

  return response.json();
}

/**
 * Update berita (admin only)
 */
export async function updateBerita(
  id: string,
  updates: Partial<{
    title: string;
    content: string;
    excerpt: string;
    category: string;
    status: 'draft' | 'published';
    published_at: string;
  }>
): Promise<{ message: string; data: any }> {
  const response = await fetch(`/api/berita/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal update berita');
  }

  return response.json();
}

/**
 * Delete berita (admin only)
 */
export async function deleteBerita(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/berita/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal hapus berita');
  }

  return response.json();
}

/**
 * Upload thumbnail untuk berita
 */
export async function uploadBeritaThumbnail(
  beritaId: string,
  file: File
): Promise<{ message: string; data: { path: string; url: string } }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/berita/${beritaId}/upload-thumbnail`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Gagal upload thumbnail');
  }

  return response.json();
}
