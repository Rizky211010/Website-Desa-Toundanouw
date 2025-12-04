import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Ambil semua data pendidikan
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("pendidikan_penduduk")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) {
      console.error("Error fetching pendidikan:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data pendidikan" },
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

// POST - Tambah pendidikan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if tingkat already exists
    const { data: existing } = await supabaseAdmin
      .from("pendidikan_penduduk")
      .select("id")
      .eq("tingkat", body.tingkat)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: `Tingkat pendidikan "${body.tingkat}" sudah ada` },
        { status: 400 }
      );
    }

    // Get highest urutan
    const { data: maxUrutan } = await supabaseAdmin
      .from("pendidikan_penduduk")
      .select("urutan")
      .order("urutan", { ascending: false })
      .limit(1)
      .single();

    const newUrutan = (maxUrutan?.urutan || 0) + 1;

    const { data, error } = await supabaseAdmin
      .from("pendidikan_penduduk")
      .insert({
        tingkat: body.tingkat,
        jumlah: body.jumlah || 0,
        urutan: newUrutan,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating pendidikan:", error);
      return NextResponse.json(
        { error: "Gagal menambah pendidikan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Pendidikan berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
