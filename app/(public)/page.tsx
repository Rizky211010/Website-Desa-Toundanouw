import Link from "next/link";
import Image from "next/image";
import {
  Newspaper,
  FileText,
  MapPin,
  Users,
  Building,
  ArrowRight,
  Download,
  Clock,
  Printer,
  CheckCircle,
  TreePine,
  Mountain,
  Camera,
  Mail,
  Phone,
  Sparkles,
  ChevronRight,
  History,
} from "lucide-react";
import { Container, Button, Card, Badge, HeroSlider } from "@/components";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Types
type BeritaItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  view_count: number;
};

type SuratItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  file_format: string;
  download_count: number;
};

type GaleriItem = {
  id: string;
  judul: string;
  foto_url: string | null;
  kategori: string | null;
  is_featured: boolean;
};

type ProfilDesa = {
  nama_desa: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  luas_wilayah: string | null;
  sejarah: string | null;
};

type SiteSettings = {
  key: string;
  value: string;
};

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch functions
async function getLatestBerita(limit: number = 3): Promise<BeritaItem[]> {
  const { data, error } = await supabaseAdmin
    .from('berita')
    .select('id, title, slug, excerpt, category, thumbnail_url, published_at, view_count')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching berita:', error);
    return [];
  }

  return data || [];
}

async function getPopularSurat(limit: number = 6): Promise<SuratItem[]> {
  // First get surat templates
  const { data: suratData, error: suratError } = await supabaseAdmin
    .from('surat_templates')
    .select('id, name, slug, description, category, file_format')
    .eq('is_active', true)
    .limit(limit);

  if (suratError) {
    console.error('Error fetching surat:', suratError);
    return [];
  }

  // Get download counts
  const suratIds = suratData?.map(s => s.id) || [];
  
  if (suratIds.length === 0) return [];

  // Count downloads for each surat
  const suratWithCounts = await Promise.all(
    (suratData || []).map(async (surat) => {
      const { count } = await supabaseAdmin
        .from('surat_download_logs')
        .select('*', { count: 'exact', head: true })
        .eq('surat_id', surat.id);
      
      return {
        ...surat,
        download_count: count || 0
      };
    })
  );

  // Sort by download count
  return suratWithCounts.sort((a, b) => b.download_count - a.download_count);
}

async function getFeaturedGaleri(limit: number = 8): Promise<GaleriItem[]> {
  const { data, error } = await supabaseAdmin
    .from('galeri')
    .select('id, judul, foto_url, kategori, is_featured')
    .order('is_featured', { ascending: false })
    .order('uploaded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching galeri:', error);
    return [];
  }

  return data || [];
}

async function getProfilDesa(): Promise<ProfilDesa | null> {
  const { data, error } = await supabaseAdmin
    .from('profil_desa')
    .select('nama_desa, alamat, telepon, email, luas_wilayah, sejarah')
    .single();

  if (error) {
    console.error('Error fetching profil:', error);
    return null;
  }

  return data;
}

async function getSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('key, value');

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  return (data || []).reduce((acc: Record<string, string>, item: SiteSettings) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
}

// Fetch statistik penduduk realtime
async function getStatistikPenduduk(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('statistik_penduduk')
    .select('total_jiwa')
    .single();

  if (error) {
    console.error('Error fetching statistik penduduk:', error);
    return 0;
  }

  return data?.total_jiwa || 0;
}

