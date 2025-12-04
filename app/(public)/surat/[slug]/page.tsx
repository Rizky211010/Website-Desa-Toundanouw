"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Home,
  ChevronRight,
  FileText,
  Download,
  CheckCircle,
  Info,
  FileCheck,
  Loader2,
} from "lucide-react";
import { Container, Badge, Button } from "@/components";

// Tipe data dari database
interface SuratTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string | null;
  category: string | null;
  file_format: string;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
}

// Kategori labels
const categoryLabels: Record<string, string> = {
  umum: "Umum",
  kependudukan: "Kependudukan",
  usaha: "Usaha",
  tanah: "Pertanahan",
  lainnya: "Lainnya",
};

function getCategoryBadgeVariant(category: string | null) {
  switch (category) {
    case "kependudukan":
      return "success";
    case "usaha":
      return "info";
    case "tanah":
      return "warning";
    case "umum":
      return "default";
    default:
      return "danger";
  }
}

// Data kegunaan surat berdasarkan kategori
function getUseCases(category: string | null): string[] {
  const useCases: Record<string, string[]> = {
    kependudukan: [
      "Pendaftaran sekolah atau perguruan tinggi",
      "Melamar pekerjaan di instansi pemerintah atau swasta",
      "Pengajuan kredit atau pinjaman di bank",
      "Keperluan administrasi kependudukan lainnya",
    ],
    usaha: [
      "Pengajuan izin usaha mikro kecil (IUMK)",
      "Pengajuan kredit usaha rakyat (KUR)",
      "Pendaftaran BPJS Ketenagakerjaan mandiri",
      "Keperluan administrasi perpajakan",
    ],
    tanah: [
      "Pengurusan sertifikat tanah",
      "Transaksi jual beli tanah",
      "Pengajuan kredit dengan jaminan tanah",
      "Keperluan administrasi pertanahan",
    ],
    umum: [
      "Keperluan administrasi umum di kantor desa",
      "Pengurusan dokumen kependudukan",
      "Keperluan surat menyurat resmi",
      "Berbagai keperluan administratif lainnya",
    ],
    lainnya: [
      "Keperluan pengurusan warisan atau harta",
      "Laporan kehilangan dokumen penting",
      "Keperluan administrasi hukum",
      "Pengurusan asuransi atau klaim",
    ],
  };

  return useCases[category || "lainnya"] || useCases["lainnya"];
}

// Syarat umum surat
function getRequirements(category: string | null): string[] {
  const requirements: Record<string, string[]> = {
    kependudukan: [
      "Fotokopi KTP yang masih berlaku",
      "Fotokopi Kartu Keluarga (KK)",
      "Pas foto terbaru ukuran 3x4 (2 lembar)",
      "Surat pengantar dari RT/RW setempat",
    ],
    usaha: [
      "Fotokopi KTP pemilik usaha",
      "Fotokopi Kartu Keluarga (KK)",
      "Surat keterangan domisili usaha dari RT/RW",
      "Foto lokasi usaha (jika diperlukan)",
    ],
    tanah: [
      "Fotokopi KTP pemilik tanah",
      "Fotokopi Kartu Keluarga (KK)",
      "Sertifikat tanah atau bukti kepemilikan",
      "Surat pengantar dari RT/RW setempat",
    ],
    umum: [
      "Fotokopi KTP yang masih berlaku",
      "Fotokopi Kartu Keluarga (KK)",
      "Surat pengantar dari RT setempat",
      "Dokumen pendukung sesuai keperluan",
    ],
    lainnya: [
      "Fotokopi KTP pemohon",
      "Fotokopi Kartu Keluarga (KK)",
      "Dokumen pendukung sesuai jenis surat",
      "Surat pengantar dari RT/RW (jika diperlukan)",
    ],
  };

  return requirements[category || "lainnya"] || requirements["lainnya"];
}

