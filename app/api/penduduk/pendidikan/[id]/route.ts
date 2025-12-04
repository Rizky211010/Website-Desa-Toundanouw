import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH - Update pendidikan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("pendidikan_penduduk")
      .update({
        tingkat: body.tingkat,
        jumlah: body.jumlah,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pendidikan:", error);
      return NextResponse.json(
        { error: "Gagal mengupdate pendidikan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Pendidikan berhasil diupdate",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pendidikan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("pendidikan_penduduk")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting pendidikan:", error);
      return NextResponse.json(
        { error: "Gagal menghapus pendidikan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Pendidikan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
