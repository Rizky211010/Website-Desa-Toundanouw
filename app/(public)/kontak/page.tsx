"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Send,
  CheckCircle,
  MessageSquare,
  Building2,
  Navigation,
  Loader2,
} from "lucide-react";
import { Container, PageHeader, Button } from "@/components";

// Interface untuk settings
interface ContactSettings {
  telepon: string;
  whatsapp: string;
  email: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  hariKerja: string;
  jamKerja: string;
  hariLibur: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  embedMap: string;
  koordinatLat: string;
  koordinatLng: string;
}

// Default values (fallback jika belum ada di database)
const defaultSettings: ContactSettings = {
  telepon: "(0431) 123-456",
  whatsapp: "081234567890",
  email: "desa.toundanouw@gmail.com",
  alamat: "Jl. Utama Desa No. 1",
  desa: "Toundanouw",
  kecamatan: "Touluaan",
  kabupaten: "Minahasa Tenggara",
  provinsi: "Sulawesi Utara",
  kodePos: "95361",
  hariKerja: "Senin - Jumat",
  jamKerja: "08:00 - 16:00",
  hariLibur: "Sabtu, Minggu, Hari Libur Nasional",
  facebook: "https://facebook.com/desatoundanouw",
  instagram: "https://instagram.com/desatoundanouw",
  youtube: "",
  tiktok: "",
  embedMap: "https://maps.google.com/maps?q=Toundanouw&output=embed",
  koordinatLat: "1.3808",
  koordinatLng: "124.7772",
};

// Mapping database keys ke form fields
const keyToFieldMap: Record<string, keyof ContactSettings> = {
  contact_phone: 'telepon',
  contact_whatsapp: 'whatsapp',
  contact_email: 'email',
  address_street: 'alamat',
  address_village: 'desa',
  address_district: 'kecamatan',
  address_regency: 'kabupaten',
  address_province: 'provinsi',
  address_postal_code: 'kodePos',
  hours_workdays: 'hariKerja',
  hours_operational: 'jamKerja',
  hours_holidays: 'hariLibur',
  social_facebook: 'facebook',
  social_instagram: 'instagram',
  social_youtube: 'youtube',
  social_tiktok: 'tiktok',
  maps_embed_url: 'embedMap',
  maps_latitude: 'koordinatLat',
  maps_longitude: 'koordinatLng',
};

