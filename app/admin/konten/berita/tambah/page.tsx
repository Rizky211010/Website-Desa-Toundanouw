"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Image, X, Loader2 } from "lucide-react";
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

export default function TambahBeritaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    published_at: new Date().toISOString().split("T")[0],
    status: "draft" as "draft" | "published",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    setPreviewUrl(null);
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
      setIsLoading(true);

      let thumbnailData = { thumbnail_path: null as string | null, thumbnail_url: null as string | null };

      // Upload thumbnail if selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(selectedFile);
        setIsUploading(false);

        if (uploadResult) {
          thumbnailData.thumbnail_path = uploadResult.path;
          thumbnailData.thumbnail_url = uploadResult.url;
        }
      }

      const dataToSend = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category: formData.category || undefined,
        status: publishNow ? "published" : "draft",
        ...thumbnailData,
      };

      const res = await fetch("/api/berita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });
      
      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Gagal menyimpan berita");
      }

      router.push("/admin/konten/berita");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Tambah Berita Baru"
        subtitle="Buat dan publikasikan berita atau pengumuman"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Berita & Pengumuman", href: "/admin/konten/berita" },
          { label: "Tambah Berita" },
        ]}
        actions={
          <AdminButton
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Kembali
          </AdminButton>
        }
      />

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
            </div>
          </FormSection>

          <FormSection title="Publikasi">
            <div className="space-y-3">
              <button
                type="button"
                className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isLoading}
                onClick={() => handleSubmit(false)}
              >
                {isLoading && !isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Draft
                  </>
                )}
              </button>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isLoading}
                onClick={() => handleSubmit(true)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isUploading ? "Mengupload..." : "Menyimpan..."}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Publikasikan Sekarang
                  </>
                )}
              </button>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}
