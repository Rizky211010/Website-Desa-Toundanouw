/**
 * GET /api/settings
 * Get all site settings or by category
 * PUT /api/settings
 * Update multiple settings (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Interface untuk settings
interface SettingItem {
  key: string;
  value: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let query = supabaseAdmin
      .from('site_settings')
      .select('key, value, description');

    // All settings are returned (no category filtering)

    const { data, error } = await query.order('key');

    if (error) {
      console.error('[Settings GET Error]', error);
      return NextResponse.json(
        { error: 'Gagal mengambil pengaturan: ' + error.message },
        { status: 500 }
      );
    }

    // Transform ke object untuk kemudahan akses
    const settings: Record<string, string> = {};
    (data || []).forEach((item: SettingItem) => {
      settings[item.key] = item.value || '';
    });

    return NextResponse.json({
      data: settings,
      raw: data,
    });
  } catch (error) {
    console.error('[Settings GET Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Format data tidak valid' },
        { status: 400 }
      );
    }

    // Update each setting
    const updates = Object.entries(settings).map(async ([key, value]) => {
      // Upsert - insert if not exists, update if exists
      const { error } = await supabaseAdmin
        .from('site_settings')
        .upsert(
          { 
            key, 
            value: value as string,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );

      if (error) {
        console.error(`Error updating ${key}:`, error);
        return { key, success: false, error: error.message };
      }
      return { key, success: true };
    });

    const results = await Promise.all(updates);
    const failed = results.filter(r => !r.success);

    if (failed.length > 0) {
      return NextResponse.json(
        { 
          error: 'Beberapa pengaturan gagal disimpan',
          details: failed 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Pengaturan berhasil disimpan',
      updated: results.length
    });
  } catch (error) {
    console.error('[Settings PUT Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
