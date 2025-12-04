/**
 * POST /api/berita/[id]/upload-thumbnail
 * Upload thumbnail untuk berita
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File harus diupload' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Upload to storage
    const fileName = `berita/${id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('berita-thumbnails')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Gagal upload file: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('berita-thumbnails')
      .getPublicUrl(uploadData.path);

    // Update berita with thumbnail URL
    const { error: updateError } = await supabaseAdmin
      .from('berita')
      .update({
        thumbnail_path: uploadData.path,
        thumbnail_url: publicUrl,
      } as Record<string, unknown>)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update thumbnail: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Thumbnail berhasil diupload',
        data: { path: uploadData.path, url: publicUrl },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Berita Upload Thumbnail Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
