/**
 * Sejarah API - Client-side API calls
 */

import { SejarahDesaRow, SejarahKepalaDesaRow } from './supabase';

const API_BASE = '/api/sejarah';

// ============================================================================
// SEJARAH EVENTS
// ============================================================================

export interface SejarahEventsFilters {
  kategori?: string;
  includeInactive?: boolean;
}

export async function getSejarahEvents(filters?: SejarahEventsFilters): Promise<SejarahDesaRow[]> {
  const params = new URLSearchParams({ type: 'events' });
  if (filters?.kategori) params.set('kategori', filters.kategori);
  if (filters?.includeInactive) params.set('includeInactive', 'true');

  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data sejarah');
  const json = await res.json();
  return json.data || [];
}

export async function getSejarahEventById(id: string): Promise<SejarahDesaRow | null> {
  const res = await fetch(`${API_BASE}/${id}?type=events`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export interface CreateSejarahEventData {
  tahun: string;
  judul: string;
  deskripsi: string;
  kategori?: string;
  foto_url?: string | null;
  foto_path?: string | null;
  urutan?: number;
  is_highlight?: boolean;
}

export async function createSejarahEvent(data: CreateSejarahEventData): Promise<SejarahDesaRow> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'events', ...data }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Gagal menambah data sejarah');
  }
  const json = await res.json();
  return json.data;
}

export interface UpdateSejarahEventData {
  tahun?: string;
  judul?: string;
  deskripsi?: string;
  kategori?: string;
  foto_url?: string | null;
  foto_path?: string | null;
  urutan?: number;
  is_highlight?: boolean;
  is_active?: boolean;
}

export async function updateSejarahEvent(id: string, data: UpdateSejarahEventData): Promise<SejarahDesaRow> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'events', ...data }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Gagal memperbarui data sejarah');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteSejarahEvent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}?type=events`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Gagal menghapus data sejarah');
  }
}

// ============================================================================
// SEJARAH KEPALA DESA
// ============================================================================

export interface KepalaDesaFilters {
  includeInactive?: boolean;
}

export async function getSejarahKepala(filters?: KepalaDesaFilters): Promise<SejarahKepalaDesaRow[]> {
  const params = new URLSearchParams({ type: 'kepala' });
  if (filters?.includeInactive) params.set('includeInactive', 'true');

  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data kepala desa');
  const json = await res.json();
  return json.data || [];
}

export async function getSejarahKepalaById(id: string): Promise<SejarahKepalaDesaRow | null> {
  const res = await fetch(`${API_BASE}/${id}?type=kepala`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export interface CreateKepalaDesaData {
  nama: string;
  periode_mulai: string;
  periode_selesai?: string | null;
  pencapaian?: string | null;
  keterangan?: string | null;
  foto_url?: string | null;
  foto_path?: string | null;
  urutan?: number;
}

export async function createSejarahKepala(data: CreateKepalaDesaData): Promise<SejarahKepalaDesaRow> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'kepala', ...data }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Gagal menambah data kepala desa');
  }
  const json = await res.json();
  return json.data;
}

export interface UpdateKepalaDesaData {
  nama?: string;
  periode_mulai?: string;
  periode_selesai?: string | null;
  pencapaian?: string | null;
  keterangan?: string | null;
  foto_url?: string | null;
  foto_path?: string | null;
  urutan?: number;
  is_active?: boolean;
}

export async function updateSejarahKepala(id: string, data: UpdateKepalaDesaData): Promise<SejarahKepalaDesaRow> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'kepala', ...data }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Gagal memperbarui data kepala desa');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteSejarahKepala(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}?type=kepala`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Gagal menghapus data kepala desa');
  }
}

// ============================================================================
// KATEGORI SEJARAH
// ============================================================================

export const KATEGORI_SEJARAH = [
  { value: 'semua', label: 'Semua Kategori' },
  { value: 'pendirian', label: 'Pendirian Desa' },
  { value: 'kepemimpinan', label: 'Kepemimpinan' },
  { value: 'pembangunan', label: 'Pembangunan' },
  { value: 'budaya', label: 'Budaya & Tradisi' },
  { value: 'umum', label: 'Umum' },
] as const;

export type KategoriSejarah = typeof KATEGORI_SEJARAH[number]['value'];
