/**
 * GET /api/hero-slides
 * Get all hero slides (public and admin)
 * POST /api/hero-slides
 * Create new slide (admin only)
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
    secondary_button_text: null, // Not in DB schema
    secondary_button_url: null,  // Not in DB schema
    is_active: dbSlide.is_active,
    created_at: dbSlide.created_at,
    updated_at: dbSlide.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabaseAdmin
      .from('hero_slides')
      .select('*')
      .order('urutan', { ascending: true });

    // Filter active only for public
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Hero Slides GET Error]', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data slides: ' + error.message },
        { status: 500 }
      );
    }

    // Map to frontend format
    const mappedData = (data || []).map(mapDbToFrontend);

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error('[Hero Slides GET Error]', error);
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
    const {
      headline,
      subheadline,
      image_url,
      primary_button_text,
      primary_button_url,
      is_active = true,
    } = body;

    if (!headline) {
      return NextResponse.json(
        { error: 'Headline harus diisi' },
        { status: 400 }
      );
    }

    // Get max urutan
    const { data: maxOrder } = await supabaseAdmin
      .from('hero_slides')
      .select('urutan')
      .order('urutan', { ascending: false })
      .limit(1)
      .single();

    const newUrutan = (maxOrder?.urutan || 0) + 1;

    // Check max 5 slides
    const { count } = await supabaseAdmin
      .from('hero_slides')
      .select('*', { count: 'exact', head: true });

    if ((count || 0) >= 5) {
      return NextResponse.json(
        { error: 'Maksimal 5 slide diizinkan' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .insert({
        urutan: newUrutan,
        title: headline,
        subtitle: subheadline,
        image_url,
        link_text: primary_button_text,
        link_url: primary_button_url,
        is_active,
      })
      .select()
      .single();

    if (error) {
      console.error('[Hero Slides POST Error]', error);
      return NextResponse.json(
        { error: 'Gagal membuat slide: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Slide berhasil dibuat', data: mapDbToFrontend(data) },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Hero Slides POST Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
