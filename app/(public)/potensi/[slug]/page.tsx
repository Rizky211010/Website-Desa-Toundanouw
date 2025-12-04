import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Banknote,
  Calendar,
  TreePine,
  Wheat,
  Fish,
  Mountain,
  Store,
  Droplets,
  Palette,
  Share2,
  LucideIcon,
} from "lucide-react";
import { Container, Card, Badge, Button } from "@/components";
import { supabase } from "@/lib/supabase";
import type { PotensiDesaRow } from "@/lib/supabase";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Kategori config
const kategoriConfig: Record<string, { icon: LucideIcon; color: string; bgGradient: string; badgeClass: string }> = {
  pertanian: {
    icon: Wheat,
    color: "green",
    bgGradient: "from-green-500 to-emerald-600",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
  perkebunan: {
    icon: TreePine,
    color: "teal",
    bgGradient: "from-teal-500 to-cyan-600",
    badgeClass: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  },
  perikanan: {
    icon: Fish,
    color: "blue",
    bgGradient: "from-blue-500 to-indigo-600",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  wisata: {
    icon: Mountain,
    color: "orange",
    bgGradient: "from-orange-500 to-amber-600",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  },
  sda: {
    icon: Droplets,
    color: "cyan",
    bgGradient: "from-cyan-500 to-blue-600",
    badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  },
  umkm: {
    icon: Store,
    color: "indigo",
    bgGradient: "from-indigo-500 to-purple-600",
    badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  },
  budaya: {
    icon: Palette,
    color: "purple",
    bgGradient: "from-purple-500 to-pink-600",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  },
};

const defaultConfig = {
  icon: Mountain,
  color: "gray",
  bgGradient: "from-gray-500 to-gray-600",
  badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300",
};

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const { data: potensi } = await supabase
    .from("potensi_desa")
    .select("nama, deskripsi, kategori")
    .eq("id", slug)
    .single();

  if (!potensi) {
    return { title: "Potensi Tidak Ditemukan" };
  }

  return {
    title: `${potensi.nama} - Potensi Desa Toundanouw`,
    description: potensi.deskripsi || `Potensi ${potensi.kategori} di Desa Toundanouw`,
  };
}

// Fetch related potensi
async function getRelatedPotensi(kategori: string, currentId: string) {
  const { data } = await supabase
    .from("potensi_desa")
    .select("id, nama, kategori, foto_url, deskripsi")
    .eq("kategori", kategori)
    .neq("id", currentId)
    .limit(3);

  return data || [];
}

export default async function PotensiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch potensi by ID
  const { data: potensi, error } = await supabase
    .from("potensi_desa")
    .select("*")
    .eq("id", slug)
    .single();

  if (error || !potensi) {
    notFound();
  }

  const config = kategoriConfig[potensi.kategori.toLowerCase()] || defaultConfig;
  const Icon = config.icon;
  const relatedPotensi = await getRelatedPotensi(potensi.kategori, potensi.id);

  return (
    <>
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image or Gradient */}
        <div className="absolute inset-0 h-[400px] lg:h-[500px]">
          {potensi.foto_url ? (
            <>
              <img
                src={potensi.foto_url}
                alt={potensi.nama}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.bgGradient}`}>
              <div className="absolute inset-0 bg-black/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <Container className="relative pt-8 pb-32 lg:pt-12 lg:pb-40">
          {/* Back Button */}
          <Link
            href="/potensi"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Potensi Desa</span>
          </Link>

          {/* Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.badgeClass}`}>
              <Icon className="w-4 h-4" />
              {potensi.kategori}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl leading-tight">
            {potensi.nama}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-white/80">
            {potensi.lokasi && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{potensi.lokasi}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(potensi.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="bg-gray-50 dark:bg-slate-900 relative">
        <Container className="py-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-20 lg:-mt-24 relative z-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8 lg:p-10">
                {/* Description */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Deskripsi
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {potensi.deskripsi || "Belum ada deskripsi untuk potensi ini."}
                  </p>
                </div>

                {/* Image Gallery (if exists) */}
                {potensi.foto_url && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Galeri Foto
                    </h3>
                    <div className="rounded-2xl overflow-hidden">
                      <img
                        src={potensi.foto_url}
                        alt={potensi.nama}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Share Section */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Bagikan potensi ini:
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Informasi Detail
                </h3>
                <div className="space-y-4">
                  {potensi.lokasi && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lokasi</p>
                        <p className="font-medium text-gray-900 dark:text-white">{potensi.lokasi}</p>
                      </div>
                    </div>
                  )}

                  {potensi.pemilik && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pemilik / Pengelola</p>
                        <p className="font-medium text-gray-900 dark:text-white">{potensi.pemilik}</p>
                      </div>
                    </div>
                  )}

                  {potensi.kontak && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kontak</p>
                        <p className="font-medium text-gray-900 dark:text-white">{potensi.kontak}</p>
                      </div>
                    </div>
                  )}

                  {potensi.nilai_ekonomi && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <Banknote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nilai Ekonomi</p>
                        <p className="font-medium text-gray-900 dark:text-white">{potensi.nilai_ekonomi}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* CTA Card */}
              <Card className="p-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
                <h3 className="text-lg font-bold mb-2">Tertarik dengan Potensi Ini?</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Hubungi kami untuk informasi lebih lanjut atau peluang kerjasama.
                </p>
                <Link
                  href="/kontak"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi Kami
                </Link>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Related Potensi */}
      {relatedPotensi.length > 0 && (
        <section className="bg-gray-50 dark:bg-slate-900 py-16">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Potensi {potensi.kategori} Lainnya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPotensi.map((item) => {
                const itemConfig = kategoriConfig[item.kategori.toLowerCase()] || defaultConfig;
                const ItemIcon = itemConfig.icon;

                return (
                  <Link key={item.id} href={`/potensi/${item.id}`}>
                    <Card hoverable className="h-full group">
                      {/* Image */}
                      <div className="h-40 rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-slate-700">
                        {item.foto_url ? (
                          <img
                            src={item.foto_url}
                            alt={item.nama}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${itemConfig.bgGradient} flex items-center justify-center`}>
                            <ItemIcon className="w-12 h-12 text-white/50" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                        {item.nama}
                      </h3>
                      {item.deskripsi && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {item.deskripsi}
                        </p>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
