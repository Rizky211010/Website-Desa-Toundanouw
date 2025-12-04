import {
  Users,
  UserCheck,
  Baby,
  GraduationCap,
  Briefcase,
  Heart,
  BarChart3,
} from "lucide-react";
import { Container, Card, Badge } from "@/components";
import { PageHeader } from "@/components/page-header";
import {
  supabaseAdmin,
  StatistikPendudukRow,
  KelompokUmurRow,
  PekerjaanPendudukRow,
  PendidikanPendudukRow,
  AgamaPendudukRow,
} from "@/lib/supabase";

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch penduduk data from database
async function getPendudukData() {
  const [statistikRes, kelompokUmurRes, pekerjaanRes, pendidikanRes, agamaRes] =
    await Promise.all([
      // Handle duplicates - get all rows and use first one
      supabaseAdmin.from("statistik_penduduk").select("*").order("updated_at", { ascending: false }),
      supabaseAdmin.from("kelompok_umur").select("*").order("urutan", { ascending: true }),
      supabaseAdmin.from("pekerjaan_penduduk").select("*").eq("is_active", true).order("urutan", { ascending: true }),
      supabaseAdmin.from("pendidikan_penduduk").select("*").order("urutan", { ascending: true }),
      supabaseAdmin.from("agama_penduduk").select("*").order("urutan", { ascending: true }),
    ]);

  // Get first row for singleton table
  const statistikData = statistikRes.data && statistikRes.data.length > 0
    ? statistikRes.data[0]
    : null;

  return {
    statistik: statistikData as StatistikPendudukRow | null,
    kelompokUmur: (kelompokUmurRes.data || []) as KelompokUmurRow[],
    pekerjaan: (pekerjaanRes.data || []) as PekerjaanPendudukRow[],
    pendidikan: (pendidikanRes.data || []) as PendidikanPendudukRow[],
    agama: (agamaRes.data || []) as AgamaPendudukRow[],
  };
}

export default async function PendudukPage() {
  const { statistik, kelompokUmur, pekerjaan, pendidikan, agama } = await getPendudukData();

  const maxKelompokUmur = Math.max(...kelompokUmur.map((k) => k.jumlah), 1);
  const maxPendidikan = Math.max(...pendidikan.map((p) => p.jumlah), 1);

  return (
    <>
      <PageHeader
        title="Data Penduduk"
        subtitle="Statistik dan data kependudukan Desa Toundanouw"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Jelajahi" },
          { label: "Penduduk" },
        ]}
      />

      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <Card className="relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  {statistik?.total_jiwa?.toLocaleString() || "-"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Total Jiwa</p>
              </div>
            </Card>
            <Card className="relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  {statistik?.total_kk?.toLocaleString() || "-"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Kepala Keluarga</p>
              </div>
            </Card>
            <Card className="relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                  <span className="text-2xl">👨</span>
                </div>
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  {statistik?.laki_laki?.toLocaleString() || "-"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Laki-laki</p>
              </div>
            </Card>
            <Card className="relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30">
                  <span className="text-2xl">👩</span>
                </div>
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                  {statistik?.perempuan?.toLocaleString() || "-"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Perempuan</p>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Kelompok Umur */}
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-500 animate-fadeInUp">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Baby className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Berdasarkan Kelompok Umur
                </h3>
              </div>
              <div className="space-y-4">
                {kelompokUmur.length > 0 ? kelompokUmur.map((item, index) => (
                  <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {item.range_umur}{" "}
                        <span className="text-gray-500">({item.label})</span>
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {item.jumlah} jiwa
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.jumlah / maxKelompokUmur) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data kelompok umur</p>
                )}
              </div>
            </Card>

            {/* Tingkat Pendidikan */}
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-500 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tingkat Pendidikan
                </h3>
              </div>
              <div className="space-y-4">
                {pendidikan.length > 0 ? pendidikan.map((item, index) => (
                  <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {item.tingkat}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {item.jumlah} orang
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.jumlah / maxPendidikan) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data pendidikan</p>
                )}
              </div>
            </Card>
          </div>

          {/* Pekerjaan */}
          <div className="mb-16 animate-fadeInUp">
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mata Pencaharian
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {pekerjaan.length > 0 ? pekerjaan.map((item, index) => (
                <Card
                  key={item.id}
                  hoverable
                  className="text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">{item.icon || "📋"}</span>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-1">
                    {item.jumlah}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {item.jenis}
                  </p>
                </Card>
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Belum ada data pekerjaan</p>
                </div>
              )}
            </div>
          </div>

          {/* Agama */}
          <div className="animate-fadeInUp">
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Agama
              </h3>
            </div>
            <div className="max-w-3xl mx-auto">
              <Card className="shadow-xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {agama.length > 0 ? agama.map((item, index) => (
                    <div
                      key={item.id}
                      className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        {item.persentase}%
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2 mt-1">
                        {item.nama}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {item.jumlah} jiwa
                      </Badge>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Belum ada data agama</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Update Info */}
      <section className="bg-cream dark:bg-slate-800">
        <Container className="py-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <BarChart3 className="w-4 h-4" />
            <span>Data terakhir diperbarui: Desember 2024</span>
          </div>
        </Container>
      </section>
    </>
  );
}
