import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Ambil semua data agama
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("agama_penduduk")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) {
      console.error("Error fetching agama:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data agama" },
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

// POST - Tambah agama baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if agama already exists
    const { data: existing } = await supabaseAdmin
      .from("agama_penduduk")
      .select("id")
      .eq("nama", body.nama)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: `Agama "${body.nama}" sudah ada` },
        { status: 400 }
      );
    }

    // Get highest urutan
    const { data: maxUrutan } = await supabaseAdmin
      .from("agama_penduduk")
      .select("urutan")
      .order("urutan", { ascending: false })
      .limit(1)
      .single();

    const newUrutan = (maxUrutan?.urutan || 0) + 1;

    const { data, error } = await supabaseAdmin
      .from("agama_penduduk")
      .insert({
        nama: body.nama,
        jumlah: body.jumlah || 0,
        urutan: newUrutan,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating agama:", error);
      return NextResponse.json(
        { error: "Gagal menambah agama" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Agama berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
