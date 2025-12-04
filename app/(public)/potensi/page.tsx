import {
  TreePine,
  Wheat,
  Fish,
  Mountain,
  Sun,
  Droplets,
  Leaf,
  MapPin,
  Store,
  Palette,
  LucideIcon,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Container, Card, Badge } from "@/components";
import { PageHeader } from "@/components/page-header";
import { supabase } from "@/lib/supabase";
import type { PotensiDesaRow } from "@/lib/supabase";

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Kategori icon & color mapping
const kategoriConfig: Record<string, { icon: LucideIcon; color: string; border: string; bg: string; iconColor: string }> = {
  pertanian: {
    icon: Wheat,
    color: "green",
    border: "border-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  perkebunan: {
    icon: TreePine,
    color: "teal",
    border: "border-teal-500",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  perikanan: {
    icon: Fish,
    color: "blue",
    border: "border-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  wisata: {
    icon: Mountain,
    color: "orange",
    border: "border-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  sda: {
    icon: Droplets,
    color: "cyan",
    border: "border-cyan-500",
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  umkm: {
    icon: Store,
    color: "indigo",
    border: "border-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  budaya: {
    icon: Palette,
    color: "purple",
    border: "border-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

const defaultConfig = {
  icon: Mountain,
  color: "gray",
  border: "border-gray-500",
  bg: "bg-gray-100 dark:bg-gray-900/30",
  iconColor: "text-gray-600 dark:text-gray-400",
};

// Group potensi by kategori
function groupByKategori(data: PotensiDesaRow[]) {
  const grouped: Record<string, PotensiDesaRow[]> = {};
  data.forEach((item) => {
    const kat = item.kategori.toLowerCase();
    if (!grouped[kat]) grouped[kat] = [];
    grouped[kat].push(item);
  });
  return grouped;
}

export default async function PotensiPage() {
  // Fetch from database
  const { data: potensiData, error } = await supabase
    .from("potensi_desa")
    .select("*")
    .order("urutan", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Potensi Page Error]", error);
  }

  const potensi = potensiData || [];
  const groupedPotensi = groupByKategori(potensi);
  const kategoriList = Object.keys(groupedPotensi);

  return (
    <>
      <PageHeader
        title="Potensi Desa"
        subtitle="Sumber daya alam dan keunggulan lokal Desa Toundanouw yang dapat dikembangkan untuk kesejahteraan masyarakat"
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Potensi Desa" }]}
      />

      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 py-16 sm:py-20 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative">
          {/* Intro */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 animate-fadeInUp">
            <Badge variant="primary" className="mb-4 px-4 py-2">
              <Leaf className="w-3.5 h-3.5 mr-1.5" />
              Kekayaan Alam
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Potensi Unggulan Desa Toundanouw
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Desa Toundanouw memiliki berbagai potensi sumber daya alam yang dapat
              dikembangkan untuk kesejahteraan masyarakat dan kemajuan desa.
            </p>
          </div>

          {/* Empty State */}
          {potensi.length === 0 && (
            <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-gray-200 dark:border-slate-700 animate-fadeInUp">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Mountain className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg">Belum ada data potensi desa</p>
            </div>
          )}

          {/* Potensi by Kategori */}
          {kategoriList.length > 0 && (
            <div className="space-y-16">
              {kategoriList.map((kategori, katIndex) => {
                const items = groupedPotensi[kategori];
                const config = kategoriConfig[kategori] || defaultConfig;
                const Icon = config.icon;

                return (
                  <div key={kategori} className="animate-fadeInUp" style={{ animationDelay: `${katIndex * 0.15}s` }}>
                    {/* Kategori Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-14 h-14 ${config.bg} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <Icon className={`w-7 h-7 ${config.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                          {kategori}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{items.length} potensi tersedia</p>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {items.map((item, itemIndex) => (
                        <Link key={item.id} href={`/potensi/${item.id}`}>
                          <Card
                            hoverable
                            className={`group border-t-4 ${config.border} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full`}
                            style={{ animationDelay: `${itemIndex * 0.1}s` }}
                          >
                            {/* Image or Placeholder */}
                            {item.foto_url ? (
                              <div className="h-44 rounded-2xl overflow-hidden mb-4 relative">
                                <img
                                  src={item.foto_url}
                                  alt={item.nama}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                            ) : (
                              <div className={`h-36 ${config.bg} rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden`}>
                                <Icon className={`w-14 h-14 ${config.iconColor} opacity-40 group-hover:scale-110 transition-transform duration-500`} />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                              </div>
                            )}

                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {item.nama}
                            </h4>

                            {item.deskripsi && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                                {item.deskripsi}
                              </p>
                            )}

                            <div className="space-y-2 text-sm mb-4">
                              {item.lokasi && (
                                <div className="flex items-center gap-2 text-gray-500 bg-gray-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{item.lokasi}</span>
                                </div>
                              )}
                            </div>

                            {/* Read More Link */}
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 group-hover:text-orange-700 dark:text-orange-400 group-hover:gap-3 transition-all duration-300 mt-auto">
                              Lihat selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        </div>
        
        <Container className="py-16 sm:py-24 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left animate-fadeInUp">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                Tertarik Berinvestasi?
              </h2>
              <p className="text-green-100 text-lg max-w-xl">
                Hubungi kami untuk informasi peluang investasi dan kerjasama pengembangan potensi desa.
              </p>
            </div>
            <a 
              href="/kontak"
              className="group flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl hover:bg-white/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/30 animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="font-semibold text-lg">Kantor Desa Toundanouw</span>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
