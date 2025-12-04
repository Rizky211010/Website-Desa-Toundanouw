/**
 * POST /api/notifications/read-all
 * Mark all notifications as read (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('is_read', false);

    if (error) {
      console.error('[Notifications Read All Error]', error);
      return NextResponse.json(
        { error: 'Gagal menandai semua notifikasi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Semua notifikasi telah ditandai sebagai dibaca',
    });
  } catch (error) {
    console.error('[Notifications Read All Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
