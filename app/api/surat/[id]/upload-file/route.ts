/**
 * POST /api/surat/[id]/upload-file
 * Upload file template untuk surat
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File harus diupload' },
        { status: 400 }
      );
    }

    // Validate file type (docx, doc, pdf)
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/pdf',
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File harus berupa .docx, .doc, atau .pdf' },
        { status: 400 }
      );
    }

    // Upload to storage
    const fileName = `surat/${id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('surat-templates')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Gagal upload file: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('surat-templates')
      .getPublicUrl(uploadData.path);

    // Determine file format
    const fileFormat = file.name.endsWith('.pdf') ? 'pdf' : 'docx';

    // Update surat with file URL
    const { error: updateError } = await supabaseAdmin
      .from('surat_templates')
      .update({
        file_path: uploadData.path,
        file_url: publicUrl,
        file_format: fileFormat,
      } as Record<string, unknown>)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update file: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'File berhasil diupload',
        data: { path: uploadData.path, url: publicUrl, format: fileFormat },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Surat Upload File Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
