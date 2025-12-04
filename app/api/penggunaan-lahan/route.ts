import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Ambil semua data penggunaan lahan
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("penggunaan_lahan")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) {
      console.error("Error fetching penggunaan lahan:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data penggunaan lahan" },
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

// POST - Tambah penggunaan lahan baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jenis, luas, persentase, urutan } = body;

    if (!jenis) {
      return NextResponse.json(
        { error: "Jenis penggunaan lahan harus diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("penggunaan_lahan")
      .insert({
        jenis,
        luas: luas || null,
        persentase: persentase || null,
        urutan: urutan || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating penggunaan lahan:", error);
      return NextResponse.json(
        { error: "Gagal menambah penggunaan lahan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, message: "Penggunaan lahan berhasil ditambahkan" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
