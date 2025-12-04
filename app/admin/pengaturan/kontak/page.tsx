"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { AdminPageHeader, AdminCard } from "@/components/admin";

// Mapping antara form fields dan database keys
const fieldToKeyMap: Record<string, string> = {
  telepon: 'contact_phone',
  whatsapp: 'contact_whatsapp',
  email: 'contact_email',
  alamat: 'address_street',
  desa: 'address_village',
  kecamatan: 'address_district',
  kabupaten: 'address_regency',
  provinsi: 'address_province',
  kodePos: 'address_postal_code',
  hariKerja: 'hours_workdays',
  jamKerja: 'hours_operational',
  hariLibur: 'hours_holidays',
  facebook: 'social_facebook',
  instagram: 'social_instagram',
  youtube: 'social_youtube',
  tiktok: 'social_tiktok',
  embedMap: 'maps_embed_url',
  koordinatLat: 'maps_latitude',
  koordinatLng: 'maps_longitude',
};

// Default values
const defaultFormData = {
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

export default function KontakSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  // Fetch settings dari database
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memuat pengaturan');
      }

      // Map database keys ke form fields
      const dbSettings = result.data || {};
      const newFormData = { ...defaultFormData };

      Object.entries(fieldToKeyMap).forEach(([field, key]) => {
        if (dbSettings[key] !== undefined && dbSettings[key] !== '') {
          (newFormData as Record<string, string>)[field] = dbSettings[key];
        }
      });

      setFormData(newFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Map form fields ke database keys
      const settings: Record<string, string> = {};
      Object.entries(fieldToKeyMap).forEach(([field, key]) => {
        settings[key] = (formData as Record<string, string>)[field] || '';
      });

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan pengaturan');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultFormData);
    setSaved(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Pengaturan Kontak"
          breadcrumb={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Pengaturan" },
            { label: "Kontak" },
          ]}
        />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#F28A2E] animate-spin" />
          <span className="ml-3 text-gray-600">Memuat pengaturan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengaturan Kontak"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Pengaturan" },
          { label: "Kontak" },
        ]}
      />

      {/* Success Alert */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Pengaturan kontak berhasil disimpan!</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Kontak */}
        <AdminCard title="Informasi Kontak" subtitle="Nomor telepon dan email desa">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline-block mr-2 text-gray-400" />
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="(0431) xxx-xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline-block mr-2 text-green-500" />
                Nomor WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="08xxxxxxxxxx"
              />
              <p className="text-xs text-gray-500 mt-1">Gunakan format tanpa spasi atau tanda</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline-block mr-2 text-gray-400" />
                Email Resmi
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="desa@example.com"
              />
            </div>
          </div>
        </AdminCard>

        {/* Alamat */}
        <AdminCard title="Alamat Kantor Desa" subtitle="Lokasi kantor desa">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                <input
                  type="text"
                  name="desa"
                  value={formData.desa}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten</label>
                <input
                  type="text"
                  name="kabupaten"
                  value={formData.kabupaten}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
              <input
                type="text"
                name="kodePos"
                value={formData.kodePos}
                onChange={handleChange}
                className="w-full max-w-[120px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
              />
            </div>
          </div>
        </AdminCard>

        {/* Jam Layanan */}
        <AdminCard title="Jam Layanan" subtitle="Waktu operasional kantor desa">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline-block mr-2 text-gray-400" />
                Hari Kerja
              </label>
              <input
                type="text"
                name="hariKerja"
                value={formData.hariKerja}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="Senin - Jumat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                name="jamKerja"
                value={formData.jamKerja}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="08:00 - 16:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hari Libur
              </label>
              <input
                type="text"
                name="hariLibur"
                value={formData.hariLibur}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="Sabtu, Minggu, Hari Libur Nasional"
              />
            </div>
            <div className="p-3 bg-orange-50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#F28A2E] mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600">
                Informasi jam layanan akan ditampilkan di halaman Kontak pada website publik.
              </p>
            </div>
          </div>
        </AdminCard>

        {/* Sosial Media */}
        <AdminCard title="Media Sosial" subtitle="Link akun sosial media desa">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Facebook className="w-4 h-4 inline-block mr-2 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Instagram className="w-4 h-4 inline-block mr-2 text-pink-600" />
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4 inline-block mr-2 text-red-600" />
                YouTube
              </label>
              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4 inline-block mr-2 text-gray-800" />
                TikTok
              </label>
              <input
                type="url"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </AdminCard>

        {/* Google Maps */}
        <AdminCard 
          title="Lokasi Google Maps" 
          subtitle="Embed peta lokasi kantor desa"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline-block mr-2 text-red-500" />
                URL Embed Google Maps
              </label>
              <input
                type="url"
                name="embedMap"
                value={formData.embedMap}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                placeholder="https://maps.google.com/maps?q=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Dapatkan dari Google Maps {`>`} Share {`>`} Embed a map
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  name="koordinatLat"
                  value={formData.koordinatLat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  name="koordinatLng"
                  value={formData.koordinatLng}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                />
              </div>
            </div>
            {/* Preview Map */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {formData.embedMap ? (
                <iframe
                  src={formData.embedMap}
                  width="100%"
                  height="256"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Kantor Desa"
                />
              ) : (
                <div className="bg-gray-100 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Preview Peta</p>
                    <p className="text-xs text-gray-400">Masukkan URL embed Google Maps</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button 
          onClick={handleReset}
          disabled={saving}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#F28A2E] text-white rounded-lg text-sm font-medium hover:bg-[#e07a1e] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
