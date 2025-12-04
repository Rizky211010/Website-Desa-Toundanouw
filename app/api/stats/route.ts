/**
 * GET /api/stats
 * Get public statistics for hero section - REALTIME from database
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all stats in parallel - REALTIME dari database
    const [statistikResult, jagaResult, suratResult] = await Promise.all([
      // Get statistik penduduk dari tabel statistik_penduduk
      supabaseAdmin
        .from("statistik_penduduk")
        .select("total_jiwa")
        .single(),
      
      // Count active jaga/wilayah
      supabaseAdmin
        .from("jaga")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      
      // Count active surat templates
      supabaseAdmin
        .from("surat_templates")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

    const stats = {
      penduduk: statistikResult.data?.total_jiwa || 0,
      wilayah: jagaResult.count || 0,
      suratTemplates: suratResult.count || 0,
    };

    return NextResponse.json({ data: stats }, { status: 200 });
  } catch (error) {
    console.error("[Stats GET Error]", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
