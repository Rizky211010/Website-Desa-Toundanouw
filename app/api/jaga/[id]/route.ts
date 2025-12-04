import { NextResponse } from "next/server";
import { supabaseAdmin, JagaRow } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Ambil detail jaga by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("jaga")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching jaga:", error);
      return NextResponse.json(
        { error: "Jaga tidak ditemukan" },
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

// PATCH - Update jaga
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Partial<JagaRow> = {
      updated_at: new Date().toISOString(),
    };

    if (body.nama !== undefined) updateData.nama = body.nama;
    if (body.kepala_jaga !== undefined) updateData.kepala_jaga = body.kepala_jaga;
    if (body.area !== undefined) updateData.area = body.area;
    if (body.jumlah_kk !== undefined) updateData.jumlah_kk = body.jumlah_kk;
    if (body.jumlah_jiwa !== undefined) updateData.jumlah_jiwa = body.jumlah_jiwa;
    if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi;
    if (body.urutan !== undefined) updateData.urutan = body.urutan;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabaseAdmin
      .from("jaga")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating jaga:", error);
      return NextResponse.json(
        { error: "Gagal mengupdate jaga" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Jaga berhasil diupdate",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus jaga
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("jaga")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting jaga:", error);
      return NextResponse.json(
        { error: "Gagal menghapus jaga" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Jaga berhasil dihapus",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