export default function KontakPage() {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nama: "",
    kontak: "",
    pesan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch settings dari database
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const result = await response.json();

      if (response.ok && result.data) {
        const dbSettings = result.data;
        const newSettings = { ...defaultSettings };

        Object.entries(keyToFieldMap).forEach(([key, field]) => {
          if (dbSettings[key] !== undefined && dbSettings[key] !== '') {
            newSettings[field] = dbSettings[key];
          }
        });

        setSettings(newSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Build full address
  const fullAddress = `${settings.alamat}, Desa ${settings.desa}, Kec. ${settings.kecamatan}, Kab. ${settings.kabupaten}, ${settings.provinsi} ${settings.kodePos}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim pesan');
      }

      setIsSuccess(true);
      setFormData({ nama: "", kontak: "", pesan: "" });

      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Error sending message:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pesan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Loading state
  if (loading) {
    return (
      <>
        <PageHeader
          title="Kontak & Layanan Desa"
          subtitle="Informasi jam pelayanan dan cara menghubungi perangkat Desa Toundanouw untuk keperluan administrasi dan layanan publik."
          breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
        />
        <section className="py-16">
          <Container>
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat informasi kontak...</span>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Kontak & Layanan Desa"
        subtitle="Informasi jam pelayanan dan cara menghubungi perangkat Desa Toundanouw untuk keperluan administrasi dan layanan publik."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
      />

      {/* Main Content - Premium */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Contact Info - Premium */}
            <div className="space-y-6">
              {/* Alamat - Premium */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:bg-orange-900/30 flex-shrink-0">
                    <Building2 className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Alamat Kantor Desa
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {fullAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Jam Layanan - Premium */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:bg-amber-900/30 flex-shrink-0">
                    <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                      Jam Pelayanan
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-2.5">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {settings.hariKerja}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {settings.jamKerja} WITA
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-red-50/50 dark:bg-red-900/10 rounded-xl px-4 py-2.5">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {settings.hariLibur}
                        </span>
                        <span className="font-semibold text-red-500">
                          Tutup
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                      * Layanan di luar jam kerja hanya untuk keperluan
                      mendesak.
                    </p>
                  </div>
                </div>
              </div>

              {/* Telepon & WhatsApp - Premium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${settings.telepon.replace(/[^0-9]/g, "")}`}
                  className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:bg-blue-900/30">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      Telepon
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {settings.telepon}
                    </p>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:bg-green-900/30">
                    <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      WhatsApp
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {settings.whatsapp}
                    </p>
                  </div>
                </a>
              </div>

              {/* Email - Premium */}
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:bg-purple-900/30">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                    Email
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {settings.email}
                  </p>
                </div>
              </a>
            </div>

            {/* Right Column - Contact Form - Premium */}
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-xl shadow-gray-200/50 dark:shadow-none">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:bg-orange-900/30">
                    <Send className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Kirim Pesan
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ada pertanyaan? Hubungi kami.
                    </p>
                  </div>
                </div>

                {/* Success Message - Premium */}
                {isSuccess && (
                  <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-green-800 dark:text-green-300">
                          Pesan Anda telah terkirim!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          Terima kasih telah menghubungi kami. Kami akan segera
                          merespons pesan Anda melalui kontak yang Anda berikan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-300">
                          Gagal mengirim pesan
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nama */}
                  <div>
                    <label
                      htmlFor="nama"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Email / No HP */}
                  <div>
                    <label
                      htmlFor="kontak"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email atau No. HP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="kontak"
                      name="kontak"
                      value={formData.kontak}
                      onChange={handleChange}
                      required
                      placeholder="contoh@email.com atau 08xxxxxxxxxx"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Pesan */}
                  <div>
                    <label
                      htmlFor="pesan"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Pesan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="pesan"
                      name="pesan"
                      value={formData.pesan}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Kirim Pesan</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Dengan mengirim pesan, Anda menyetujui bahwa data akan
                    digunakan untuk keperluan komunikasi.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Map Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-slate-800/50">
        <Container>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Lokasi
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Lokasi Kantor Desa
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Kantor Desa Toundanouw berlokasi di pusat desa, mudah dijangkau
              dari jalan utama Kecamatan Touluaan.
            </p>
          </div>

          {/* Map Embed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm">
            {/* Map Area */}
            <div className="aspect-[16/9] md:aspect-[21/9]">
              {settings.embedMap ? (
                <iframe
                  src={settings.embedMap}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Kantor Desa Toundanouw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Kantor Desa Toundanouw
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
                    Kec. {settings.kecamatan}, Kab. {settings.kabupaten}, {settings.provinsi}
                  </p>
                </div>
              )}
            </div>

            {/* Directions Info */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                  <Navigation className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Petunjuk Arah
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>
                      • Dari Kota Amurang: ±15 menit melalui jalan utama ke arah
                      Tumpaan
                    </li>
                    <li>
                      • Dari Manado: ±1,5 jam melalui jalur Amurang-Tumpaan
                    </li>
                    <li>
                      • Kantor desa berada di sebelah kiri jalan, dekat dengan
                      Gereja GMIM Toundanouw
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Links */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900">
        <Container>
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Butuh Bantuan Lainnya?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kunjungi halaman lain untuk informasi lebih lengkap.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/surat"
              className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Download Surat
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Template surat administrasi
                </p>
              </div>
            </a>

            <a
              href="/berita"
              className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Berita Desa
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Informasi & pengumuman terbaru
                </p>
              </div>
            </a>

            <a
              href="/profil"
              className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Profil Desa
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Visi, misi & pemerintahan
                </p>
              </div>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
