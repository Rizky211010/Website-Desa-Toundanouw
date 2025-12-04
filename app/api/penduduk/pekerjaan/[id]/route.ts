import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Ambil detail pekerjaan by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("pekerjaan_penduduk")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching pekerjaan:", error);
      return NextResponse.json(
        { error: "Pekerjaan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PATCH - Update pekerjaan
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.jenis !== undefined) updateData.jenis = body.jenis;
    if (body.jumlah !== undefined) updateData.jumlah = body.jumlah;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.urutan !== undefined) updateData.urutan = body.urutan;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabaseAdmin
      .from("pekerjaan_penduduk")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pekerjaan:", error);
      return NextResponse.json(
        { error: "Gagal mengupdate pekerjaan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Pekerjaan berhasil diupdate",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pekerjaan
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("pekerjaan_penduduk")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting pekerjaan:", error);
      return NextResponse.json(
        { error: "Gagal menghapus pekerjaan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Pekerjaan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
