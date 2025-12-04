/**
 * POST /api/messages
 * Submit contact message from public form
 * GET /api/messages
 * Get all messages (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, kontak, pesan } = body;

    // Validation
    if (!nama || !kontak || !pesan) {
      return NextResponse.json(
        { error: 'Nama, kontak, dan pesan harus diisi' },
        { status: 400 }
      );
    }

    // Get IP and User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert message
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        name: nama.trim(),
        email: kontak.trim(),
        message: pesan.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Messages POST Error]', error);
      return NextResponse.json(
        { error: 'Gagal mengirim pesan: ' + error.message },
        { status: 500 }
      );
    }

    // Create notification for admin
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          title: 'Pesan Baru dari ' + nama.trim(),
          message: pesan.trim().substring(0, 100) + (pesan.length > 100 ? '...' : ''),
          type: 'message',
          link: '/admin/pesan',
          is_read: false,
        });
    } catch (notifError) {
      // Don't fail the request if notification fails
      console.error('[Notification Create Error]', notifError);
    }

    return NextResponse.json(
      { 
        message: 'Pesan berhasil dikirim',
        data 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Messages POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let query = supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact' });

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'unread') {
        query = query.eq('is_read', false);
      } else if (status === 'read') {
        query = query.eq('is_read', true);
      }
    }

    // Sort by newest first
    query = query.order('created_at', { ascending: false });

    // Pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('[Messages GET Error]', error);
      return NextResponse.json(
        { error: 'Gagal mengambil pesan: ' + error.message },
        { status: 500 }
      );
    }

    // Transform data to match admin page expectations
    // DB fields: name, email, message, is_read
    // Admin expects: nama, kontak, pesan, status
    const transformedData = (data || []).map((msg: Record<string, unknown>) => ({
      id: msg.id,
      nama: msg.name || '',
      kontak: msg.email || '',
      pesan: msg.message || '',
      status: msg.is_read ? 'read' : 'unread',
      created_at: msg.created_at,
      updated_at: msg.updated_at || msg.created_at,
    }));

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return NextResponse.json({
      data: transformedData,
      unreadCount: unreadCount || 0,
      pagination: {
        total: count,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('[Messages GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