// Format date helper
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default async function HomePage() {
  // Fetch all data in parallel
  const [latestNews, popularSurat, galeriItems, profil, settings, totalPenduduk] = await Promise.all([
    getLatestBerita(3),
    getPopularSurat(6),
    getFeaturedGaleri(8),
    getProfilDesa(),
    getSiteSettings(),
    getStatistikPenduduk()
  ]);

  // Get contact info from settings or profil
  const whatsapp = settings['whatsapp'] || profil?.telepon || '+62 812-3456-7890';
  const email = settings['email'] || profil?.email || 'desa@toundanouw.id';
  const alamat = profil?.alamat || 'Desa Toundanouw, Kec. Touluaan';

  return (
    <>
      {/* Hero Section - Dynamic from Database */}
      <HeroSlider />

      {/* Highlight 4 Menu Utama (Grid 2x2) - Premium Design */}
      <section className="relative z-10 -mt-16 pb-16">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Building,
                title: "Profil Desa",
                desc: "Visi, misi & sejarah",
                href: "/profil",
                gradient: "from-orange-500 to-amber-500",
                bgGradient: "from-orange-50 to-amber-50",
                iconBg: "bg-orange-100",
              },
              {
                icon: TreePine,
                title: "Potensi Desa",
                desc: "Sumber daya lokal",
                href: "/potensi",
                gradient: "from-emerald-500 to-green-500",
                bgGradient: "from-emerald-50 to-green-50",
                iconBg: "bg-emerald-100",
              },
              {
                icon: Newspaper,
                title: "Berita Desa",
                desc: "Informasi terkini",
                href: "/berita",
                gradient: "from-blue-500 to-indigo-500",
                bgGradient: "from-blue-50 to-indigo-50",
                iconBg: "bg-blue-100",
              },
              {
                icon: FileText,
                title: "E-Surat",
                desc: "Download template",
                href: "/surat",
                gradient: "from-purple-500 to-violet-500",
                bgGradient: "from-purple-50 to-violet-50",
                iconBg: "bg-purple-100",
              },
            ].map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-7 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-500 hover:-translate-y-2 border border-gray-100/80 dark:border-slate-700 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} dark:from-slate-800 dark:to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                
                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-5 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${item.iconBg} dark:bg-opacity-20`}
                  >
                    <item.icon
                      className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${item.gradient} bg-clip-text`}
                      style={{ color: item.gradient.includes('orange') ? '#f97316' : item.gradient.includes('emerald') ? '#10b981' : item.gradient.includes('blue') ? '#3b82f6' : '#8b5cf6' }}
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-base sm:text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    {item.desc}
                    <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Profil Singkat Desa - Premium Design */}
      <section className="bg-gradient-to-b from-white via-white to-cream dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-20 sm:py-28 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 dark:bg-orange-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cream dark:bg-orange-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <Container className="relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full mb-5">
              <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 tracking-wide">
                Tentang Kami
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
              Profil Desa{' '}
              <span className="text-gradient-primary">
                {profil?.nama_desa || 'Toundanouw'}
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Mengenal lebih dekat desa kami yang asri dan penuh kekeluargaan di wilayah Minahasa Tenggara
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Lokasi Strategis",
                desc: "Terletak di Kecamatan Touluaan, Kabupaten Minahasa Tenggara dengan akses mudah ke pusat kecamatan dan fasilitas umum.",
                gradient: "from-orange-500 to-amber-500",
                iconBg: "from-orange-100 to-orange-200",
              },
              {
                icon: Users,
                title: "Masyarakat Harmonis",
                desc: totalPenduduk > 0
                  ? `Lebih dari ${totalPenduduk.toLocaleString('id-ID')} jiwa hidup berdampingan dengan semangat gotong royong, toleransi, dan kekeluargaan khas Minahasa.`
                  : 'Lebih dari 1.500 jiwa hidup berdampingan dengan semangat gotong royong, toleransi, dan kekeluargaan khas Minahasa.',
                gradient: "from-yellow-500 to-amber-500",
                iconBg: "from-yellow-100 to-amber-200",
              },
              {
                icon: Mountain,
                title: "Potensi Alam",
                desc: profil?.luas_wilayah 
                  ? `Dengan luas wilayah ${profil.luas_wilayah}, desa ini dikelilingi alam yang indah dengan potensi pertanian, perkebunan, dan wisata alam yang menjanjikan.`
                  : 'Desa ini dikelilingi alam yang indah dengan potensi pertanian, perkebunan, dan wisata alam yang menjanjikan.',
                gradient: "from-green-500 to-emerald-500",
                iconBg: "from-green-100 to-emerald-200",
              },
            ].map((card, index) => (
              <div
                key={card.title}
                className="group relative bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                {/* Top gradient border */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.gradient} rounded-t-3xl`} />
                
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${card.iconBg} dark:from-opacity-30 dark:to-opacity-30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-gray-200/30`}>
                  <card.icon className={`w-10 h-10 text-transparent bg-gradient-to-br ${card.gradient} bg-clip-text`} style={{ color: card.gradient.includes('orange') ? '#f97316' : card.gradient.includes('yellow') ? '#eab308' : '#22c55e' }} />
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-xl text-center">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button href="/profil" variant="outline" size="lg" className="group px-8 py-4 text-base hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-900/20">
              Selengkapnya Tentang Desa
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Sejarah Desa - Premium Design */}
      {profil?.sejarah && (
        <section className="bg-white dark:bg-slate-900 py-20 sm:py-28 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-50/50 dark:bg-orange-900/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-50/50 dark:bg-amber-900/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
          
          <Container className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left - Image/Illustration */}
              <div className="relative order-2 lg:order-1">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-orange-200/50 dark:shadow-none border border-orange-100 dark:border-slate-700">
                  {/* Gambar Sejarah Desa */}
                  <Image
                    src="/sejarah-desa.png"
                    alt="Sejarah Desa Toundanouw"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                
                {/* Floating stats card - Positioned outside image */}
                <div className="absolute -bottom-6 right-4 sm:right-8 lg:-right-4 bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {totalPenduduk > 0 ? totalPenduduk.toLocaleString('id-ID') : '1.500'}+
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Jiwa Penduduk</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-800/30 dark:to-amber-800/30 rounded-2xl -z-10" />
              </div>

              {/* Right - Content */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full mb-6">
                  <History className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 tracking-wide">
                    Sejarah Desa
                  </span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                  Mengenal Sejarah{' '}
                  <span className="text-gradient-primary">
                    {profil?.nama_desa || 'Toundanouw'}
                  </span>
                </h2>
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base sm:text-lg">
                    {profil.sejarah.length > 500 
                      ? `${profil.sejarah.substring(0, 500)}...` 
                      : profil.sejarah
                    }
                  </p>
                </div>
                
                <div className="mt-8">
                  <Button href="/jelajahi/sejarah" size="lg" className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 px-6 sm:px-8 py-3 sm:py-4">
                    <History className="w-5 h-5" />
                    Lihat Sejarah Lengkap
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Berita Terbaru - Premium Design */}
      <section className="bg-cream dark:bg-slate-800/50 py-20 sm:py-28 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 hero-pattern opacity-30" />
        
        <Container className="relative z-10">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mb-5">
                <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 tracking-wide">
                  Informasi Terkini
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                Berita Terbaru
              </h2>
            </div>
            <Button href="/berita" variant="ghost" className="hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 group">
              Lihat Semua
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((news, index) => (
                <article
                  key={news.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100/50 dark:border-slate-700"
                >
                  {/* Image Container */}
                  <div className="relative h-52 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 overflow-hidden">
                    {news.thumbnail_url ? (
                      <Image
                        src={news.thumbnail_url}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Newspaper className="w-20 h-20 text-blue-200 dark:text-blue-700" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant={
                          news.category === "Pengumuman"
                            ? "danger"
                            : news.category === "Kegiatan"
                            ? "success"
                            : news.category === "Pembangunan"
                            ? "info"
                            : news.category === "Bansos"
                            ? "warning"
                            : "default"
                        }
                        className="shadow-lg"
                      >
                        {news.category || 'Umum'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 text-lg leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                      {news.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                      {news.excerpt || 'Klik untuk membaca selengkapnya...'}
                    </p>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-slate-700">
                      <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(news.published_at)}
                      </span>
                      <Link
                        href={`/berita/${news.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 group/link"
                      >
                        Baca 
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700">
              <Newspaper className="w-20 h-20 text-gray-200 mx-auto mb-5" />
              <p className="text-lg text-gray-500 dark:text-gray-400">Belum ada berita terbaru</p>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Button href="/berita" variant="outline" className="px-6">
              Lihat Semua Berita
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Layanan E-Surat - Premium Design */}
      <section className="bg-white dark:bg-slate-900 py-20 sm:py-28 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-purple-100/50 dark:bg-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <Container className="relative z-10">
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-full mb-5">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 tracking-wide">
                    Layanan Digital
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Layanan E-Surat Mandiri
                </h2>
              </div>
              <Button href="/surat" variant="ghost" className="hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 group">
                Lihat Semua
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Penjelasan Layanan - Premium Card */}
            <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-3xl p-8 sm:p-10 mb-14 border border-orange-100/50 dark:border-orange-800/30 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/50 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-200/50 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed max-w-3xl">
                  Warga dapat <strong className="text-orange-600 dark:text-orange-400 font-semibold">download template surat</strong> dalam format
                  Word (.docx), cetak sendiri, dan isi data yang diperlukan. Bawa ke
                  kantor desa jika memerlukan legalisasi atau tanda tangan pejabat desa.
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { icon: Download, text: "Download Template", color: "orange" },
                    { icon: Printer, text: "Cetak & Isi Data", color: "amber" },
                    { icon: CheckCircle, text: "Legalisasi di Kantor Desa", color: "green" },
                  ].map((step, index) => (
                    <div 
                      key={step.text}
                      className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow-md shadow-orange-100/50 dark:shadow-none border border-orange-100/50 dark:border-slate-700"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        step.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <step.icon className={`w-5 h-5 ${
                          step.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          step.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                          'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {popularSurat.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularSurat.map((surat, index) => (
                <div
                  key={surat.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-500 hover:-translate-y-2 border border-gray-100/50 dark:border-slate-700 overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-md">
                        <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                          {surat.name}
                        </h3>
                        <Badge variant="default" className="text-xs">
                          {surat.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed line-clamp-2">
                      {surat.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                      <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        {surat.download_count} unduhan
                      </span>
                      <Link
                        href={`/surat/${surat.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 group/link"
                      >
                        Download 
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700">
              <FileText className="w-20 h-20 text-gray-200 mx-auto mb-5" />
              <p className="text-lg text-gray-500 dark:text-gray-400">Belum ada template surat tersedia</p>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Button href="/surat" variant="outline" className="px-6">
              Lihat Semua Surat
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Galeri Section - Premium Design */}
      <section className="bg-cream dark:bg-slate-800/50 py-20 sm:py-28 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 hero-pattern opacity-20" />
        
        <Container className="relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full mb-5">
              <Camera className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400 tracking-wide">
                Dokumentasi
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
              Galeri Desa
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Kumpulan foto kegiatan dan keindahan Desa {profil?.nama_desa || 'Toundanouw'}
            </p>
          </div>

          {galeriItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {galeriItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl transition-all duration-500 ${
                    i === 0 || i === 3 ? "md:row-span-2" : ""
                  }`}
                >
                  <div className={`${i === 0 || i === 3 ? 'aspect-[3/4]' : 'aspect-square'} bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center overflow-hidden relative`}>
                    {item.foto_url ? (
                      <Image
                        src={item.foto_url}
                        alt={item.judul}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <Camera className="w-14 h-14 text-green-200 dark:text-green-700" />
                    )}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                    <span className="text-white font-semibold text-sm sm:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {item.judul}
                    </span>
                    {item.kategori && (
                      <span className="text-white/70 text-xs mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        {item.kategori}
                      </span>
                    )}
                  </div>
                  
                  {/* Featured badge */}
                  {item.is_featured && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                      Featured
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl overflow-hidden group cursor-pointer ${
                    i === 1 || i === 4 ? "md:row-span-2" : ""
                  }`}
                >
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <Camera className="w-14 h-14 text-green-200 dark:text-green-700" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-medium">Foto Kegiatan {i}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-14">
            <Button href="/galeri" variant="outline" size="lg" className="group px-8 py-4 text-base hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20">
              <Camera className="w-5 h-5" />
              Lihat Galeri Lengkap
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Informasi Kontak - Premium Design */}
      <section className="bg-white dark:bg-slate-900 py-16 sm:py-20 border-t border-gray-100 dark:border-slate-800">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                label: "Alamat",
                value: alamat,
                color: "orange",
                bgGradient: "from-orange-100 to-amber-100",
              },
              {
                icon: Phone,
                label: "WhatsApp",
                value: whatsapp,
                color: "green",
                bgGradient: "from-green-100 to-emerald-100",
              },
              {
                icon: Mail,
                label: "Email",
                value: email,
                color: "blue",
                bgGradient: "from-blue-100 to-indigo-100",
              },
            ].map((contact) => (
              <div 
                key={contact.label}
                className="group flex items-center gap-5 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-100/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${contact.bgGradient} dark:from-opacity-30 dark:to-opacity-30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <contact.icon className={`w-7 h-7 ${
                    contact.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    contact.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    {contact.label}
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {contact.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section - Premium Design */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-3xl" style={{ animation: 'float 10s ease-in-out infinite reverse' }} />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl" style={{ animation: 'float 8s ease-in-out infinite 2s' }} />
        </div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 hero-pattern opacity-10" />
        
        <Container className="relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ada Pertanyaan atau{' '}
                <span className="text-yellow-300">Butuh Bantuan?</span>
              </h2>
              <p className="text-lg text-orange-100 mb-10 leading-relaxed max-w-lg">
                Tim kami siap membantu Anda. Hubungi kantor desa atau kunjungi
                halaman kontak untuk informasi lebih lanjut.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  href="/kontak" 
                  className="group bg-white text-orange-600 hover:bg-orange-50 shadow-xl shadow-black/20 hover:shadow-2xl px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Hubungi Kami
                </Button>
                <Button 
                  href="/profil" 
                  variant="outline" 
                  className="group border-2 border-white/50 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1"
                >
                  Pelajari Lebih Lanjut
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            
            {/* Contact Card */}
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/10">
                <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-yellow-300" />
                  </div>
                  Kontak Cepat
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-200 mb-1">Alamat</p>
                      <p className="font-semibold text-white">{alamat}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-200 mb-1">Jam Layanan</p>
                      <p className="font-semibold text-white">Senin - Jumat, 08:00 - 15:00 WITA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
