/**
 * Data dan helper untuk template surat desa
 * File: lib/surat-templates.ts
 */

export type SuratCategory =
  | "Keterangan Penduduk"
  | "Keterangan Usaha"
  | "Keterangan Pendidikan"
  | "Pengantar RT/RW";

export interface SuratTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SuratCategory;
  fileUrl: string;
  fileSize?: string;
  format: ".docx";
}

/** Daftar semua kategori surat */
export const suratCategories: SuratCategory[] = [
  "Keterangan Penduduk",
  "Keterangan Usaha",
  "Keterangan Pendidikan",
  "Pengantar RT/RW",
];

/**
 * Data dummy template surat desa
 */
export const suratTemplates: SuratTemplate[] = [
  // === Keterangan Penduduk ===
  {
    id: "1",
    slug: "surat-keterangan-domisili",
    name: "Surat Keterangan Domisili",
    description:
      "Surat keterangan tempat tinggal untuk keperluan administrasi seperti pendaftaran sekolah, pekerjaan, atau keperluan lainnya.",
    category: "Keterangan Penduduk",
    fileUrl: "/templates/surat-domisili.docx",
    fileSize: "24 KB",
    format: ".docx",
  },
  {
    id: "2",
    slug: "surat-keterangan-tidak-mampu",
    name: "Surat Keterangan Tidak Mampu (SKTM)",
    description:
      "Surat keterangan untuk warga yang membutuhkan bantuan atau keringanan biaya pendidikan, kesehatan, dan keperluan sosial lainnya.",
    category: "Keterangan Penduduk",
    fileUrl: "/templates/sktm.docx",
    fileSize: "22 KB",
    format: ".docx",
  },
  {
    id: "3",
    slug: "surat-keterangan-belum-menikah",
    name: "Surat Keterangan Belum Menikah",
    description:
      "Surat keterangan status belum menikah untuk keperluan administrasi, pendaftaran kerja, atau keperluan pribadi lainnya.",
    category: "Keterangan Penduduk",
    fileUrl: "/templates/surat-belum-menikah.docx",
    fileSize: "21 KB",
    format: ".docx",
  },
  {
    id: "4",
    slug: "surat-keterangan-kelahiran",
    name: "Surat Keterangan Kelahiran",
    description:
      "Surat keterangan kelahiran dari desa untuk pengurusan akta kelahiran di Dinas Kependudukan dan Catatan Sipil.",
    category: "Keterangan Penduduk",
    fileUrl: "/templates/surat-kelahiran.docx",
    fileSize: "23 KB",
    format: ".docx",
  },
  {
    id: "5",
    slug: "surat-keterangan-kematian",
    name: "Surat Keterangan Kematian",
    description:
      "Surat keterangan kematian dari desa untuk pengurusan administrasi dan akta kematian.",
    category: "Keterangan Penduduk",
    fileUrl: "/templates/surat-kematian.docx",
    fileSize: "22 KB",
    format: ".docx",
  },
  {
    id: "6",
    slug: "surat-keterangan-pindah",
    name: "Surat Keterangan Pindah",
    description:
      "Surat keterangan untuk warga yang akan pindah domisili ke desa atau kelurahan lain.",
    category: "Keterangan Penduduk",
    fileUrl: "/templates/surat-pindah.docx",
    fileSize: "24 KB",
    format: ".docx",
  },

  // === Keterangan Usaha ===
  {
    id: "7",
    slug: "surat-keterangan-usaha",
    name: "Surat Keterangan Usaha",
    description:
      "Surat keterangan untuk keperluan izin usaha, pengajuan kredit usaha rakyat (KUR), atau modal kerja.",
    category: "Keterangan Usaha",
    fileUrl: "/templates/surat-usaha.docx",
    fileSize: "26 KB",
    format: ".docx",
  },
  {
    id: "8",
    slug: "surat-keterangan-penghasilan",
    name: "Surat Keterangan Penghasilan",
    description:
      "Surat keterangan penghasilan untuk keperluan pengajuan kredit, beasiswa, atau administrasi keuangan lainnya.",
    category: "Keterangan Usaha",
    fileUrl: "/templates/surat-penghasilan.docx",
    fileSize: "23 KB",
    format: ".docx",
  },

  // === Keterangan Pendidikan ===
  {
    id: "9",
    slug: "surat-rekomendasi-beasiswa",
    name: "Surat Rekomendasi Beasiswa",
    description:
      "Surat rekomendasi dari desa untuk pengajuan beasiswa pendidikan di berbagai lembaga.",
    category: "Keterangan Pendidikan",
    fileUrl: "/templates/surat-rekomendasi-beasiswa.docx",
    fileSize: "25 KB",
    format: ".docx",
  },
  {
    id: "10",
    slug: "surat-pengantar-keterangan-aktif-sekolah",
    name: "Surat Pengantar Keterangan Aktif Sekolah",
    description:
      "Surat pengantar untuk keperluan pembuatan keterangan masih aktif bersekolah.",
    category: "Keterangan Pendidikan",
    fileUrl: "/templates/surat-aktif-sekolah.docx",
    fileSize: "19 KB",
    format: ".docx",
  },

  // === Pengantar RT/RW ===
  {
    id: "11",
    slug: "surat-pengantar-ktp",
    name: "Surat Pengantar KTP",
    description:
      "Surat pengantar untuk pembuatan atau perpanjangan KTP di Dinas Kependudukan dan Catatan Sipil.",
    category: "Pengantar RT/RW",
    fileUrl: "/templates/pengantar-ktp.docx",
    fileSize: "20 KB",
    format: ".docx",
  },
  {
    id: "12",
    slug: "surat-pengantar-skck",
    name: "Surat Pengantar SKCK",
    description:
      "Surat pengantar untuk pembuatan Surat Keterangan Catatan Kepolisian (SKCK) di kantor kepolisian.",
    category: "Pengantar RT/RW",
    fileUrl: "/templates/pengantar-skck.docx",
    fileSize: "21 KB",
    format: ".docx",
  },
  {
    id: "13",
    slug: "surat-pengantar-nikah",
    name: "Surat Pengantar Nikah (N1, N2, N4)",
    description:
      "Surat pengantar untuk keperluan pendaftaran nikah di Kantor Urusan Agama (KUA).",
    category: "Pengantar RT/RW",
    fileUrl: "/templates/surat-pengantar-nikah.docx",
    fileSize: "28 KB",
    format: ".docx",
  },
  {
    id: "14",
    slug: "surat-pengantar-kartu-keluarga",
    name: "Surat Pengantar Kartu Keluarga",
    description:
      "Surat pengantar untuk pembuatan atau perubahan Kartu Keluarga (KK) di Disdukcapil.",
    category: "Pengantar RT/RW",
    fileUrl: "/templates/pengantar-kk.docx",
    fileSize: "20 KB",
    format: ".docx",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Ambil semua template surat
 */
export function getAllSuratTemplates(): SuratTemplate[] {
  return suratTemplates;
}

/**
 * Ambil template surat berdasarkan slug
 */
export function getSuratTemplateBySlug(
  slug: string
): SuratTemplate | undefined {
  return suratTemplates.find((surat) => surat.slug === slug);
}

/**
 * Ambil template surat berdasarkan kategori
 */
export function getSuratTemplatesByCategory(
  category: SuratCategory
): SuratTemplate[] {
  return suratTemplates.filter((surat) => surat.category === category);
}

/**
 * Filter surat berdasarkan kategori dan keyword
 */
export function filterSuratTemplates(
  category?: SuratCategory | "Semua",
  keyword?: string
): SuratTemplate[] {
  let filtered = [...suratTemplates];

  if (category && category !== "Semua") {
    filtered = filtered.filter((surat) => surat.category === category);
  }

  if (keyword && keyword.trim()) {
    const searchTerm = keyword.toLowerCase().trim();
    filtered = filtered.filter(
      (surat) =>
        surat.name.toLowerCase().includes(searchTerm) ||
        surat.description.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

/**
 * Hitung jumlah surat per kategori
 */
export function countSuratByCategory(): Record<SuratCategory | "Semua", number> {
  const counts: Record<SuratCategory | "Semua", number> = {
    Semua: suratTemplates.length,
    "Keterangan Penduduk": 0,
    "Keterangan Usaha": 0,
    "Keterangan Pendidikan": 0,
    "Pengantar RT/RW": 0,
  };

  suratTemplates.forEach((surat) => {
    counts[surat.category]++;
  });

  return counts;
}
