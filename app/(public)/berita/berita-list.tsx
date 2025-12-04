"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Newspaper } from "lucide-react";
import { Container, Card, Badge, Button } from "@/components";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  thumbnail_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  users: { full_name: string }[] | { full_name: string } | null;
}

interface BeritaListProps {
  news: NewsItem[];
  categories: string[];
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCategoryBadgeVariant(category: string | null) {
  switch (category) {
    case "Pengumuman Penting":
      return "danger" as const;
    case "Kegiatan":
      return "success" as const;
    case "Pembangunan":
      return "info" as const;
    case "Bansos":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export function BeritaList({ news, categories }: BeritaListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchCategory =
        selectedCategory === "Semua" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [news, searchQuery, selectedCategory]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <>
      {/* Filter Section - Premium */}
      <section className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-700 sticky top-[72px] z-40 py-5">
        <Container>
          <div className="flex flex-col gap-5">
            {/* Search Bar - Premium */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Cari berita berdasarkan judul atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full pl-14 pr-12 py-4 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50/50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter - Premium Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange("Semua")}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === "Semua"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30"
                }`}
              >
                Semua ({news.length})
              </button>
              {categories.map((category) => {
                const count = news.filter((n) => n.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30"
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* News List - Premium */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900 py-16 sm:py-20">
        <Container>
          {/* Results info - Premium */}
          <div className="mb-10">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Menampilkan <span className="text-orange-600 font-semibold">{filteredNews.length}</span> berita
              {selectedCategory !== "Semua" &&
                ` dalam kategori "${selectedCategory}"`}
              {searchQuery && ` untuk pencarian "${searchQuery}"`}
            </p>
          </div>

          {/* News Grid - Premium Cards */}
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredNews.map((item, index) => (
                <Card
                  key={item.id}
                  variant="elevated"
                  hoverable
                  className="flex flex-col group overflow-hidden animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                >
                  {/* Image - Premium */}
                  <div className="-mx-5 -mt-5 sm:-mx-6 sm:-mt-6 h-52 bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center mb-5 overflow-hidden relative">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-orange-200/50 dark:bg-orange-800/30 rounded-2xl flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-orange-400 dark:text-orange-600" />
                        </div>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <Badge variant={getCategoryBadgeVariant(item.category)}>
                      {item.category || "Umum"}
                    </Badge>
                  </div>

                  {/* Title - Premium */}
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                    {item.title}
                  </h2>

                  {/* Date & Author */}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 font-medium">
                    {formatDate(item.published_at)} •{" "}
                    {Array.isArray(item.users)
                      ? item.users[0]?.full_name || "Admin"
                      : item.users?.full_name || "Admin"}
                  </p>

                  {/* Summary */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 flex-1 leading-relaxed">
                    {item.excerpt || item.content.substring(0, 150) + "..."}
                  </p>

                  {/* Read More Link - Premium */}
                  <Link
                    href={`/berita/${item.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 group-hover:gap-3 transition-all duration-300"
                  >
                    Baca selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Newspaper className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Tidak ada berita ditemukan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? `Tidak ada berita yang cocok dengan pencarian "${searchQuery}"`
                  : selectedCategory !== "Semua"
                  ? `Tidak ada berita dalam kategori "${selectedCategory}"`
                  : "Belum ada berita yang dipublikasikan"}
              </p>
              {(searchQuery || selectedCategory !== "Semua") && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Semua");
                  }}
                  variant="outline"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
