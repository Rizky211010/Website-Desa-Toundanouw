/**
 * GET /api/surat/[id]/downloads
 * Get download log untuk surat (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const limit = request.nextUrl.searchParams.get('limit') 
      ? parseInt(request.nextUrl.searchParams.get('limit')!) 
      : 50;
    const offset = request.nextUrl.searchParams.get('offset') 
      ? parseInt(request.nextUrl.searchParams.get('offset')!) 
      : 0;

    // Get download logs
    const { data, error, count } = await supabaseAdmin
      .from('surat_downloads')
      .select('*', { count: 'exact' })
      .eq('surat_id', id)
      .order('downloaded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil download log: ' + error.message },
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
    console.error('[Surat Downloads GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
