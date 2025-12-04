/**
 * GET /api/notifications
 * Get all notifications (admin only)
 * POST /api/notifications
 * Create new notification (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' });

    // Filter unread only
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    // Sort by newest first
    query = query.order('created_at', { ascending: false });

    // Limit
    query = query.limit(limit);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Notifications GET Error]', error);
      return NextResponse.json(
        { error: 'Gagal mengambil notifikasi: ' + error.message },
        { status: 500 }
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return NextResponse.json({
      data,
      unreadCount: unreadCount || 0,
      total: count,
    });
  } catch (error) {
    console.error('[Notifications GET Error]', error);
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
    const { title, message, type = 'info', link, metadata } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title dan message harus diisi' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        title,
        message,
        type,
        link,
        metadata,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Notifications POST Error]', error);
      return NextResponse.json(
        { error: 'Gagal membuat notifikasi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Notifikasi berhasil dibuat',
      data,
    }, { status: 201 });
  } catch (error) {
    console.error('[Notifications POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