export default function SuratDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [surat, setSurat] = useState<SuratTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch surat by slug
  useEffect(() => {
    const fetchSurat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch semua surat dan filter by slug
        const response = await fetch("/api/surat?limit=100");
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat data surat");
        }
        
        const found = (result.data || []).find((s: SuratTemplate) => s.slug === slug);
        if (found) {
          setSurat(found);
        } else {
          setError("Surat tidak ditemukan");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSurat();
    }
  }, [slug]);

  // Handle download
  const handleDownload = async () => {
    if (!surat?.file_url) {
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

  // Loading state
  if (loading) {
    return (
      <section className="py-16">
        <Container compact>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data surat...</span>
          </div>
        </Container>
      </section>
    );
  }

  // Not found state
  if (error || !surat) {
    return (
      <>
        {/* Breadcrumb */}
        <section className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
          <Container compact className="py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Beranda</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                href="/surat"
                className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Surat
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                Tidak Ditemukan
              </span>
            </nav>
          </Container>
        </section>

        {/* Not Found Content */}
        <section className="py-16">
          <Container compact>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Surat Tidak Ditemukan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {error || "Maaf, template surat yang Anda cari tidak tersedia atau telah dihapus. Silakan kembali ke halaman daftar surat."}
              </p>
              <Button href="/surat" variant="primary">
                Kembali ke Daftar Surat
              </Button>
            </div>
          </Container>
        </section>
      </>
    );
  }

  const useCases = getUseCases(surat.category);
  const requirements = getRequirements(surat.category);

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
        <Container compact className="py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href="/surat"
              className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Surat
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-none">
              {surat.name}
            </span>
          </nav>
        </Container>
      </section>

      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <Container compact className="py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="mb-3">
                <Badge variant={getCategoryBadgeVariant(surat.category)}>
                  {categoryLabels[surat.category || "lainnya"] || surat.category}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {surat.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {surat.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Template surat siap download dalam format Word (.docx)
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <Container compact>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Kapan Surat Digunakan */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-600" />
                  Kapan surat ini digunakan?
                </h2>
                <ul className="space-y-3">
                  {useCases.map((useCase, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Syarat Umum */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Syarat umum
                </h2>
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cara Menggunakan Template */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-orange-600" />
                  Cara menggunakan template
                </h2>
                <ol className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Download file Word
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Klik tombol download di bawah untuk mengunduh template
                        dalam format .docx
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Isi data diri secara lengkap dan benar
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Buka file menggunakan Microsoft Word atau aplikasi
                        serupa, lalu lengkapi data yang diperlukan
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Print surat
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Cetak surat menggunakan kertas HVS ukuran A4 atau F4
                        sesuai kebutuhan
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex-shrink-0">
                      4
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Datang ke kantor desa untuk legalisasi
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Bawa surat yang sudah diprint beserta dokumen persyaratan
                        ke Kantor Desa Toundanouw untuk ditandatangani dan
                        distempel
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Sample Preview */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contoh Struktur Surat
                </h2>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-700 font-mono text-sm">
                  {/* Header Preview */}
                  <div className="text-center border-b border-dashed border-gray-300 dark:border-slate-600 pb-4 mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      [KOP SURAT DESA]
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      PEMERINTAH KABUPATEN MINAHASA TENGGARA
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      KECAMATAN TOULUAAN
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      DESA TOUNDANOUW
                    </p>
                  </div>

                  {/* Title Preview */}
                  <div className="text-center mb-4">
                    <p className="font-bold text-gray-900 dark:text-white underline">
                      {surat.name.toUpperCase()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Nomor: ...../...../....../2024
                    </p>
                  </div>

                  {/* Body Preview */}
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                    <p>Yang bertanda tangan di bawah ini:</p>
                    <p className="pl-4">
                      Nama : ................................
                    </p>
                    <p className="pl-4">
                      Jabatan : Kepala Desa Toundanouw
                    </p>
                    <p className="mt-2">
                      Dengan ini menerangkan bahwa:
                    </p>
                    <p className="pl-4">
                      Nama : ................................
                    </p>
                    <p className="pl-4">
                      NIK : ................................
                    </p>
                    <p className="pl-4">
                      Alamat : ................................
                    </p>
                  </div>

                  {/* Footer Preview */}
                  <div className="border-t border-dashed border-gray-300 dark:border-slate-600 pt-4 flex justify-end">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-8">
                        Toundanouw, .... .............. 2024
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Kepala Desa Toundanouw
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-12">
                        (..................................)
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  * Tampilan di atas hanya ilustrasi struktur umum surat. Format
                  sebenarnya mungkin berbeda.
                </p>
              </div>
            </div>

            {/* Sidebar - Download Area */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-md mx-auto mb-4">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Download Template Surat
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                    Template siap pakai untuk keperluan administrasi
                  </p>

                  {/* File Info */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Format
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {surat.file_format?.toUpperCase() || "PDF"}
                      </span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={!surat.file_url}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    {surat.file_url ? `Download .${surat.file_format?.toUpperCase() || "PDF"}` : "File Tidak Tersedia"}
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    Dengan mengunduh, Anda menyetujui penggunaan template ini
                    untuk keperluan administrasi yang sah.
                  </p>
                </div>

                {/* Back Button */}
                <div className="mt-4">
                  <Button href="/surat" variant="outline" className="w-full">
                    ← Kembali ke Daftar Surat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
