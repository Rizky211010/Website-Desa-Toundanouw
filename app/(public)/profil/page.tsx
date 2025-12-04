import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Users,
  Target,
  Building2,
  Phone,
  Mail,
  Camera,
  BookOpen,
  ArrowRight,
  History,
  Calendar,
} from "lucide-react";
import { Container, PageHeader, Card } from "@/components";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Profil Desa Toundanouw",
  description:
    "Profil lengkap Desa Toundanouw - sejarah, visi misi, dan struktur pemerintahan desa.",
};

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Types
interface ProfilDesa {
  id: string;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  deskripsi: string;
  visi: string;
  misi: string;
  sejarah: string;
  geografis: string;
  statistik_penduduk: number;
  luas_wilayah: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  kepala_desa: string;
  sekretaris_desa: string;
}

interface StrukturPemerintahan {
  id: string;
  jabatan: string;
  nama: string;
  nip: string;
  email: string;
  telepon: string;
  foto_url: string;
  deskripsi: string;
  urutan: number;
  is_active: boolean;
}

// Fetch data langsung dari Supabase (Server Component)
async function getProfilDesa(): Promise<ProfilDesa | null> {
  const { data, error } = await supabase
    .from('profil_desa')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching profil desa:', error);
    return null;
  }
  return data;
}

async function getStrukturPemerintahan(): Promise<StrukturPemerintahan[]> {
  const { data, error } = await supabase
    .from('struktur_pemerintahan')
    .select('*')
    .eq('is_active', true)
    .order('urutan', { ascending: true });

  if (error) {
    console.error('Error fetching struktur:', error);
    return [];
  }
  return data || [];
}

// Galeri type
interface GaleriFoto {
  id: string;
  judul: string;
  deskripsi: string | null;
  foto_url: string | null;
  kategori: string;
  urutan: number;
  uploaded_at: string;
}

// Fetch galeri from database
async function getGaleri(): Promise<GaleriFoto[]> {
  const { data, error } = await supabase
    .from("galeri")
    .select("*")
    .order("urutan", { ascending: true, nullsFirst: false })
    .order("uploaded_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Error fetching galeri:", error);
    return [];
  }

  return data || [];
}

// Helper untuk parsing misi (disimpan sebagai JSON array atau teks biasa)
function parseMisi(misiData: string | null): string[] {
  if (!misiData) {
    return [
      "Meningkatkan kualitas pelayanan publik dan tata kelola pemerintahan desa yang transparan dan akuntabel.",
      "Mengembangkan potensi pertanian dan ekonomi kreatif masyarakat untuk meningkatkan kesejahteraan.",
      "Membangun infrastruktur desa yang memadai untuk mendukung mobilitas dan aktivitas warga.",
      "Meningkatkan kualitas pendidikan, kesehatan, dan pemberdayaan masyarakat.",
      "Melestarikan nilai-nilai budaya Minahasa dan semangat mapalus (gotong royong).",
    ];
  }
  
  // Coba parse sebagai JSON array
  try {
    const parsed = JSON.parse(misiData);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Bukan JSON, split berdasarkan newline atau numbering
  }
  
  // Split berdasarkan newline dan bersihkan
  return misiData
    .split(/\n/)
    .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line: string) => line.length > 0);
}

