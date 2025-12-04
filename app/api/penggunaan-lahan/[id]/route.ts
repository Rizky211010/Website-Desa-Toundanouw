import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH - Update penggunaan lahan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { jenis, luas, persentase, urutan } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (jenis !== undefined) updateData.jenis = jenis;
    if (luas !== undefined) updateData.luas = luas;
    if (persentase !== undefined) updateData.persentase = persentase;
    if (urutan !== undefined) updateData.urutan = urutan;

    const { data, error } = await supabaseAdmin
      .from("penggunaan_lahan")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating penggunaan lahan:", error);
      return NextResponse.json(
        { error: "Gagal mengupdate penggunaan lahan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, message: "Penggunaan lahan berhasil diupdate" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus penggunaan lahan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("penggunaan_lahan")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting penggunaan lahan:", error);
      return NextResponse.json(
        { error: "Gagal menghapus penggunaan lahan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Penggunaan lahan berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
