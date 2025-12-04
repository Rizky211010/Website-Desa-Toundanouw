"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, FileText, Loader2, AlertTriangle } from "lucide-react";
import { suratCategories, type SuratCategory } from "@/lib/surat-templates";
import { createSuratTemplate } from "@/lib/surat-api";
import { useState } from "react";

export default function NewSuratPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: "" as SuratCategory | "",
    file_format: ".docx",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      setError("Silakan pilih kategori");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createSuratTemplate(
        formData.name,
        formData.content,
        formData.description,
        formData.category,
        formData.file_format
      );
      router.push("/admin/surat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat template surat");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/surat"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tambah Template Surat Baru
          </h1>
          <p className="mt-1 text-gray-500">
            Tambahkan template surat baru untuk layanan publik
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Surat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Surat Keterangan Domisili"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as SuratCategory | "",
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
              disabled={isLoading}
            >
              <option value="">Pilih kategori</option>
              {suratCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Jelaskan kegunaan surat ini untuk warga"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              required
              disabled={isLoading}
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Konten Template <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Masukkan isi template surat (bisa menggunakan placeholder seperti {{nama}}, {{alamat}}, dll)"
              rows={10}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Gunakan placeholder seperti {"{{nama}}"}, {"{{alamat}}"}, {"{{tanggal}}"} untuk data yang bisa diisi warga
            </p>
          </div>

          {/* File Format */}
          <div className="max-w-xs">
            <label
              htmlFor="file_format"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Format File
            </label>
            <select
              id="file_format"
              value={formData.file_format}
              onChange={(e) =>
                setFormData({ ...formData, file_format: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={isLoading}
            >
              <option value=".docx">.docx (Word)</option>
              <option value=".pdf">.pdf (PDF)</option>
              <option value=".doc">.doc (Word 97-2003)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/surat"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 
              border border-gray-300 rounded-lg text-sm font-medium 
              hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 
              text-white rounded-lg text-sm font-medium hover:bg-emerald-700 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Template
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
