import { MapPin, Home, Users, TreePine, Droplets, Mountain } from "lucide-react";
import { Container, Card, Badge } from "@/components";
import { PageHeader } from "@/components/page-header";
import { supabaseAdmin, WilayahDesaRow, JagaRow } from "@/lib/supabase";

// Force dynamic rendering - jangan cache, selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch wilayah data from database
async function getWilayahData() {
  // Get all rows and use first one (fix for multiple rows issue)
  const { data: wilayahRows } = await supabaseAdmin
    .from("wilayah_desa")
    .select("*");
  
  const wilayah = wilayahRows && wilayahRows.length > 0 ? wilayahRows[0] : null;

  const { data: jagaList } = await supabaseAdmin
    .from("jaga")
    .select("*")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  const { data: penggunaanLahan } = await supabaseAdmin
    .from("penggunaan_lahan")
    .select("*")
    .order("urutan", { ascending: true });

  return {
    wilayah: wilayah as WilayahDesaRow | null,
    jagaList: (jagaList || []) as JagaRow[],
    penggunaanLahan: penggunaanLahan || [],
  };
}

export default async function WilayahPage() {
  const { wilayah, jagaList, penggunaanLahan } = await getWilayahData();

  // Format suhu
  const suhuDisplay = wilayah?.suhu_min && wilayah?.suhu_max
    ? `${wilayah.suhu_min}-${wilayah.suhu_max}°C`
    : "-";

  return (
    <>
      <PageHeader
        title="Wilayah Desa"
        subtitle="Informasi geografis dan pembagian wilayah Desa Toundanouw"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Jelajahi" },
          { label: "Wilayah" },
        ]}
      />

      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200/30 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <Card className="text-center bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 dark:from-orange-900/20 dark:via-orange-800/10 dark:to-yellow-900/10 border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp">
              <div className="w-14 h-14 mx-auto mb-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin className="w-7 h-7 text-orange-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                {wilayah?.luas_wilayah ? `${wilayah.luas_wilayah} km²` : "-"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Luas Wilayah</p>
            </Card>
            <Card className="text-center bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 dark:from-green-900/20 dark:via-green-800/10 dark:to-emerald-900/10 border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <div className="w-14 h-14 mx-auto mb-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Mountain className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                {wilayah?.ketinggian ? `${wilayah.ketinggian} mdpl` : "-"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Ketinggian</p>
            </Card>
            <Card className="text-center bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 dark:from-blue-900/20 dark:via-blue-800/10 dark:to-cyan-900/10 border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <div className="w-14 h-14 mx-auto mb-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Droplets className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {wilayah?.curah_hujan ? `${wilayah.curah_hujan} mm/th` : "-"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Curah Hujan</p>
            </Card>
            <Card className="text-center bg-gradient-to-br from-yellow-50 via-amber-100 to-orange-50 dark:from-yellow-900/20 dark:via-amber-800/10 dark:to-orange-900/10 border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
              <div className="w-14 h-14 mx-auto mb-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center shadow-lg">
                <TreePine className="w-7 h-7 text-yellow-600" />
              </div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text text-transparent">
                {suhuDisplay}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Suhu Rata-rata</p>
            </Card>
          </div>

          {/* Batas Wilayah */}
          <div className="mb-16 animate-fadeInUp">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Batas Wilayah
              </span>
            </h2>
            <Card className="max-w-2xl mx-auto shadow-xl">
              <div className="grid grid-cols-2 gap-5">
                <div className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wider">Utara</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {wilayah?.batas_utara || "-"}
                  </p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wider">Selatan</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {wilayah?.batas_selatan || "-"}
                  </p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wider">Barat</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {wilayah?.batas_barat || "-"}
                  </p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wider">Timur</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {wilayah?.batas_timur || "-"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Peta */}
          <div className="mb-16 animate-fadeInUp">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Peta Wilayah
              </span>
            </h2>
            {wilayah?.google_maps_embed ? (
              <div 
                className="aspect-video rounded-3xl overflow-hidden shadow-2xl"
                dangerouslySetInnerHTML={{ __html: wilayah.google_maps_embed }}
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-green-100 via-green-200 to-emerald-100 dark:from-green-900/30 dark:via-green-800/20 dark:to-emerald-900/20 rounded-3xl flex items-center justify-center shadow-xl">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/80 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-12 h-12 text-green-500" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                    Peta Desa Toundanouw
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Kec. Touluaan, Kab. Minahasa Tenggara
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pembagian Jaga */}
          {jagaList.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center animate-fadeInUp">
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Pembagian Wilayah (Jaga)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jagaList.map((jaga, index) => (
                  <Card
                    key={jaga.id}
                    hoverable
                    className="border-l-4 border-l-orange-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                        <Home className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        {jaga.area && (
                          <Badge variant="primary" className="mb-2">
                            {jaga.area}
                          </Badge>
                        )}
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {jaga.nama}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Kepala: <span className="font-medium text-gray-800 dark:text-gray-200">{jaga.kepala_jaga || "-"}</span>
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
                            <Users className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-500 dark:text-gray-500">KK:</span>{" "}
                            <span className="font-bold text-gray-900 dark:text-white">
                              {jaga.jumlah_kk}
                            </span>
                          </div>
                          <div className="bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
                            <span className="text-gray-500 dark:text-gray-500">Jiwa:</span>{" "}
                            <span className="font-bold text-gray-900 dark:text-white">
                              {jaga.jumlah_jiwa}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Penggunaan Lahan */}
          {penggunaanLahan.length > 0 && (
            <div className="animate-fadeInUp">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Penggunaan Lahan
                </span>
              </h2>
              <Card className="max-w-3xl mx-auto shadow-xl">
                <div className="space-y-5">
                  {penggunaanLahan.map((item, idx) => (
                    <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.jenis}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {item.luas} km² ({item.persentase}%)
                        </span>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            idx === 0
                              ? "bg-gradient-to-r from-orange-400 to-orange-600"
                              : idx === 1
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : idx === 2
                              ? "bg-gradient-to-r from-teal-400 to-teal-600"
                              : idx === 3
                              ? "bg-gradient-to-r from-cyan-400 to-cyan-600"
                              : "bg-gradient-to-r from-gray-400 to-gray-500"
                          }`}
                          style={{ width: `${item.persentase}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
