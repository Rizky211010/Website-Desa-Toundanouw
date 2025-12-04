/**
 * GET /api/surat/downloads
 * Get all download logs (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search') || '';
    const suratId = searchParams.get('surat_id') || '';

    // Build query with join to get surat name
    let query = supabaseAdmin
      .from('surat_downloads')
      .select(`
        id,
        surat_id,
        ip_address,
        user_agent,
        downloaded_at,
        surat_templates (
          id,
          name,
          slug
        )
      `, { count: 'exact' });

    // Filter by surat_id if provided
    if (suratId) {
      query = query.eq('surat_id', suratId);
    }

    // Sort by downloaded_at descending
    query = query.order('downloaded_at', { ascending: false });

    // Pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil download log: ' + error.message },
        { status: 500 }
      );
    }

    // Transform data for easier frontend consumption
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedData = data?.map((item: any) => {
      // surat_templates might be array or single object depending on relation
      const suratData = Array.isArray(item.surat_templates) 
        ? item.surat_templates[0] 
        : item.surat_templates;
      return {
        id: item.id,
        surat_id: item.surat_id,
        surat_name: suratData?.name || 'Unknown',
        ip_address: item.ip_address,
        user_agent: item.user_agent,
        downloaded_at: item.downloaded_at,
      };
    }) || [];

    // If search is provided, filter on frontend (since we can't easily search join)
    let filteredData = transformedData;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = transformedData.filter(item => 
        item.surat_name.toLowerCase().includes(searchLower) ||
        (item.ip_address && item.ip_address.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json(
      {
        data: filteredData,
        pagination: {
          total: count,
          limit,
          offset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Surat Downloads GET All Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
