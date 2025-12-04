export type NewsCategory = "Umum" | "Pengumuman Penting" | "Kegiatan" | "Pembangunan" | "Bansos";
export type NewsStatus = "published" | "draft";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  publishedAt: string;
  author: string;
  imageUrl?: string;
  status?: NewsStatus;
}

/** Daftar semua kategori berita */
export const newsCategories: NewsCategory[] = [
  "Umum",
  "Pengumuman Penting",
  "Kegiatan",
  "Pembangunan",
  "Bansos",
];

/**
 * Data dummy berita desa
 */
export const newsData: NewsItem[] = [
  {
    id: "1",
    slug: "musyawarah-desa-2024",
    title: "Musyawarah Desa Toundanouw Tahun 2024 Sukses Dilaksanakan",
    summary:
      "Pemerintah Desa Toundanouw telah sukses menyelenggarakan Musyawarah Desa (Musdes) tahunan dengan partisipasi aktif dari seluruh elemen masyarakat.",
    content: `Pemerintah Desa Toundanouw telah sukses menyelenggarakan Musyawarah Desa (Musdes) tahunan dengan partisipasi aktif dari seluruh elemen masyarakat.

Acara yang dihadiri oleh lebih dari 150 warga ini membahas berbagai program pembangunan untuk tahun mendatang, termasuk:

1. Perbaikan infrastruktur jalan desa
2. Program peningkatan kesejahteraan masyarakat
3. Rencana pembangunan fasilitas umum
4. Pengelolaan dana desa yang transparan

Kepala Desa Toundanouw menyampaikan apresiasi kepada seluruh warga yang hadir dan berpartisipasi aktif dalam musyawarah ini. "Partisipasi warga sangat penting untuk kemajuan desa kita bersama," ujarnya.

Hasil musyawarah akan segera ditindaklanjuti dan disosialisasikan kepada seluruh warga desa.`,
    category: "Kegiatan",
    publishedAt: "2024-11-28",
    author: "Admin Desa",
  },
  {
    id: "2",
    slug: "jadwal-posyandu-desember",
    title: "Jadwal Posyandu Bulan Desember 2024",
    summary:
      "Informasi jadwal pelayanan Posyandu Desa Toundanouw untuk bulan Desember 2024. Harap warga membawa KMS dan buku KIA.",
    content: `Informasi jadwal pelayanan Posyandu Desa Toundanouw untuk bulan Desember 2024.

**Jadwal Pelayanan:**
- Kamis, 5 Desember 2024 (Minggu I)
- Kamis, 19 Desember 2024 (Minggu III)

**Waktu:** 08:00 - 12:00 WITA

**Lokasi:** Balai Desa Toundanouw

**Yang perlu dibawa:**
- Kartu Menuju Sehat (KMS)
- Buku KIA
- Kartu BPJS (jika ada)

Pelayanan meliputi: penimbangan balita, imunisasi, pemeriksaan ibu hamil, dan konsultasi kesehatan.

Untuk informasi lebih lanjut, hubungi Kader Posyandu atau Bidan Desa.`,
    category: "Pengumuman Penting",
    publishedAt: "2024-11-25",
    author: "Kader Posyandu",
  },
  {
    id: "3",
    slug: "perbaikan-jalan-desa",
    title: "Program Perbaikan Jalan Desa Dimulai",
    summary:
      "Pemerintah desa telah memulai program perbaikan jalan desa sepanjang 2 km menggunakan dana desa tahun 2024.",
    content: `Pemerintah Desa Toundanouw telah memulai program perbaikan jalan desa sepanjang 2 km menggunakan Dana Desa tahun 2024.

**Detail Program:**
- Panjang jalan: 2 kilometer
- Lebar jalan: 4 meter
- Jenis pekerjaan: Pengaspalan dan perbaikan drainase
- Anggaran: Dana Desa 2024
- Durasi: 3 bulan (November 2024 - Januari 2025)

**Ruas Jalan yang Diperbaiki:**
1. Jalan utama desa (dari gerbang hingga balai desa)
2. Jalan menuju area pertanian

Program ini diharapkan dapat meningkatkan aksesibilitas dan mobilitas warga, serta mendukung aktivitas ekonomi desa.

Kami mohon maaf atas ketidaknyamanan selama proses pengerjaan. Harap berhati-hati saat melewati area proyek.`,
    category: "Pembangunan",
    publishedAt: "2024-11-20",
    author: "Admin Desa",
  },
  {
    id: "4",
    slug: "pendaftaran-bantuan-sosial-2025",
    title: "Pendaftaran Bantuan Sosial Tahun 2025 Dibuka",
    summary:
      "Bagi warga yang membutuhkan bantuan sosial, pendaftaran untuk program bantuan tahun 2025 telah dibuka.",
    content: `Pemerintah Desa Toundanouw membuka pendaftaran program Bantuan Sosial (Bansos) untuk tahun 2025.

**Jenis Bantuan yang Tersedia:**
- Program Keluarga Harapan (PKH)
- Bantuan Pangan Non-Tunai (BPNT)
- Bantuan Langsung Tunai Dana Desa (BLT-DD)

**Persyaratan Umum:**
1. Warga Desa Toundanouw yang terdaftar di KK
2. Termasuk kategori keluarga kurang mampu
3. Belum menerima bantuan serupa dari program lain

**Dokumen yang Diperlukan:**
- Fotokopi KTP
- Fotokopi Kartu Keluarga (KK)
- Surat Keterangan Tidak Mampu (jika ada)
- Foto rumah tampak depan

**Waktu Pendaftaran:**
15 November - 15 Desember 2024

**Tempat Pendaftaran:**
Kantor Desa Toundanouw (Senin - Jumat, 08:00 - 15:00 WITA)

Untuk informasi lebih lanjut, hubungi Sekretaris Desa.`,
    category: "Bansos",
    publishedAt: "2024-11-15",
    author: "Sekretaris Desa",
  },
  {
    id: "5",
    slug: "peringatan-hari-pahlawan-2024",
    title: "Peringatan Hari Pahlawan 10 November 2024",
    summary:
      "Desa Toundanouw mengadakan upacara peringatan Hari Pahlawan di lapangan desa dengan penuh khidmat.",
    content: `Desa Toundanouw telah melaksanakan upacara peringatan Hari Pahlawan pada tanggal 10 November 2024 di Lapangan Desa.

Upacara yang berlangsung khidmat ini dihadiri oleh:
- Kepala Desa dan Perangkat Desa
- Tokoh masyarakat dan tokoh agama
- Pelajar dari SD dan SMP di wilayah desa
- Warga masyarakat

Dalam sambutannya, Kepala Desa mengajak seluruh warga untuk mengenang jasa para pahlawan dan meneladani semangat perjuangan mereka dalam membangun desa.

Acara ditutup dengan tabur bunga di Tugu Pahlawan desa dan doa bersama untuk para pahlawan yang telah gugur.`,
    category: "Kegiatan",
    publishedAt: "2024-11-10",
    author: "Admin Desa",
  },
  {
    id: "6",
    slug: "penyaluran-blt-dana-desa",
    title: "Penyaluran BLT Dana Desa Tahap 3 Tahun 2024",
    summary:
      "Pemerintah desa akan menyalurkan Bantuan Langsung Tunai Dana Desa tahap 3 kepada 85 Keluarga Penerima Manfaat.",
    content: `Pemerintah Desa Toundanouw akan menyalurkan Bantuan Langsung Tunai Dana Desa (BLT-DD) Tahap 3 Tahun 2024.

**Informasi Penyaluran:**
- Jumlah KPM: 85 Keluarga
- Besaran bantuan: Rp 300.000 per KPM
- Tanggal penyaluran: 20 November 2024

**Tempat Penyaluran:**
Balai Desa Toundanouw

**Waktu:**
08:00 - 14:00 WITA

**Yang Harus Dibawa:**
1. KTP asli
2. Kartu Keluarga asli
3. Buku tabungan (jika transfer)

Bagi KPM yang berhalangan hadir, dapat diwakilkan dengan membawa surat kuasa bermaterai dan KTP penerima kuasa.

Daftar penerima BLT-DD dapat dilihat di papan pengumuman Kantor Desa.`,
    category: "Bansos",
    publishedAt: "2024-11-08",
    author: "Bendahara Desa",
  },
  {
    id: "7",
    slug: "himbauan-waspada-cuaca-ekstrem",
    title: "PENTING: Himbauan Waspada Cuaca Ekstrem",
    summary:
      "Warga desa diimbau untuk waspada terhadap potensi cuaca ekstrem dan banjir selama musim hujan.",
    content: `**HIMBAUAN PENTING**

Kepada seluruh warga Desa Toundanouw, berdasarkan informasi dari BMKG, wilayah kita berpotensi mengalami cuaca ekstrem dalam beberapa hari ke depan.

**Potensi Bahaya:**
- Hujan lebat disertai petir
- Angin kencang
- Banjir di daerah rendah
- Longsor di daerah lereng

**Langkah Antisipasi:**
1. Hindari aktivitas di luar ruangan saat hujan lebat
2. Jauhi pohon besar dan tiang listrik saat badai
3. Siapkan perlengkapan darurat (senter, obat-obatan, makanan)
4. Pastikan saluran air di sekitar rumah tidak tersumbat
5. Simpan nomor darurat yang bisa dihubungi

**Nomor Darurat:**
- Kepala Desa: 0812-XXXX-XXXX
- Linmas Desa: 0813-XXXX-XXXX
- PMI: 119

Segera laporkan jika ada kejadian darurat atau kerusakan akibat cuaca ekstrem.

Tetap waspada dan jaga keselamatan keluarga!`,
    category: "Pengumuman Penting",
    publishedAt: "2024-11-05",
    author: "Kepala Desa",
  },
  {
    id: "8",
    slug: "lomba-kebersihan-antar-rt",
    title: "Lomba Kebersihan Antar RT dalam Rangka HUT Desa",
    summary:
      "Dalam rangka HUT Desa Toundanouw, akan diadakan lomba kebersihan antar RT dengan hadiah menarik.",
    content: `Dalam rangka memperingati Hari Ulang Tahun Desa Toundanouw, Pemerintah Desa menyelenggarakan Lomba Kebersihan Antar RT.

**Detail Lomba:**
- Periode penilaian: 1 - 30 November 2024
- Peserta: Seluruh RT di Desa Toundanouw
- Aspek penilaian: Kebersihan lingkungan, pengelolaan sampah, penghijauan

**Hadiah:**
- Juara 1: Rp 3.000.000 + Piala
- Juara 2: Rp 2.000.000 + Piala
- Juara 3: Rp 1.000.000 + Piala

**Kriteria Penilaian:**
1. Kebersihan jalan dan selokan (30%)
2. Pengelolaan sampah rumah tangga (25%)
3. Penghijauan dan taman (25%)
4. Partisipasi warga (20%)

Mari bersama-sama menjaga kebersihan lingkungan untuk desa yang lebih asri dan sehat!`,
    category: "Umum",
    publishedAt: "2024-11-01",
    author: "Panitia HUT Desa",
  },
];

/**
 * Ambil berita terbaru
 */
export function getLatestNews(count: number = 4): NewsItem[] {
  return newsData
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, count);
}

/**
 * Ambil berita berdasarkan slug
 */
export function getNewsBySlug(slug: string): NewsItem | undefined {
  return newsData.find((news) => news.slug === slug);
}

/**
 * Ambil semua berita (sorted by date)
 */
export function getAllNews(): NewsItem[] {
  return [...newsData].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Filter berita berdasarkan kategori dan keyword
 */
export function filterNews(
  category?: NewsCategory | "Semua",
  keyword?: string
): NewsItem[] {
  let filtered = getAllNews();

  if (category && category !== "Semua") {
    filtered = filtered.filter((news) => news.category === category);
  }

  if (keyword && keyword.trim()) {
    const searchTerm = keyword.toLowerCase().trim();
    filtered = filtered.filter(
      (news) =>
        news.title.toLowerCase().includes(searchTerm) ||
        news.summary.toLowerCase().includes(searchTerm) ||
        news.content.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

/**
 * Format tanggal ke Bahasa Indonesia
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
