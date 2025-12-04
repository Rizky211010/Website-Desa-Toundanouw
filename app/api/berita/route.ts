/**
 * GET /api/berita
 * Get all published berita (untuk public)
 * GET /api/berita?status=draft (untuk admin)
 * POST /api/berita
 * Create new berita (admin/editor)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper untuk mendapatkan user dari auth token
async function getAuthUser(authToken: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, is_active')
    .eq('id', authToken)
    .single();
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const authorId = searchParams.get('author_id'); // Filter by author for editor

    // Check if admin (dari cookie)
    const authToken = request.cookies.get('auth_token')?.value;
    let currentUser = null;
    
    if (authToken) {
      currentUser = await getAuthUser(authToken);
    }

    let query = supabaseAdmin.from('berita').select(
      `
      id,
      title,
      slug,
      excerpt,
      category,
      status,
      thumbnail_url,
      view_count,
      published_at,
      created_at,
      author_id,
      rejected_reason,
      reviewed_by,
      reviewed_at,
      users:author_id(id, full_name)
      `,
      { count: 'exact' }
    );

    // Filter by status based on user role
    if (status) {
      query = query.eq('status', status);
    } else if (!currentUser) {
      // Public: only published
      query = query.eq('status', 'published');
    }
    // Admin/Super Admin: can see all statuses

    // Filter by author_id
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Sort by published date
    query = query.order('published_at', { ascending: false, nullsFirst: false });

    // Pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil berita: ' + error.message },
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
    console.error('[Berita GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/berita
 * Create new berita (admin/editor)
 * Editor: status awal harus draft atau pending_review
 */
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

    const body = await request.json();
    const { title, content, excerpt, category, status: requestedStatus, thumbnail_url, thumbnail_path } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title dan content harus diisi' },
        { status: 400 }
      );
    }

    // Determine status - only draft or published for admin/super_admin
    let finalStatus = requestedStatus || 'draft';
    if (!['draft', 'published'].includes(finalStatus)) {
      finalStatus = 'draft';
    }

    // Generate slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug exists and add suffix if needed
    let slug = baseSlug;
    let slugExists = true;
    let counter = 0;

    while (slugExists) {
      const { data: existingBerita } = await supabaseAdmin
        .from('berita')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingBerita) {
        slugExists = false;
      } else {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
    }

    // Create berita
    const insertData: Record<string, unknown> = {
      title,
      slug,
      content,
      excerpt: excerpt || title.substring(0, 100),
      category: category || 'umum',
      status: finalStatus,
      author_id: currentUser.id,
      thumbnail_url: thumbnail_url || null,
      thumbnail_path: thumbnail_path || null,
    };

    // Set published_at if status is published (only for admin/super_admin)
    if (finalStatus === 'published') {
      insertData.published_at = new Date().toISOString();
    }

    const { data: newBerita, error: createError } = await supabaseAdmin
      .from('berita')
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Gagal membuat berita: ' + createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Berita berhasil dibuat', data: newBerita },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Berita POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
