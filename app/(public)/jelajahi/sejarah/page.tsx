import {
  History,
  Calendar,
  Star,
  User,
  Award,
  Building2,
  Landmark,
  Sparkles,
  Clock,
} from "lucide-react";
import { Container, Card, Badge } from "@/components";
import { PageHeader } from "@/components/page-header";
import {
  supabaseAdmin,
  SejarahDesaRow,
  SejarahKepalaDesaRow,
} from "@/lib/supabase";
import { KATEGORI_SEJARAH } from "@/lib/sejarah-api";

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch sejarah data from database
async function getSejarahData() {
  const [sejarahRes, kepalaRes] = await Promise.all([
    supabaseAdmin
      .from("sejarah_desa")
      .select("*")
      .eq("is_active", true)
      .order("urutan", { ascending: true }),
    supabaseAdmin
      .from("sejarah_kepala_desa")
      .select("*")
      .eq("is_active", true)
      .order("urutan", { ascending: true }),
  ]);

  return {
    sejarahEvents: (sejarahRes.data || []) as SejarahDesaRow[],
    kepalaList: (kepalaRes.data || []) as SejarahKepalaDesaRow[],
  };
}

// Get category icon and color
function getCategoryStyle(kategori: string) {
  const styles: Record<string, { icon: typeof History; color: string; gradient: string }> = {
    pendirian: {
      icon: Landmark,
      color: "orange",
      gradient: "from-orange-400 to-orange-600",
    },
    kepemimpinan: {
      icon: User,
      color: "blue",
      gradient: "from-blue-400 to-blue-600",
    },
    pembangunan: {
      icon: Building2,
      color: "green",
      gradient: "from-green-400 to-green-600",
    },
    budaya: {
      icon: Sparkles,
      color: "purple",
      gradient: "from-purple-400 to-purple-600",
    },
    umum: {
      icon: History,
      color: "gray",
      gradient: "from-gray-400 to-gray-600",
    },
  };
  return styles[kategori] || styles.umum;
}

export default async function SejarahPage() {
  const { sejarahEvents, kepalaList } = await getSejarahData();

  // Separate highlights and regular events
  const highlights = sejarahEvents.filter((e) => e.is_highlight);
  const timelineEvents = sejarahEvents;

  return (
    <>
      <PageHeader
        title="Sejarah Desa"
        subtitle="Perjalanan sejarah dan perkembangan Desa Toundanouw dari masa ke masa"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Jelajahi" },
          { label: "Sejarah" },
        ]}
      />

      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative">
          {/* Highlights Section */}
          {highlights.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-center gap-4 mb-10 animate-fadeInUp">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Momen Penting
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {highlights.map((event, index) => {
                  const style = getCategoryStyle(event.kategori);
                  const Icon = style.icon;
                  return (
                    <Card
                      key={event.id}
                      className="relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Highlight Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge variant="primary" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Highlight
                        </Badge>
                      </div>

                      {/* Decorative Corner */}
                      <div
                        className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${style.gradient} opacity-10 rounded-br-[3rem] group-hover:scale-110 transition-transform duration-500`}
                      />

                      <div className="relative">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${style.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {event.tahun}
                          </Badge>
                          <Badge variant="info" className="text-xs capitalize">
                            {KATEGORI_SEJARAH.find(k => k.value === event.kategori)?.label || event.kategori}
                          </Badge>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                          {event.judul}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                          {event.deskripsi}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline Section */}
          <div className="mb-16">
            <div className="flex items-center justify-center gap-4 mb-10 animate-fadeInUp">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Linimasa Sejarah
              </h2>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 rounded-full transform md:-translate-x-1/2" />

              <div className="space-y-8">
                {timelineEvents.map((event, index) => {
                  const style = getCategoryStyle(event.kategori);
                  const Icon = style.icon;
                  const isEven = index % 2 === 0;

                  return (
                    <div
                      key={event.id}
                      className={`relative flex items-center ${
                        isEven ? "md:flex-row" : "md:flex-row-reverse"
                      } animate-fadeInUp`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-10">
                        <div
                          className={`w-6 h-6 bg-gradient-to-br ${style.gradient} rounded-full border-4 border-white dark:border-slate-900 shadow-lg ${
                            event.is_highlight ? "ring-4 ring-amber-300/50" : ""
                          }`}
                        />
                      </div>

                      {/* Content Card */}
                      <div
                        className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${
                          isEven ? "md:pr-8" : "md:pl-8"
                        }`}
                      >
                        <Card
                          className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
                        >
                          {/* Year Badge */}
                          <div
                            className={`absolute ${
                              isEven ? "md:-right-16" : "md:-left-16"
                            } top-4 hidden md:block`}
                          >
                            <span className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                              {event.tahun}
                            </span>
                          </div>

                          <div className="relative">
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-12 h-12 bg-gradient-to-br ${style.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs md:hidden">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {event.tahun}
                                  </Badge>
                                  <Badge variant="info" className="text-xs capitalize">
                                    {KATEGORI_SEJARAH.find(k => k.value === event.kategori)?.label || event.kategori}
                                  </Badge>
                                  {event.is_highlight && (
                                    <Badge variant="warning" className="text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      Penting
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                  {event.judul}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {event.deskripsi}
                                </p>
                              </div>
                            </div>

                            {event.foto_url && (
                              <div className="mt-4 rounded-xl overflow-hidden">
                                <img
                                  src={event.foto_url}
                                  alt={event.judul}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Kepala Desa Section */}
          {kepalaList.length > 0 && (
            <div className="animate-fadeInUp">
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Kepala Desa dari Masa ke Masa
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kepalaList.map((kepala, index) => {
                  const isCurrentLeader = !kepala.periode_selesai;
                  return (
                    <Card
                      key={kepala.id}
                      className={`relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp ${
                        isCurrentLeader ? "ring-2 ring-orange-400 ring-offset-2" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Current Leader Badge */}
                      {isCurrentLeader && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="success" className="flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            Saat Ini
                          </Badge>
                        </div>
                      )}

                      {/* Decorative Corner */}
                      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-br-[3rem] group-hover:scale-110 transition-transform duration-500" />

                      <div className="relative flex flex-col items-center text-center">
                        {/* Photo */}
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-white dark:border-slate-700 shadow-xl">
                          {kepala.foto_url ? (
                            <img
                              src={kepala.foto_url}
                              alt={kepala.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <User className="w-12 h-12 text-white" />
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {kepala.nama}
                        </h3>

                        <Badge variant={isCurrentLeader ? "primary" : "outline"} className="mb-3">
                          {kepala.periode_mulai} - {kepala.periode_selesai || "Sekarang"}
                        </Badge>

                        {kepala.pencapaian && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            {kepala.pencapaian}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Info Section */}
      <section className="bg-cream dark:bg-slate-800">
        <Container className="py-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <History className="w-4 h-4" />
            <span>Sejarah Desa Toundanouw - Menjaga Warisan untuk Generasi Mendatang</span>
          </div>
        </Container>
      </section>
    </>
  );
}
