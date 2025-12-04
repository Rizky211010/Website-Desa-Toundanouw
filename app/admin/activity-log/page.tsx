"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminButton } from "@/components/admin/admin-form";
import { useAdminAuth, RoleGuard } from "@/lib/admin-auth";
import { getActivityActionInfo, getEntityTypeInfo, type ActivityAction, type EntityType } from "@/lib/activity-log";
import { getRoleDisplayName, type UserRole } from "@/lib/roles";

interface ActivityLogItem {
  id: string;
  user_id: string;
  action: ActivityAction;
  entity_type: EntityType | null;
  entity_id: string | null;
  entity_title: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  users: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  } | null;
}

export default function ActivityLogPage() {
  const { user, isSuperAdmin } = useAdminAuth();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
  });

  // Fetch activity logs
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("limit", pagination.limit.toString());
      params.set("offset", pagination.offset.toString());
      if (filterAction) params.set("action", filterAction);
      if (filterEntityType) params.set("entity_type", filterEntityType);

      const res = await fetch(`/api/activity-log?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Anda tidak memiliki akses ke halaman ini");
        }
        throw new Error("Gagal mengambil data");
      }

      const result = await res.json();
      setLogs(result.data || []);
      setPagination((prev) => ({ ...prev, total: result.pagination?.total || 0 }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, pagination.offset, filterAction, filterEntityType]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs();
    }
  }, [fetchLogs, isSuperAdmin]);

  // Client-side search filter
  const filteredLogs = logs.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.entity_title?.toLowerCase().includes(query) ||
      item.users?.full_name.toLowerCase().includes(query) ||
      item.users?.email.toLowerCase().includes(query) ||
      item.action.toLowerCase().includes(query)
    );
  });

  // Pagination handlers
  const handlePrevPage = () => {
    setPagination((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get action badge
  const getActionBadge = (action: ActivityAction) => {
    const info = getActivityActionInfo(action);
    const colorClasses: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700",
      gray: "bg-gray-100 text-gray-700",
      green: "bg-green-100 text-green-700",
      yellow: "bg-yellow-100 text-yellow-700",
      red: "bg-red-100 text-red-700",
      orange: "bg-orange-100 text-orange-700",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[info.color]}`}>
        {info.icon} {info.label}
      </span>
    );
  };

  // Get entity type badge
  const getEntityBadge = (entityType: EntityType | null) => {
    if (!entityType) return null;
    const info = getEntityTypeInfo(entityType);
    const colorClasses: Record<string, string> = {
      orange: "bg-orange-50 text-orange-700",
      purple: "bg-purple-50 text-purple-700",
      blue: "bg-blue-50 text-blue-700",
      green: "bg-green-50 text-green-700",
      yellow: "bg-yellow-50 text-yellow-700",
      indigo: "bg-indigo-50 text-indigo-700",
      red: "bg-red-50 text-red-700",
      gray: "bg-gray-50 text-gray-700",
      cyan: "bg-cyan-50 text-cyan-700",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${colorClasses[info.color]}`}>
        {info.label}
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role: UserRole) => {
    const colorClasses: Record<UserRole, string> = {
      super_admin: "bg-red-100 text-red-700",
      admin: "bg-purple-100 text-purple-700",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${colorClasses[role]}`}>
        {getRoleDisplayName(role)}
      </span>
    );
  };

  // Access denied for non-super admin
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <AdminPageHeader
          title="Activity Log"
          subtitle="Log aktivitas semua user"
        />
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">Akses Ditolak</p>
          <p className="text-red-500 text-sm mt-2">
            Hanya Super Admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Activity Log"
        subtitle="Pantau semua aktivitas user di sistem"
        breadcrumb={[{ label: "Activity Log" }]}
        actions={
          <AdminButton variant="outline" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </AdminButton>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => {
            setFilterAction(e.target.value);
            setPagination((prev) => ({ ...prev, offset: 0 }));
          }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        >
          <option value="">Semua Aksi</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="publish">Publish</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
        </select>
        <select
          value={filterEntityType}
          onChange={(e) => {
            setFilterEntityType(e.target.value);
            setPagination((prev) => ({ ...prev, offset: 0 }));
          }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        >
          <option value="">Semua Entitas</option>
          <option value="berita">Berita</option>
          <option value="galeri">Galeri</option>
          <option value="surat">Surat</option>
          <option value="organisasi">Organisasi</option>
          <option value="user">User</option>
          <option value="setting">Pengaturan</option>
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
          <AdminButton variant="outline" onClick={fetchLogs}>
            Coba Lagi
          </AdminButton>
        </div>
      )}

      {/* Activity Log Table */}
      {!isLoading && !error && (
        <AdminCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Entitas
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                      Tidak ada data aktivitas
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(item.created_at)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {item.users?.full_name || "Unknown"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-500">{item.users?.email}</p>
                              {item.users?.role && getRoleBadge(item.users.role)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{getActionBadge(item.action)}</td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {getEntityBadge(item.entity_type)}
                          {item.entity_title && (
                            <p className="text-sm text-gray-700 truncate max-w-xs">
                              {item.entity_title}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {item.details && (
                          <pre className="text-xs text-gray-500 bg-gray-50 rounded p-2 max-w-xs overflow-auto">
                            {JSON.stringify(item.details, null, 2)}
                          </pre>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {item.ip_address || "-"}
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Menampilkan {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} dari {pagination.total} data
              </p>
              <div className="flex items-center gap-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </AdminButton>
                <span className="text-sm text-gray-600 px-2">
                  {currentPage} / {totalPages}
                </span>
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </AdminButton>
              </div>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  );
}
