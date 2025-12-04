/**
 * GET /api/galeri
 * Get all galeri (with optional filtering)
 * POST /api/galeri
 * Create new galeri entry (admin/editor)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { type UserRole } from '@/lib/roles';

// Helper untuk mendapatkan user dari auth token
async function getAuthUser(authToken: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, is_active')
    .eq('id', authToken)
    .single();
  return user as { id: string; email: string; full_name: string; role: UserRole; is_active: boolean } | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const kategori = searchParams.get('kategori');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const authorId = searchParams.get('author_id'); // Filter by author for editor

    // Check auth for filtering
    const authToken = request.cookies.get('auth_token')?.value;
    let currentUser = null;
    
    if (authToken) {
      currentUser = await getAuthUser(authToken);
    }

    let query = supabase
      .from('galeri')
      .select('*, users:author_id(id, full_name)', { count: 'exact' });

    // Filter by kategori
    if (kategori) {
      query = query.eq('kategori', kategori);
    }

    // Filter by featured
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Filter by author_id
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    // Sort by urutan then by uploaded_at
    query = query.order('urutan', { ascending: true, nullsFirst: false })
      .order('uploaded_at', { ascending: false });

    // Pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil galeri: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data,
        pagination: {
          total: count,
          limit,
          offset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Galeri GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get current user
    const currentUser = await getAuthUser(authToken);
    if (!currentUser || !currentUser.is_active) {
      return NextResponse.json(
        { error: 'User tidak valid atau tidak aktif' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const judul = formData.get('judul') as string;
    const deskripsi = formData.get('deskripsi') as string;
    const kategori = formData.get('kategori') as string;
    const is_featured = formData.get('is_featured') === 'true';

    if (!file || !judul) {
      return NextResponse.json(
        { error: 'File dan judul harus diisi' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Upload to storage
    const fileName = `galeri/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('galeri')
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json(
        { error: 'Gagal upload file: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('galeri')
      .getPublicUrl(uploadData.path);

    // Create galeri entry
    const { data: newGaleri, error: createError } = await supabaseAdmin
      .from('galeri')
      .insert({
        judul,
        deskripsi: deskripsi || null,
        kategori: kategori || 'umum',
        foto_path: uploadData.path,
        foto_url: publicUrl,
        is_featured,
        author_id: currentUser.id, // Track ownership
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Gagal membuat galeri: ' + createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Galeri berhasil dibuat', data: newGaleri },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Galeri POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
