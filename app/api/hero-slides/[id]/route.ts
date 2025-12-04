/**
 * GET /api/hero-slides/[id]
 * Get single slide
 * PATCH /api/hero-slides/[id]
 * Update slide (admin only)
 * DELETE /api/hero-slides/[id]
 * Delete slide (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper function to map database fields to frontend fields
function mapDbToFrontend(dbSlide: Record<string, unknown>) {
  return {
    id: dbSlide.id,
    order_index: dbSlide.urutan,
    headline: dbSlide.title,
    subheadline: dbSlide.subtitle,
    image_url: dbSlide.image_url,
    primary_button_text: dbSlide.link_text,
    primary_button_url: dbSlide.link_url,
    secondary_button_text: null,
    secondary_button_url: null,
    is_active: dbSlide.is_active,
    created_at: dbSlide.created_at,
    updated_at: dbSlide.updated_at,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Hero Slides GET Error]', error);
      return NextResponse.json(
        { error: 'Slide tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: mapDbToFrontend(data) });
  } catch (error) {
    console.error('[Hero Slides GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Map frontend fields to database fields
    const updateData: Record<string, unknown> = {};
    
    if (body.headline !== undefined) updateData.title = body.headline;
    if (body.subheadline !== undefined) updateData.subtitle = body.subheadline;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.primary_button_text !== undefined) updateData.link_text = body.primary_button_text;
    if (body.primary_button_url !== undefined) updateData.link_url = body.primary_button_url;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.order_index !== undefined) updateData.urutan = body.order_index;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Hero Slides PATCH Error]', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui slide: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Slide berhasil diperbarui',
      data: mapDbToFrontend(data),
    });
  } catch (error) {
    console.error('[Hero Slides PATCH Error]', error);
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
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Hero Slides DELETE Error]', error);
      return NextResponse.json(
        { error: 'Gagal menghapus slide: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Slide berhasil dihapus',
    });
  } catch (error) {
    console.error('[Hero Slides DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
