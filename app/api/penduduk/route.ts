import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Ambil semua data penduduk
export async function GET() {
  try {
    const [statistikRes, kelompokUmurRes, pekerjaanRes, pendidikanRes, agamaRes] =
      await Promise.all([
        // Handle duplicates for singleton table - get all and use first
        supabaseAdmin.from("statistik_penduduk").select("*").order("updated_at", { ascending: false }),
        supabaseAdmin.from("kelompok_umur").select("*").order("urutan", { ascending: true }),
        supabaseAdmin.from("pekerjaan_penduduk").select("*").order("urutan", { ascending: true }),
        supabaseAdmin.from("pendidikan_penduduk").select("*").order("urutan", { ascending: true }),
        supabaseAdmin.from("agama_penduduk").select("*").order("urutan", { ascending: true }),
      ]);

    // Get first row for singleton table
    const statistikData = statistikRes.data && statistikRes.data.length > 0 
      ? statistikRes.data[0] 
      : null;

    return NextResponse.json({
      data: {
        statistik: statistikData,
        kelompokUmur: kelompokUmurRes.data || [],
        pekerjaan: pekerjaanRes.data || [],
        pendidikan: pendidikanRes.data || [],
        agama: agamaRes.data || [],
      },
    });
  } catch (error) {
    console.error("Error fetching penduduk data:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST - Update semua data penduduk
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { statistik, kelompokUmur } = body;

    // Update statistik penduduk (handle duplicates)
    if (statistik) {
      const { data: existingRows } = await supabaseAdmin
        .from("statistik_penduduk")
        .select("id")
        .order("updated_at", { ascending: false });

      if (existingRows && existingRows.length > 0) {
        // Update first row
        await supabaseAdmin
          .from("statistik_penduduk")
          .update({
            total_jiwa: statistik.total_jiwa,
            total_kk: statistik.total_kk,
            laki_laki: statistik.laki_laki,
            perempuan: statistik.perempuan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRows[0].id);
        
        // Delete duplicates
        if (existingRows.length > 1) {
          const idsToDelete = existingRows.slice(1).map(r => r.id);
          await supabaseAdmin
            .from("statistik_penduduk")
            .delete()
            .in("id", idsToDelete);
        }
      } else {
        await supabaseAdmin.from("statistik_penduduk").insert({
          total_jiwa: statistik.total_jiwa,
          total_kk: statistik.total_kk,
          laki_laki: statistik.laki_laki,
          perempuan: statistik.perempuan,
        });
      }
    }

    // Update kelompok umur
    if (kelompokUmur && Array.isArray(kelompokUmur)) {
      for (const item of kelompokUmur) {
        if (item.id) {
          await supabaseAdmin
            .from("kelompok_umur")
            .update({
              jumlah: item.jumlah,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);
        }
      }
    }

    return NextResponse.json({
      message: "Data penduduk berhasil disimpan",
    });
  } catch (error) {
    console.error("Error saving penduduk data:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data penduduk" },
      { status: 500 }
    );
  }
}
