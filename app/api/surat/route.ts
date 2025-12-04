/**
 * GET /api/surat
 * Get all surat templates (active untuk public)
 * POST /api/surat
 * Create new surat template (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const showAll = searchParams.get('all') === 'true'; // untuk admin

    // Use supabaseAdmin untuk bypass RLS dan menampilkan semua data
    let query = supabaseAdmin.from('surat_templates').select(
      `
      id,
      name,
      slug,
      description,
      content,
      category,
      file_format,
      file_url,
      file_path,
      is_active,
      created_at
      `,
      { count: 'exact' }
    );

    // Filter by active (default untuk public, kecuali admin request all)
    if (!showAll) {
      query = query.eq('is_active', true);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Sort by created date
    query = query.order('created_at', { ascending: false });

    // Pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil surat: ' + error.message },
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
    console.error('[Surat GET Error]', error);
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

    const body = await request.json();
    const { name, description, content, category, file_format } = body;

    // Validation
    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name dan content harus diisi' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Create surat template
    const { data: newSurat, error: createError } = await supabaseAdmin
      .from('surat_templates')
      .insert({
        name,
        slug,
        description: description || name,
        content,
        category: category || 'umum',
        file_format: file_format || 'docx',
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Gagal membuat surat: ' + createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Surat template berhasil dibuat', data: newSurat },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Surat POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
