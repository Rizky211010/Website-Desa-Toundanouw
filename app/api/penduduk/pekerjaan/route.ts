import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Ambil semua data pekerjaan
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("pekerjaan_penduduk")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) {
      console.error("Error fetching pekerjaan:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data pekerjaan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST - Tambah pekerjaan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get highest urutan
    const { data: maxUrutan } = await supabaseAdmin
      .from("pekerjaan_penduduk")
      .select("urutan")
      .order("urutan", { ascending: false })
      .limit(1)
      .single();

    const newUrutan = (maxUrutan?.urutan || 0) + 1;

    const { data, error } = await supabaseAdmin
      .from("pekerjaan_penduduk")
      .insert({
        jenis: body.jenis,
        jumlah: body.jumlah || 0,
        icon: body.icon || null,
        urutan: newUrutan,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating pekerjaan:", error);
      return NextResponse.json(
        { error: "Gagal menambah pekerjaan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Pekerjaan berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