export default async function ProfilPage() {
  // Fetch data dari database
  const [profil, strukturPemerintahan, galeriDesa] = await Promise.all([
    getProfilDesa(),
    getStrukturPemerintahan(),
    getGaleri()
  ]);

  // Default values jika data tidak ada di database
  const namaDesa = profil?.nama_desa || "Desa Toundanouw";
  const kecamatan = profil?.kecamatan || "Touluaan";
  const kabupaten = profil?.kabupaten || "Minahasa Tenggara";
  const provinsi = profil?.provinsi || "Sulawesi Utara";
  const deskripsi = profil?.deskripsi || "";
  const visi = profil?.visi || "Terwujudnya Desa Toundanouw yang maju, mandiri, dan sejahtera berlandaskan semangat gotong royong dan kearifan lokal.";
  const misiList = parseMisi(profil?.misi || null);
  const sejarah = profil?.sejarah || "";
  const statistikPenduduk = profil?.statistik_penduduk || 1500;
  const luasWilayah = profil?.luas_wilayah || "12,5";

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title={`Profil ${namaDesa}`}
        subtitle={`Mengenal lebih dekat ${namaDesa}, sebuah desa yang asri di Kecamatan ${kecamatan}, Kabupaten ${kabupaten}, Provinsi ${provinsi}.`}
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Profil Desa" }]}
      />

      {/* Profil Umum Desa */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800/50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-200/20 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Tentang Desa
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Profil Umum Desa
              </h2>

              <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {deskripsi ? (
                  <p>{deskripsi}</p>
                ) : (
                  <>
                    <p>
                      <strong className="text-gray-900 dark:text-white">
                        {namaDesa}
                      </strong>{" "}
                      terletak di Kecamatan {kecamatan}, Kabupaten {kabupaten},
                      Provinsi {provinsi}. Desa ini berada di kawasan dataran
                      tinggi dengan ketinggian sekitar 300-500 meter di atas
                      permukaan laut, dikelilingi oleh perbukitan hijau dan
                      hamparan sawah yang subur.
                    </p>
                    <p>
                      Dengan luas wilayah sekitar {luasWilayah} km², {namaDesa}
                      {" "}dihuni oleh kurang lebih {statistikPenduduk.toLocaleString()} jiwa yang tersebar di 5 jaga
                      (dusun). Mayoritas penduduk bermata pencaharian sebagai
                      petani, dengan komoditas utama padi, jagung, dan berbagai
                      jenis sayuran.
                    </p>
                    <p>
                      Masyarakat {namaDesa} dikenal dengan semangat{" "}
                      <em>mapalus</em> (gotong royong) yang masih kental hingga
                      saat ini. Nilai-nilai kekeluargaan, kebersamaan, dan
                      kearifan lokal Minahasa terus dijaga dan dilestarikan oleh
                      warga desa dari generasi ke generasi.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Image/Stats Card */}
            <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 dark:from-orange-900/30 dark:via-orange-800/20 dark:to-yellow-900/10 rounded-3xl p-6 md:p-8 border border-orange-200/50 dark:border-orange-700/50 shadow-xl animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </span>
                Data Singkat Desa
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/50 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    {statistikPenduduk.toLocaleString()}+
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                    Jumlah Penduduk
                  </p>
                </div>
                <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/50 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    {luasWilayah}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                    Luas Wilayah (km²)
                  </p>
                </div>
                <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/50 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    5
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                    Jumlah Jaga
                  </p>
                </div>
                <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/50 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    {strukturPemerintahan.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                    Perangkat Desa
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-medium">
                    Kec. {kecamatan}, Kab. {kabupaten}, {provinsi}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Sejarah Desa - Ringkasan */}
      {sejarah && (
        <section id="sejarah" className="py-16 sm:py-20 bg-white dark:bg-slate-900 relative overflow-hidden scroll-mt-20">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 dark:bg-orange-900/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50/50 dark:bg-amber-900/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          
          <Container className="relative">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left - Content */}
              <div className="animate-fadeInUp">
                <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    Sejarah Singkat
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Sejarah {namaDesa}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Perjalanan panjang terbentuknya desa yang kita cintai
                </p>

                {/* Sejarah Text - Truncated */}
                <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-2xl p-6 border border-orange-100 dark:border-slate-700 shadow-lg mb-6">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    {sejarah.length > 400 
                      ? `${sejarah.substring(0, 400)}...` 
                      : sejarah
                    }
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/jelajahi/sejarah"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-1"
                >
                  <History className="w-5 h-5" />
                  Lihat Sejarah Lengkap
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right - Feature Cards */}
              <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
                {/* Timeline Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Linimasa Sejarah</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Peristiwa penting dari masa ke masa</p>
                    </div>
                  </div>
                </div>

                {/* Leaders Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Kepala Desa</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Daftar pemimpin dari masa ke masa</p>
                    </div>
                  </div>
                </div>

                {/* Highlights Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <History className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Momen Penting</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Highlight peristiwa bersejarah</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Visi & Misi */}
      <section className="py-16 sm:py-20 bg-cream dark:bg-slate-800/50 relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-[0.02]" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        
        <Container className="relative">
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700">
              <Target className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Visi & Misi
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Arah Pembangunan Desa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="group bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Visi Desa
                </h3>
              </div>
              <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic border-l-4 border-gradient-to-b from-orange-500 to-yellow-500 pl-5 py-2 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/20 dark:to-transparent rounded-r-lg">
                &ldquo;{visi}&rdquo;
              </blockquote>
            </div>

            {/* Misi */}
            <div className="group bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Misi Desa
                </h3>
              </div>
              <ul className="space-y-3">
                {misiList.map((misi, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300 group/item hover:bg-orange-50 dark:hover:bg-orange-900/10 p-2 rounded-lg transition-colors"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold flex-shrink-0 mt-0.5 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{misi}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Struktur Pemerintahan */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-40 right-0 w-80 h-80 bg-orange-100/50 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative">
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Pemerintahan
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Struktur Pemerintahan Desa
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Perangkat desa yang bertugas melayani dan membangun {namaDesa}.
            </p>
          </div>

          {strukturPemerintahan.length === 0 ? (
            <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-gray-200 dark:border-slate-700">
              <Building2 className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Struktur pemerintahan belum tersedia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
              {strukturPemerintahan.map((pejabat, index) => (
                <div
                  key={pejabat.id}
                  className={`group bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp ${
                    index === 0
                      ? "sm:col-span-2 lg:col-span-1 ring-2 ring-orange-500 ring-offset-4 dark:ring-offset-slate-900 relative overflow-hidden"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Special badge for first item */}
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                      Kepala Desa
                    </div>
                  )}
                  
                  {/* Avatar / Foto */}
                  {pejabat.foto_url ? (
                    <div className="relative w-24 h-24 rounded-2xl mx-auto mb-5 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={pejabat.foto_url}
                        alt={pejabat.nama}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 mx-auto mb-5 shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-2xl font-bold text-white">
                        {pejabat.nama
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full inline-block">
                      {pejabat.jabatan}
                    </p>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-lg mt-2">
                      {pejabat.nama}
                    </h3>
                    {pejabat.nip && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-mono">
                        NIP: {pejabat.nip}
                      </p>
                    )}

                    {pejabat.email && (
                      <a
                        href={`mailto:${pejabat.email}`}
                        className="inline-flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{pejabat.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Galeri Foto */}
      <section className="py-16 sm:py-20 bg-cream dark:bg-slate-800/50 relative overflow-hidden">
        <Container className="relative">
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700">
              <Camera className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Galeri
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Galeri Foto Desa
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Dokumentasi kegiatan dan suasana Desa Toundanouw.
            </p>
          </div>

          {galeriDesa.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada foto galeri yang ditambahkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {galeriDesa.map((foto, index) => (
                <div
                  key={foto.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image dari Database */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 via-orange-200 to-yellow-100 dark:from-orange-900/30 dark:via-orange-800/20 dark:to-yellow-900/20 relative overflow-hidden">
                    {foto.foto_url ? (
                      <img
                        src={foto.foto_url}
                        alt={foto.judul}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-16 h-16 text-orange-300/70 dark:text-orange-700/50 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600/80 via-orange-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    {/* View icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <Camera className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {foto.judul}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {foto.deskripsi || "Dokumentasi desa"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Link ke halaman galeri lengkap */}
          {galeriDesa.length > 0 && (
            <div className="text-center mt-10 animate-fadeInUp">
              <a
                href="/galeri"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Camera className="w-5 h-5" />
                Lihat Galeri Lengkap
              </a>
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-3xl" />
        </div>
        
        <Container className="relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 animate-fadeInUp">
              Ada Pertanyaan Tentang Desa?
            </h2>
            <p className="text-orange-100 mb-10 max-w-xl mx-auto text-lg animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              Hubungi kami untuk informasi lebih lanjut tentang Desa Toundanouw
              atau keperluan administrasi lainnya.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <a
                href="/kontak"
                className="group inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-semibold py-4 px-8 rounded-xl hover:bg-orange-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Hubungi Kami
              </a>
              <a
                href="/surat"
                className="group inline-flex items-center justify-center gap-2 bg-orange-700/50 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-xl hover:bg-orange-800/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-orange-400/50"
              >
                Lihat Layanan E-Surat
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
