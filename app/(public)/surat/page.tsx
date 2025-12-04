"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  FileText,
  Download,
  FileDown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  File,
  Loader2,
} from "lucide-react";
import { Container, Card, Badge, Button } from "@/components";

// Tipe data dari database
interface SuratTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  file_format: string;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
}

// Kategori untuk filter
const suratCategories = [
  "umum",
  "kependudukan",
  "usaha",
  "tanah",
  "lainnya",
];

const categoryLabels: Record<string, string> = {
  umum: "Umum",
  kependudukan: "Kependudukan",
  usaha: "Usaha",
  tanah: "Pertanahan",
  lainnya: "Lainnya",
};

type CategoryFilter = string | "Semua";

// FAQ Data
const faqData = [
  {
    question: "Bagaimana cara mengisi surat?",
    answer:
      "Setelah mendownload file template, buka menggunakan Microsoft Word atau aplikasi pengolah kata lainnya. Isi bagian yang bertanda [...] atau yang dikosongkan dengan data Anda yang sesuai. Setelah selesai, simpan dan cetak surat tersebut.",
  },
  {
    question: "Apakah perlu tanda tangan Kepala Desa?",
    answer:
      "Ya, untuk surat yang memerlukan pengesahan resmi. Setelah Anda mengisi dan mencetak surat, bawa ke kantor desa untuk mendapatkan tanda tangan Kepala Desa dan stempel resmi. Beberapa surat mungkin juga memerlukan tanda tangan RT/RW terlebih dahulu.",
  },
  {
    question: "Bolehkah saya mengedit isi surat sesuai kebutuhan?",
    answer:
      "Anda dapat mengisi bagian data diri dan informasi yang diminta. Namun, format dan isi resmi surat sebaiknya tidak diubah agar tetap sesuai dengan standar administrasi desa. Jika ada kebutuhan khusus, silakan konsultasikan dengan petugas desa.",
  },
  {
    question: "Berapa lama proses pengesahan di kantor desa?",
    answer:
      "Proses pengesahan biasanya memakan waktu 1-3 hari kerja, tergantung ketersediaan Kepala Desa. Untuk keperluan mendesak, silakan informasikan kepada petugas desa.",
  },
  {
    question: "Apakah ada biaya untuk download template surat?",
    answer:
      "Tidak ada biaya untuk mendownload template surat dari website ini. Semua template tersedia gratis untuk warga Desa Toundanouw. Biaya mungkin hanya diperlukan untuk cetak dan materai (jika diperlukan).",
  },
];

// FAQ Item Component
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function SuratPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("Semua");
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  
  // State untuk data dari API
  const [suratList, setSuratList] = useState<SuratTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch surat dari API
  const fetchSurat = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/surat?limit=100");
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Gagal memuat data surat");
      }
      
      setSuratList(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurat();
  }, [fetchSurat]);

  // Filter surat berdasarkan pencarian dan kategori
  const filteredSurat = suratList.filter((surat) => {
    const matchSearch =
      surat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (surat.description && surat.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory =
      selectedCategory === "Semua" || surat.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Hitung jumlah per kategori
  const getCategoryCount = (category: string) => {
    return suratList.filter((s) => s.category === category).length;
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleCategoryChange = (category: CategoryFilter) => {
    setSelectedCategory(category);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Handle download - trigger API untuk log
  const handleDownload = async (surat: SuratTemplate) => {
    if (!surat.file_url) {
      alert("File tidak tersedia");
      return;
    }

    // Trigger download log via API
    try {
      await fetch(`/api/surat/${surat.id}`);
    } catch (err) {
      console.error("Error logging download:", err);
    }

    // Open file URL
    window.open(surat.file_url, "_blank");
  };

  return (
    <>
      {/* Header Section - Premium */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/15 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        <Container className="py-14 sm:py-20 relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-black/10">
              <FileDown className="w-7 h-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Layanan E-Surat Desa
            </h1>
          </div>
          <p className="text-white/85 text-lg max-w-3xl mb-8 leading-relaxed">
            Download template surat dalam format Word (.docx). Cetak, isi data
            Anda sendiri, lalu bawa ke kantor desa jika memerlukan pengesahan.
          </p>

          {/* How It Works - Premium */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 max-w-4xl border border-white/20">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-3">
              <HelpCircle className="w-5 h-5" />
              Cara Menggunakan Layanan Ini:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold group-hover:bg-white/30 transition-colors shadow-lg">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1">Download Template</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Pilih surat yang dibutuhkan dan download file .docx
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold group-hover:bg-white/30 transition-colors shadow-lg">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1">Cetak & Isi Data</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Buka di Word, isi data, lalu cetak surat
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold group-hover:bg-white/30 transition-colors shadow-lg">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1">Legalisasi</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Bawa ke kantor desa untuk tanda tangan & stempel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Filter Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-16 z-40 py-4">
        <Container>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari surat... (contoh: domisili, usaha, keterangan)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange("Semua")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "Semua"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                }`}
              >
                Semua ({suratList.length})
              </button>
              {suratCategories.map((category) => {
                const count = getCategoryCount(category);
                if (count === 0) return null;
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    }`}
                  >
                    {categoryLabels[category] || category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Surat List */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-16 sm:py-20">
        <Container>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data surat...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Gagal Memuat Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={fetchSurat} variant="primary">
                Coba Lagi
              </Button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Results info */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan {filteredSurat.length} template surat
                  {selectedCategory !== "Semua" &&
                    ` dalam kategori "${categoryLabels[selectedCategory] || selectedCategory}"`}
                  {searchQuery && ` untuk pencarian "${searchQuery}"`}
                </p>
              </div>

              {/* Surat Grid */}
              {filteredSurat.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSurat.map((surat) => (
                    <Card
                      key={surat.id}
                      hoverable
                      className="flex flex-col group hover:shadow-lg transition-all duration-300"
                    >
                      {/* Header with Icon */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <File className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {surat.name}
                          </h3>
                          <Badge variant="default" className="text-xs">
                            {categoryLabels[surat.category || "lainnya"] || surat.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
                        {surat.description || "Template surat untuk keperluan administrasi desa."}
                      </p>

                      {/* File Info */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          Format: {surat.file_format?.toUpperCase() || "PDF"}
                        </span>
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(surat)}
                        disabled={!surat.file_url}
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all group-hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        {surat.file_url ? `Download .${surat.file_format?.toUpperCase() || "PDF"}` : "File Tidak Tersedia"}
                      </button>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Tidak ada surat ditemukan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchQuery
                      ? `Tidak ada surat yang cocok dengan pencarian "${searchQuery}"`
                      : selectedCategory !== "Semua"
                      ? `Tidak ada surat dalam kategori "${categoryLabels[selectedCategory] || selectedCategory}"`
                      : "Belum ada template surat yang tersedia"}
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
            </>
          )}
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="bg-white dark:bg-slate-900 py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Temukan jawaban untuk pertanyaan umum seputar layanan surat desa
              </p>
            </div>

            <Card className="divide-y divide-gray-200 dark:divide-slate-700">
              {faqData.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => toggleFAQ(index)}
                />
              ))}
            </Card>

            {/* Contact CTA */}
            <div className="mt-8 text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Masih ada pertanyaan? Hubungi kantor desa kami untuk bantuan
                lebih lanjut.
              </p>
              <Button href="/kontak" variant="primary">
                Hubungi Kami
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
