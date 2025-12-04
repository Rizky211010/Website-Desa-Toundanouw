"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image, X, Loader2, AlertTriangle, Eye } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  FormSection,
  Input,
  Textarea,
  Select,
  AdminButton,
} from "@/components/admin/admin-form";

const kategoriOptions = [
  { value: "Pengumuman Penting", label: "Pengumuman Penting" },
  { value: "Kegiatan", label: "Kegiatan" },
  { value: "Pembangunan", label: "Pembangunan" },
  { value: "Bansos", label: "Bantuan Sosial" },
  { value: "Umum", label: "Umum" },
];

// Delete Confirmation Dialog
function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Hapus Berita</h3>
            <p className="mt-2 text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus berita{" "}
              <span className="font-medium">&quot;{title}&quot;</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBeritaPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    status: "draft" as "draft" | "published",
    published_at: "",
    thumbnail_url: null as string | null,
    thumbnail_path: null as string | null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch berita data
  useEffect(() => {
    const fetchBerita = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/berita/${id}`, { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Berita tidak ditemukan");
          }
          throw new Error("Gagal memuat data berita");
        }
        const data = await res.json();
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          category: data.category || "",
          status: data.status || "draft",
          published_at: data.published_at ? new Date(data.published_at).toISOString().split("T")[0] : "",
          thumbnail_url: data.thumbnail_url,
          thumbnail_path: data.thumbnail_path,
        });
        if (data.thumbnail_url) {
          setPreviewUrl(data.thumbnail_url);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat berita");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBerita();
  }, [id]);

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

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(formData.thumbnail_url);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<{ path: string; url: string } | null> => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("bucket", "berita");

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal upload gambar");
      }

      const result = await res.json();
      return { path: result.path, url: result.url };
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!formData.title || !formData.content) {
      alert("Judul dan konten harus diisi");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let thumbnailData = {
        thumbnail_path: formData.thumbnail_path,
        thumbnail_url: formData.thumbnail_url,
      };

      // Upload new thumbnail if selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(selectedFile);
        setIsUploading(false);

        if (uploadResult) {
          thumbnailData.thumbnail_path = uploadResult.path;
          thumbnailData.thumbnail_url = uploadResult.url;
        }
      }

      const newStatus = publishNow ? "published" : formData.status;
      const dataToSend = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        status: newStatus,
        published_at: publishNow ? new Date().toISOString() : (formData.published_at || null),
        ...thumbnailData,
      };

      const res = await fetch(`/api/berita/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyimpan berita");
      }

      router.push("/admin/konten/berita");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/berita/${id}`, { method: "DELETE", credentials: "include" });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menghapus berita");
      }

      router.push("/admin/konten/berita");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
          <p className="mt-2 text-gray-500">Memuat berita...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">{error}</p>
          <AdminButton variant="outline" onClick={() => router.push("/admin/konten/berita")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={formData.title}
        isLoading={isDeleting}
      />

      <AdminPageHeader
        title="Edit Berita"
        subtitle="Perbarui informasi berita"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Berita & Pengumuman", href: "/admin/konten/berita" },
          { label: "Edit" },
        ]}
        actions={
          <AdminButton
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Hapus
          </AdminButton>
        }
      />

      {/* Error Alert */}
      {error && formData.title && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6">
          <FormSection
            title="Informasi Berita"
            description="Detail utama berita"
          >
            <Input
              label="Judul Berita"
              placeholder="Masukkan judul berita yang menarik"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Kategori"
                options={kategoriOptions}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Pilih kategori"
                required
              />
              <Input
                label="Tanggal Publish"
                type="date"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
              />
            </div>
          </FormSection>

          <FormSection
            title="Konten Berita"
            description="Tulis konten berita lengkap"
          >
            <Textarea
              label="Ringkasan"
              placeholder="Tulis ringkasan singkat berita (akan ditampilkan di halaman daftar berita)"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Konten Lengkap"
              placeholder="Tulis konten berita secara lengkap..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              helperText="Tulis konten berita dengan lengkap"
              required
            />
          </FormSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <FormSection title="Thumbnail">
            <div className="space-y-3">
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
                  <p className="text-sm text-gray-500">Klik untuk upload</p>
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
              {selectedFile && (
                <p className="text-xs text-green-600">
                  File baru dipilih: {selectedFile.name}
                </p>
              )}
            </div>
          </FormSection>

          <FormSection title="Status Saat Ini">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  formData.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {formData.status === "published" ? "Terbit" : "Draft"}
                </span>
              </div>
            </div>
          </FormSection>

          <FormSection title="Aksi">
            <div className="space-y-3">
              <AdminButton
                variant="outline"
                className="w-full"
                icon={<Save className="w-4 h-4" />}
                disabled={isSaving}
                onClick={() => handleSubmit(false)}
              >
                {isSaving && !isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </AdminButton>
              {formData.status === "draft" && (
                <AdminButton
                  variant="primary"
                  className="w-full"
                  icon={<Eye className="w-4 h-4" />}
                  disabled={isSaving}
                  onClick={() => handleSubmit(true)}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploading ? "Mengupload..." : "Menyimpan..."}
                    </>
                  ) : (
                    "Publikasikan Sekarang"
                  )}
                </AdminButton>
              )}
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}
