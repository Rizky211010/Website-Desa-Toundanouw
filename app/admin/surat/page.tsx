"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X, FileText, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { suratCategories, type SuratCategory } from "@/lib/surat-templates";
import { getSuratTemplates, deleteSuratTemplate, type SuratTemplate } from "@/lib/surat-api";

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

export default function AdminSuratPage() {
  // Data state
  const [suratList, setSuratList] = useState<SuratTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SuratCategory | "">("");

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    suratId: string;
    suratName: string;
    isDeleting: boolean;
  }>({ isOpen: false, suratId: "", suratName: "", isDeleting: false });

  // Fetch surat templates
  const fetchSurat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getSuratTemplates(
        categoryFilter || undefined,
        100,
        0
      );
      setSuratList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat template surat");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchSurat();
  }, [fetchSurat]);

  // Filter surat based on search (client-side)
  const filteredSurat = suratList.filter((surat) => {
    const matchesSearch =
      searchQuery === "" ||
      surat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (surat.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handle delete
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, suratId: id, suratName: name, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
    try {
      await deleteSuratTemplate(deleteDialog.suratId);
      setDeleteDialog({ isOpen: false, suratId: "", suratName: "", isDeleting: false });
      fetchSurat();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus template");
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, suratId: "", suratName: "", isDeleting: false });
  };

  // Truncate URL for display
  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (!url) return "-";
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  // Loading state
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
        isOpen={deleteDialog.isOpen}
        suratName={deleteDialog.suratName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kelola Template Surat
          </h1>
          <p className="mt-1 text-gray-500">
            Kelola template surat untuk layanan publik
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSurat}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 
              border border-gray-300 rounded-lg text-sm font-medium text-gray-700
              hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href="/admin/surat/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 
              text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Template Surat
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari template surat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as SuratCategory | "")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Semua Kategori</option>
            {suratCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Surat
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  File URL
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSurat.map((surat) => (
                <tr key={surat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {surat.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                          {surat.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${
                          surat.category === "Keterangan Penduduk"
                            ? "bg-blue-100 text-blue-700"
                            : surat.category === "Keterangan Usaha"
                            ? "bg-amber-100 text-amber-700"
                            : surat.category === "Keterangan Pendidikan"
                            ? "bg-purple-100 text-purple-700"
                            : surat.category === "Pengantar RT/RW"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {surat.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-700">
                        {surat.file_format}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs text-gray-500 font-mono"
                      title={surat.file_url || "-"}
                    >
                      {truncateUrl(surat.file_url || "")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/surat/${surat.id}/edit`}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(surat.id, surat.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredSurat.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">
              {searchQuery || categoryFilter
                ? "Tidak ada template yang cocok dengan filter"
                : "Belum ada template surat"}
            </p>
            {!searchQuery && !categoryFilter && (
              <Link
                href="/admin/surat/new"
                className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                Tambah template pertama
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          Menampilkan{" "}
          <span className="font-medium">{filteredSurat.length}</span> dari{" "}
          <span className="font-medium">{suratList.length}</span> template surat
        </p>
      </div>
    </div>
  );
}
