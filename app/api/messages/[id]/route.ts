/**
 * PATCH /api/messages/[id]
 * Update message status (read, replied, archived)
 * DELETE /api/messages/[id]
 * Delete message
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
    const { status } = body;

    const updateData: Record<string, unknown> = {};

    // Convert status to is_read boolean
    // Admin sends: 'unread', 'read', 'replied', 'archived'
    // Database has: is_read (boolean)
    if (status) {
      // Mark as read for any status except 'unread'
      if (status === 'unread') {
        updateData.is_read = false;
      } else {
        updateData.is_read = true;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Messages PATCH Error]', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui pesan: ' + error.message },
        { status: 500 }
      );
    }

    // Transform response to match admin expectations
    const transformedData = {
      id: data.id,
      nama: data.name || '',
      kontak: data.email || '',
      pesan: data.message || '',
      status: data.is_read ? 'read' : 'unread',
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
    };

    return NextResponse.json({
      message: 'Pesan berhasil diperbarui',
      data: transformedData,
    });
  } catch (error) {
    console.error('[Messages PATCH Error]', error);
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
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Messages DELETE Error]', error);
      return NextResponse.json(
        { error: 'Gagal menghapus pesan: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Pesan berhasil dihapus',
    });
  } catch (error) {
    console.error('[Messages DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
