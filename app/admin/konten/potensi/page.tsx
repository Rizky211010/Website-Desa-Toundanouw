"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, Mountain, Search, Loader2, Upload, X, Image } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminButton, Input, Textarea, Select } from "@/components/admin/admin-form";
import type { PotensiDesaRow } from "@/lib/supabase";

const kategoriOptions = [
  { value: "pertanian", label: "Pertanian" },
  { value: "perkebunan", label: "Perkebunan" },
  { value: "perikanan", label: "Perikanan" },
  { value: "umkm", label: "UMKM" },
  { value: "wisata", label: "Wisata" },
  { value: "budaya", label: "Budaya" },
  { value: "sda", label: "Sumber Daya Alam" },
];

const kategoriColors: Record<string, string> = {
  pertanian: "bg-green-100 text-green-700",
  perkebunan: "bg-emerald-100 text-emerald-700",
  perikanan: "bg-blue-100 text-blue-700",
  umkm: "bg-indigo-100 text-indigo-700",
  wisata: "bg-purple-100 text-purple-700",
  budaya: "bg-orange-100 text-orange-700",
  sda: "bg-cyan-100 text-cyan-700",
};

export default function PotensiPage() {
  const [potensi, setPotensi] = useState<PotensiDesaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PotensiDesaRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    deskripsi: "",
    lokasi: "",
    pemilik: "",
    kontak: "",
    nilai_ekonomi: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data from API
  const fetchPotensi = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: "100" });
      if (filterKategori) params.set("kategori", filterKategori);

      const res = await fetch(`/api/potensi?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data");

      const result = await res.json();
      setPotensi(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, [filterKategori]);

  useEffect(() => {
    fetchPotensi();
  }, [fetchPotensi]);

  // Filter by search query (client-side)
  const filteredPotensi = potensi.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus potensi ini?")) return;

    try {
      const res = await fetch(`/api/potensi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      await fetchPotensi();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  const openModal = (item?: PotensiDesaRow) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama: item.nama,
        kategori: item.kategori,
        deskripsi: item.deskripsi || "",
        lokasi: item.lokasi || "",
        pemilik: item.pemilik || "",
        kontak: item.kontak || "",
        nilai_ekonomi: item.nilai_ekonomi || "",
      });
      setPreviewUrl(item.foto_url || null);
    } else {
      setEditingItem(null);
      setFormData({
        nama: "",
        kategori: "",
        deskripsi: "",
        lokasi: "",
        pemilik: "",
        kontak: "",
        nilai_ekonomi: "",
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<{ path: string; url: string } | null> => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("bucket", "potensi");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || "Gagal upload gambar";
        alert(`Upload gagal: ${errorMsg}`);
        return null;
      }

      const result = await res.json();
      return { path: result.path, url: result.url };
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal upload gambar: " + (err instanceof Error ? err.message : "Unknown error"));
      return null;
    }
  };

  const handleSave = async () => {
    if (!formData.nama || !formData.kategori) {
      alert("Nama dan kategori harus diisi");
      return;
    }

    try {
      setIsSaving(true);

      // Prepare data with potential image upload
      let dataToSend = { ...formData, foto_path: null as string | null, foto_url: null as string | null };

      // Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(selectedFile);
        setIsUploading(false);

        if (uploadResult) {
          dataToSend.foto_path = uploadResult.path;
          dataToSend.foto_url = uploadResult.url;
        } else {
          // Continue without image - user already alerted in uploadImage
        }
      } else if (previewUrl && editingItem?.foto_url === previewUrl) {
        // Keep existing image
        dataToSend.foto_path = editingItem.foto_path;
        dataToSend.foto_url = editingItem.foto_url;
      }

      if (editingItem) {
        // Update
        const res = await fetch(`/api/potensi/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Gagal menyimpan");
        }
      } else {
        // Create
        const res = await fetch("/api/potensi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Gagal menyimpan");
        }
      }

      setIsModalOpen(false);
      await fetchPotensi();
    } catch (err) {
      console.error("Save error:", err);
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Potensi Desa"
        subtitle="Kelola data potensi dan sumber daya desa"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Potensi Desa" },
        ]}
        actions={
          <AdminButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openModal()}
          >
            Tambah Potensi
          </AdminButton>
        }
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari potensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        >
          <option value="">Semua Kategori</option>
          {kategoriOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="ml-3 text-gray-500">Memuat data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <AdminButton variant="outline" onClick={fetchPotensi}>
            Coba Lagi
          </AdminButton>
        </div>
      )}

      {/* Potensi Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredPotensi.map((item) => (
            <AdminCard key={item.id} hoverable className="group">
              {/* Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                {item.foto_url ? (
                  <img
                    src={item.foto_url}
                    alt={item.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Mountain className="w-12 h-12 text-gray-300" />
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${kategoriColors[item.kategori] || "bg-gray-100 text-gray-700"}`}>
                    {item.kategori}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.nama}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2">{item.deskripsi || "-"}</p>
                
                {item.lokasi && (
                  <p className="text-xs text-gray-400">📍 {item.lokasi}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openModal(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {!isLoading && !error && filteredPotensi.length === 0 && (
        <div className="text-center py-12">
          <Mountain className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada potensi yang ditemukan</p>
          <AdminButton variant="primary" className="mt-4" onClick={() => openModal()}>
            Tambah Potensi Pertama
          </AdminButton>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? "Edit Potensi" : "Tambah Potensi Baru"}
            </h3>
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Foto Potensi
                </label>
                
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Klik untuk upload foto</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP (maks 5MB)</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <Input
                label="Nama Potensi"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Kelapa Kopra"
                required
              />
              <Select
                label="Kategori"
                options={kategoriOptions}
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Pilih kategori"
                required
              />
              <Textarea
                label="Deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang potensi desa"
                rows={4}
              />
              <Input
                label="Lokasi"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Contoh: Jaga III, area perbukitan"
              />
              <Input
                label="Pemilik / Pengelola"
                value={formData.pemilik}
                onChange={(e) => setFormData({ ...formData, pemilik: e.target.value })}
                placeholder="Nama pemilik atau pengelola"
              />
              <Input
                label="Kontak"
                value={formData.kontak}
                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                placeholder="No HP atau email"
              />
              <Input
                label="Nilai Ekonomi"
                value={formData.nilai_ekonomi}
                onChange={(e) => setFormData({ ...formData, nilai_ekonomi: e.target.value })}
                placeholder="Contoh: Rp 50.000.000/tahun"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <AdminButton variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving || isUploading}>
                Batal
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSave} disabled={isSaving || isUploading}>
                {isSaving || isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUploading ? "Mengupload..." : "Menyimpan..."}
                  </>
                ) : editingItem ? (
                  "Simpan"
                ) : (
                  "Tambah"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
