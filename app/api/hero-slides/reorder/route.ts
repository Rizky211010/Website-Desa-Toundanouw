/**
 * POST /api/hero-slides/reorder
 * Reorder slides (admin only)
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

    const body = await request.json();
    const { slides } = body; // Array of { id, order_index }

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { error: 'Data slides tidak valid' },
        { status: 400 }
      );
    }

    // Update each slide's urutan (mapped from order_index)
    const updates = slides.map((slide: { id: string; order_index: number }) =>
      supabaseAdmin
        .from('hero_slides')
        .update({ urutan: slide.order_index })
        .eq('id', slide.id)
    );

    await Promise.all(updates);

    return NextResponse.json({
      message: 'Urutan slide berhasil diperbarui',
    });
  } catch (error) {
    console.error('[Hero Slides Reorder Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
