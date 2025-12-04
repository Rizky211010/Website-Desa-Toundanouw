import { NextResponse } from "next/server";
import { supabaseAdmin, JagaRow } from "@/lib/supabase";

// GET - Ambil semua data jaga
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("jaga")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) {
      console.error("Error fetching jaga:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data jaga" },
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

// POST - Tambah jaga baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get highest urutan
    const { data: maxUrutan } = await supabaseAdmin
      .from("jaga")
      .select("urutan")
      .order("urutan", { ascending: false })
      .limit(1)
      .single();

    const newUrutan = (maxUrutan?.urutan || 0) + 1;

    const insertData: Partial<JagaRow> = {
      nama: body.nama,
      kepala_jaga: body.kepala_jaga || null,
      area: body.area || null,
      jumlah_kk: body.jumlah_kk || 0,
      jumlah_jiwa: body.jumlah_jiwa || 0,
      deskripsi: body.deskripsi || null,
      urutan: newUrutan,
      is_active: true,
    };

    const { data, error } = await supabaseAdmin
      .from("jaga")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating jaga:", error);
      return NextResponse.json(
        { error: "Gagal menambah jaga" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: "Jaga berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
