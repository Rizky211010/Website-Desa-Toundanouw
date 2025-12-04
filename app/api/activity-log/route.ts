import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hasPermission, type UserRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

// Helper to get current user from request
async function getCurrentUser(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  if (!authToken) return null;

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, is_active')
    .eq('id', authToken)
    .single();

  if (error || !user || !user.is_active) return null;
  return user as { id: string; email: string; full_name: string; role: UserRole; is_active: boolean };
}

/**
 * GET /api/activity-log
 * Mengambil activity log (hanya untuk super_admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission - only super_admin can view all logs
    if (!hasPermission(user.role, 'log.read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const entityType = searchParams.get('entity_type');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build query
    let query = supabaseAdmin
      .from('activity_log')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name,
          role
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (action) {
      query = query.eq('action', action);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Activity log fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/activity-log
 * Mencatat activity log baru
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, entity_type, entity_id, entity_title, details } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Get IP and User Agent
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert activity log
    const { data, error } = await supabaseAdmin
      .from('activity_log')
      .insert({
        user_id: user.id,
        action,
        entity_type,
        entity_id,
        entity_title,
        details,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Activity log insert error:', error);
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
