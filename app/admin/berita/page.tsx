"use client";

import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Search, AlertTriangle, X, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getBerita, deleteBerita, BeritaListItem } from "@/lib/berita-api";

const beritaCategories = [
  "Pengumuman",
  "Kegiatan",
  "Pembangunan",
  "Sosial",
  "Kesehatan",
  "Pendidikan",
  "Lainnya",
];

// Delete Confirmation Dialog
function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Dialog */}
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
            <h3 className="text-lg font-semibold text-gray-900">
              Hapus Berita
            </h3>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 
              rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 
              hover:bg-red-700 rounded-lg transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBeritaPage() {
  const [beritaList, setBeritaList] = useState<BeritaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch berita from API
  const fetchBerita = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = statusFilter as 'draft' | 'published' | undefined;
      const response = await getBerita(status || undefined, categoryFilter || undefined, 100, 0);
      setBeritaList(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data berita');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchBerita();
  }, [fetchBerita]);

  // Filter news based on search
  const filteredNews = beritaList.filter((news) => {
    const matchesSearch =
      searchQuery === "" ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (news.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        setIsDeleting(true);
        await deleteBerita(deleteTarget.id);
        setBeritaList(prev => prev.filter(b => b.id !== deleteTarget.id));
        setDeleteTarget(null);
      } catch (err: any) {
        setError(err.message || 'Gagal menghapus berita');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget?.title || ""}
      />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Berita Desa</h1>
          <p className="mt-1 text-gray-500">
            Kelola berita dan pengumuman desa
          </p>
        </div>
        <Link
          href="/admin/berita/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 
            text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          + Tambah Berita Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Semua Kategori</option>
            {beritaCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          {/* Refresh */}
          <button
            onClick={fetchBerita}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 text-red-400 hover:text-red-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="ml-3 text-gray-600">Memuat data berita...</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Penulis
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredNews.map((news) => (
                <tr key={news.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {news.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {news.excerpt || '-'}
                        </p>
                      </div>
                      {news.status === 'draft' && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">Draft</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${
                          news.category === "Pengumuman Penting"
                            ? "bg-red-100 text-red-700"
                            : news.category === "Kegiatan"
                            ? "bg-blue-100 text-blue-700"
                            : news.category === "Pembangunan"
                            ? "bg-amber-100 text-amber-700"
                            : news.category === "Bansos"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {news.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(news.published_at || news.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{news.users?.full_name || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/berita/${news.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Lihat"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/berita/${news.id}/edit`}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget({ id: news.id, title: news.title })}
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
        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery || categoryFilter
                ? "Tidak ada berita yang sesuai filter"
                : "Belum ada berita"}
            </p>
            {!searchQuery && !categoryFilter && (
              <Link
                href="/admin/berita/new"
                className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                Tambah berita pertama
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {!isLoading && (
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          Menampilkan <span className="font-medium">{filteredNews.length}</span>{" "}
          dari <span className="font-medium">{beritaList.length}</span> berita
        </p>
      </div>
      )}
    </div>
  );
}
