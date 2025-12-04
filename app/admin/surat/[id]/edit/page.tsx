"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, X, Loader2, AlertTriangle } from "lucide-react";
import { suratCategories, type SuratCategory } from "@/lib/surat-templates";
import { getSuratTemplate, updateSuratTemplate, deleteSuratTemplate, type SuratTemplate } from "@/lib/surat-api";
import { useState, use, useEffect } from "react";

// ============================================
// Delete Dialog Component
// ============================================

interface DeleteDialogProps {
  isOpen: boolean;
  suratName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteDialog({
  isOpen,
  suratName,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Hapus Template Surat
            </h3>
            <p className="text-sm text-gray-500">
              Tindakan ini tidak dapat dibatalkan
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus template &quot;
          <span className="font-medium text-gray-900">{suratName}</span>&quot;?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg 
              text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm 
              font-medium hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSuratPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suratName, setSuratName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: "" as SuratCategory | "",
    file_format: ".docx",
    is_active: true,
  });

  // Fetch surat data
  useEffect(() => {
    const fetchSurat = async () => {
      try {
        setIsLoading(true);
        const { data } = await getSuratTemplate(id);
        setSuratName(data.name);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          content: data.content || "",
          category: (data.category as SuratCategory) || "",
          file_format: data.file_format || ".docx",
          is_active: data.is_active,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat template surat");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurat();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      setError("Silakan pilih kategori");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateSuratTemplate(id, {
        name: formData.name,
        description: formData.description,
        content: formData.content,
        category: formData.category,
        file_format: formData.file_format,
        is_active: formData.is_active,
      });
      router.push("/admin/surat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update template");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSuratTemplate(id);
      router.push("/admin/surat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus template");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-2 text-gray-500">Memuat template surat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={showDeleteDialog}
        suratName={suratName}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/surat"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Template Surat
            </h1>
            <p className="mt-1 text-gray-500">
              Perbarui informasi template surat
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-red-600 
            border border-red-200 rounded-lg text-sm font-medium 
            hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Hapus
        </button>
      </div>

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              placeholder="Masukkan isi template surat"
              rows={10}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* File Format & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
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
                disabled={isSubmitting}
              >
                <option value=".docx">.docx (Word)</option>
                <option value=".pdf">.pdf (PDF)</option>
                <option value=".doc">.doc (Word 97-2003)</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="is_active"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="is_active"
                value={formData.is_active ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.value === "active" })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isSubmitting}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
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
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 
              text-white rounded-lg text-sm font-medium hover:bg-emerald-700 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Template
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
