import { NextResponse } from "next/server";
import { supabaseAdmin, WilayahDesaRow } from "@/lib/supabase";

// GET - Ambil data wilayah desa
export async function GET() {
  try {
    // First check all rows
    const { data: allRows, error: allError } = await supabaseAdmin
      .from("wilayah_desa")
      .select("*");
    
    // Return first row if exists
    const data = allRows && allRows.length > 0 ? allRows[0] : null;

    if (allError) {
      console.error("Error fetching wilayah:", allError);
      return NextResponse.json(
        { error: "Gagal mengambil data wilayah" },
        { status: 500 }
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

// POST - Buat atau update data wilayah desa (singleton - hanya 1 row)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Helper function to parse numeric values
    const parseNumber = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'string' ? parseFloat(val) : Number(val);
      return isNaN(num) ? null : num;
    };

    // Helper function to parse string values
    const parseString = (val: unknown): string | null => {
      if (val === null || val === undefined || val === '') return null;
      return String(val);
    };

    const updateData: Partial<WilayahDesaRow> = {
      luas_wilayah: parseNumber(body.luas_wilayah),
      ketinggian: parseNumber(body.ketinggian),
      curah_hujan: parseNumber(body.curah_hujan),
      suhu_min: parseNumber(body.suhu_min),
      suhu_max: parseNumber(body.suhu_max),
      batas_utara: parseString(body.batas_utara),
      batas_selatan: parseString(body.batas_selatan),
      batas_barat: parseString(body.batas_barat),
      batas_timur: parseString(body.batas_timur),
      google_maps_url: parseString(body.google_maps_url),
      google_maps_embed: parseString(body.google_maps_embed),
    };

    // Get existing data (use first row if multiple exist)
    const { data: existingRows } = await supabaseAdmin
      .from("wilayah_desa")
      .select("id")
      .order("updated_at", { ascending: false });

    let result;
    
    if (existingRows && existingRows.length > 0) {
      // Update first/newest row only
      result = await supabaseAdmin
        .from("wilayah_desa")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", existingRows[0].id)
        .select()
        .single();
      
      // Delete any duplicate rows (keep only the one we just updated)
      if (existingRows.length > 1) {
        const idsToDelete = existingRows.slice(1).map(r => r.id);
        await supabaseAdmin
          .from("wilayah_desa")
          .delete()
          .in("id", idsToDelete);
      }
    } else {
      // Insert new record
      result = await supabaseAdmin
        .from("wilayah_desa")
        .insert(updateData)
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error saving wilayah:", result.error);
      return NextResponse.json(
        { error: "Gagal menyimpan data wilayah" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
      message: "Data wilayah berhasil disimpan",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
