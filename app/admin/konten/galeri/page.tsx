"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Image, Calendar, Search, Grid, List, Loader2, X, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminButton, Input, Select, Textarea } from "@/components/admin/admin-form";
import { useAdminAuth, PermissionGuard } from "@/lib/admin-auth";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  kategori: string;
  foto_url: string | null;
  foto_path: string | null;
  is_featured: boolean;
  urutan: number | null;
  uploaded_at: string;
  author_id?: string | null;
}

const kategoriOptions = [
  { value: "Kegiatan", label: "Kegiatan" },
  { value: "Pembangunan", label: "Pembangunan" },
  { value: "UMKM", label: "UMKM" },
  { value: "Budaya", label: "Budaya" },
  { value: "Lainnya", label: "Lainnya" },
];

export default function GaleriAdminPage() {
  const { user } = useAdminAuth();
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    judul: "",
    kategori: "",
    deskripsi: "",
    is_featured: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Check if user can edit galeri
  const canEdit = (galeriItem: GaleriItem): boolean => {
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'admin';
  };

  // Helper: Check if user can delete galeri
  const canDelete = (galeriItem: GaleriItem): boolean => {
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'admin';
  };

  // Helper: Check if user can toggle featured
  const canToggleFeatured = (): boolean => {
    if (!user) return false;
    // Only admin and super_admin can toggle featured
    return user.role === 'super_admin' || user.role === 'admin';
  };

  // Fetch galeri from API
  const fetchGaleri = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: "100" });
      if (filterKategori) params.set("kategori", filterKategori);

      const res = await fetch(`/api/galeri?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Gagal mengambil data galeri");

      const result = await res.json();
      setGaleri(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, [filterKategori]);

  useEffect(() => {
    fetchGaleri();
  }, [fetchGaleri]);

  // Client-side search filter
  const filteredGaleri = galeri.filter((item) => {
    const matchSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ judul: "", kategori: "", deskripsi: "", is_featured: false });
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !formData.judul) {
      alert("File dan judul harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("judul", formData.judul);
      uploadFormData.append("kategori", formData.kategori || "Lainnya");
      uploadFormData.append("deskripsi", formData.deskripsi);
      uploadFormData.append("is_featured", String(formData.is_featured));

      const res = await fetch("/api/galeri", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal upload foto");
      }

      await fetchGaleri();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete with permission check
  const handleDelete = async (item: GaleriItem) => {
    if (!canDelete(item)) {
      alert("Anda tidak memiliki izin untuk menghapus foto ini");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus foto ini?")) return;

    try {
      const res = await fetch(`/api/galeri/${item.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menghapus");
      }
      await fetchGaleri();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  // Toggle featured with permission check
  const handleToggleFeatured = async (item: GaleriItem) => {
    if (!canToggleFeatured()) {
      alert("Hanya Admin dan Super Admin yang dapat mengubah status unggulan");
      return;
    }

    try {
      const res = await fetch(`/api/galeri/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_featured: !item.is_featured }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal update");
      }
      await fetchGaleri();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal update");
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Galeri"
        subtitle="Kelola foto dan dokumentasi kegiatan desa"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Galeri" },
        ]}
        actions={
          <PermissionGuard permission="galeri.create">
            <AdminButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Upload Foto
            </AdminButton>
          </PermissionGuard>
        }
      />

      {/* Search, Filter & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari foto..."
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
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
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
          <AdminButton variant="outline" onClick={fetchGaleri}>
            Coba Lagi
          </AdminButton>
        </div>
      )}

      {/* Gallery Grid */}
      {!isLoading && !error && viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGaleri.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {item.foto_url ? (
                  <img
                    src={item.foto_url}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Image className="w-12 h-12 text-gray-300" />
                )}
              </div>

              {/* Featured badge */}
              {item.is_featured && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Unggulan
                </div>
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {canToggleFeatured() && (
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-2 ${item.is_featured ? "bg-yellow-500" : "bg-white/20 hover:bg-yellow-500"} text-white rounded-lg transition-colors`}
                    title={item.is_featured ? "Hapus dari unggulan" : "Jadikan unggulan"}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                )}
                {canDelete(item) && (
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-gray-900 text-sm truncate">{item.judul}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{item.kategori}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.uploaded_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && !error && viewMode === "list" && (
        <AdminCard padding="none">
          <div className="divide-y divide-gray-100">
            {filteredGaleri.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.foto_url ? (
                    <img
                      src={item.foto_url}
                      alt={item.judul}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{item.judul}</p>
                    {item.is_featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{item.deskripsi || "-"}</p>
                </div>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {item.kategori}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.uploaded_at).toLocaleDateString("id-ID")}
                </div>
                {canToggleFeatured() && (
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.is_featured
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                    title={item.is_featured ? "Hapus dari unggulan" : "Jadikan unggulan"}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                {canDelete(item) && (
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredGaleri.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchQuery || filterKategori
              ? "Tidak ada foto yang ditemukan"
              : "Belum ada foto di galeri"}
          </p>
          {!searchQuery && !filterKategori && (
            <PermissionGuard permission="galeri.create">
              <AdminButton variant="primary" onClick={() => setIsModalOpen(true)}>
                Upload Foto Pertama
              </AdminButton>
            </PermissionGuard>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Foto Baru
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Foto <span className="text-red-500">*</span>
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
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
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
                    <p className="text-sm text-gray-500">Klik untuk pilih foto</p>
                    <p className="text-xs text-gray-400">JPG, PNG (maks 5MB)</p>
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
                label="Judul Foto"
                placeholder="Contoh: Musyawarah Desa 2024"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                required
              />

              <Select
                label="Kategori"
                options={kategoriOptions}
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Pilih kategori"
              />

              <Textarea
                label="Deskripsi"
                placeholder="Deskripsi singkat tentang foto"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                rows={2}
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Tampilkan di beranda</span>
                  <p className="text-xs text-gray-500">Foto akan ditampilkan di galeri unggulan</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <AdminButton
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleUpload}
                disabled={isSubmitting || !selectedFile || !formData.judul}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  "Upload"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
