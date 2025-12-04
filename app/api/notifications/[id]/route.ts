/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 * DELETE /api/notifications/[id]
 * Delete notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { is_read } = body;

    const updateData: Record<string, unknown> = {};

    if (typeof is_read === 'boolean') {
      updateData.is_read = is_read;
      if (is_read) {
        updateData.read_at = new Date().toISOString();
      } else {
        updateData.read_at = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Notifications PATCH Error]', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui notifikasi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Notifikasi berhasil diperbarui',
      data,
    });
  } catch (error) {
    console.error('[Notifications PATCH Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Notifications DELETE Error]', error);
      return NextResponse.json(
        { error: 'Gagal menghapus notifikasi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Notifikasi berhasil dihapus',
    });
  } catch (error) {
    console.error('[Notifications DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
