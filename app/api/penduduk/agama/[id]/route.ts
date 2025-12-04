import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH - Update agama
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("agama_penduduk")
      .update({
        nama: body.nama,
        jumlah: body.jumlah,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating agama:", error);
      return NextResponse.json(
        { error: "Gagal mengupdate agama" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Agama berhasil diupdate",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus agama
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("agama_penduduk")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting agama:", error);
      return NextResponse.json(
        { error: "Gagal menghapus agama" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Agama berhasil dihapus",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
