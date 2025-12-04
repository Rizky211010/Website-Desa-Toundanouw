"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Newspaper, Calendar, User, Search, Loader2, Check, X, Clock } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminButton } from "@/components/admin/admin-form";
import { useAdminAuth, PermissionGuard } from "@/lib/admin-auth";
import { canEditBerita, canDeleteBerita, getBeritaStatusInfo, type BeritaStatus } from "@/lib/roles";

interface BeritaItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  status: BeritaStatus;
  thumbnail_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  author_id: string | null;
  rejected_reason: string | null;
  users: { full_name: string } | null;
}

export default function BeritaAdminPage() {
  const { user, hasPermission, isSuperAdmin, isAdmin } = useAdminAuth();
  const [news, setNews] = useState<BeritaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch berita from API
  const fetchBerita = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: "50" });
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/berita?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal mengambil data");

      const result = await res.json();
      setNews(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchBerita();
  }, [fetchBerita]);

  // Client-side search filter
  const filteredNews = news.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const handleDelete = async (id: string, authorId: string | null) => {
    // Check permission
    if (!user || !canDeleteBerita(user.role, user.id, authorId)) {
      alert("Anda tidak memiliki izin untuk menghapus berita ini");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;

    try {
      const res = await fetch(`/api/berita/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menghapus");
      }
      await fetchBerita();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: BeritaStatus, authorId: string | null) => {
    // Check permission
    if (!user || !canEditBerita(user.role, user.id, authorId)) {
      alert("Anda tidak memiliki izin untuk mengubah status berita ini");
      return;
    }

    // Determine new status based on current status
    let newStatus: BeritaStatus;
    // Admin/Super Admin can toggle between published and draft
    newStatus = currentStatus === "published" ? "draft" : "published";
    
    try {
      const res = await fetch(`/api/berita/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal update status");
      }
      
      await fetchBerita();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  // Get status badge
  const getStatusBadge = (status: BeritaStatus) => {
    const info = getBeritaStatusInfo(status);
    const colorClasses: Record<string, string> = {
      gray: "bg-gray-100 text-gray-700",
      yellow: "bg-yellow-100 text-yellow-700",
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[info.color]}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Berita & Pengumuman"
        subtitle="Kelola berita dan pengumuman desa"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Berita & Pengumuman" },
        ]}
        actions={
          <Link href="/admin/konten/berita/tambah">
            <AdminButton variant="primary" icon={<Plus className="w-4 h-4" />}>
              Tambah Berita
            </AdminButton>
          </Link>
        }
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        >
          <option value="">Semua Status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draft</option>
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
          <AdminButton variant="outline" onClick={fetchBerita}>
            Coba Lagi
          </AdminButton>
        </div>
      )}

      {/* News Table */}
      {!isLoading && !error && (
        <AdminCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Penulis
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNews.map((item) => {
                  const canEdit = user ? canEditBerita(user.role, user.id, item.author_id) : false;
                  const canDelete = user ? canDeleteBerita(user.role, user.id, item.author_id) : false;
                  const canPublish = hasPermission('berita.publish');

                  return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Newspaper className="w-6 h-6 text-orange-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {item.category || "Umum"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {item.published_at
                          ? new Date(item.published_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        {item.users?.full_name || "Admin"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preview button - always available */}
                        <Link
                          href={`/berita/${item.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit button - based on permission */}
                        {canEdit && (
                          <Link
                            href={`/admin/konten/berita/${item.id}/edit`}
                            className="p-2 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}

                        {/* Publish/Unpublish toggle for Admin/Super Admin */}
                        {canPublish && (
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status, item.author_id)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.status === "published"
                                ? "hover:bg-yellow-50 text-gray-500 hover:text-yellow-600"
                                : "hover:bg-green-50 text-gray-500 hover:text-green-600"
                            }`}
                            title={item.status === "published" ? "Jadikan Draft" : "Publish"}
                          >
                            {item.status === "published" ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Delete button - based on permission */}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id, item.author_id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada berita yang ditemukan</p>
              <Link href="/admin/konten/berita/tambah">
                <AdminButton variant="primary" className="mt-4">
                  Tambah Berita Pertama
                </AdminButton>
              </Link>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  );
}
