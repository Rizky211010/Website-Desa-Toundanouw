"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  ToggleLeft,
  ToggleRight,
  Clock,
  Calendar,
  FileDown,
  X,
  Upload,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AdminPageHeader, AdminCard } from "@/components/admin";

// Interface untuk surat template
interface SuratTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  category: string | null;
  file_format: string;
  file_url: string | null;
  file_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  download_count?: number;
}

// Interface untuk download log
interface DownloadLog {
  id: string;
  surat_id: string;
  surat_name: string;
  ip_address: string | null;
  user_agent: string | null;
  downloaded_at: string;
}

// Form data untuk surat baru/edit
interface SuratFormData {
  name: string;
  description: string;
  content: string;
  category: string;
  file_format: string;
  is_active: boolean;
}

const initialFormData: SuratFormData = {
  name: "",
  description: "",
  content: "",
  category: "umum",
  file_format: "pdf",
  is_active: true,
};

const categoryOptions = [
  { value: "umum", label: "Umum" },
  { value: "kependudukan", label: "Kependudukan" },
  { value: "usaha", label: "Usaha" },
  { value: "tanah", label: "Pertanahan" },
  { value: "lainnya", label: "Lainnya" },
];

export default function ESuratManagementPage() {
  // State untuk data
  const [suratList, setSuratList] = useState<SuratTemplate[]>([]);
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  
  // State untuk UI
  const [activeTab, setActiveTab] = useState<"jenis" | "log">("jenis");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [logFilter, setLogFilter] = useState("");
  
  // State untuk modal
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<SuratTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<SuratFormData>(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State untuk loading & error
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [totalLogs, setTotalLogs] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch surat templates
  const fetchSurat = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gunakan all=true untuk admin agar bisa lihat semua termasuk yang inactive
      const response = await fetch(`/api/surat?limit=100&all=true`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Gagal memuat data surat");
      }
      
      setSuratList(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch download logs
  const fetchDownloadLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      
      const offset = (logsPage - 1) * itemsPerPage;
      const response = await fetch(`/api/surat/downloads?limit=${itemsPerPage}&offset=${offset}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Gagal memuat log download");
      }
      
      setDownloadLogs(result.data || []);
      setTotalLogs(result.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [logsPage]);

  // Initial fetch
  useEffect(() => {
    fetchSurat();
  }, [fetchSurat]);

  // Fetch logs when tab changes to log
  useEffect(() => {
    if (activeTab === "log") {
      fetchDownloadLogs();
    }
  }, [activeTab, fetchDownloadLogs]);

  // Filter surat
  const filteredSurat = suratList.filter((surat) => {
    const matchSearch =
      surat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surat.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && surat.is_active) ||
      (statusFilter === "inactive" && !surat.is_active);
    return matchSearch && matchStatus;
  });

  // Filter logs
  const filteredLogs = downloadLogs.filter((log) =>
    log.surat_name.toLowerCase().includes(logFilter.toLowerCase()) ||
    (log.ip_address && log.ip_address.toLowerCase().includes(logFilter.toLowerCase()))
  );

  // Toggle status surat
  const toggleStatus = async (surat: SuratTemplate) => {
    try {
      const response = await fetch(`/api/surat/${surat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !surat.is_active }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal mengubah status");
      }

      // Update local state
      setSuratList(prev =>
        prev.map(s => s.id === surat.id ? { ...s, is_active: !s.is_active } : s)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  };

  // Lihat detail
  const viewDetail = (surat: SuratTemplate) => {
    setSelectedSurat(surat);
    setShowDetailModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditMode(false);
    setFormData(initialFormData);
    setSelectedFile(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (surat: SuratTemplate) => {
    setEditMode(true);
    setSelectedSurat(surat);
    setFormData({
      name: surat.name,
      description: surat.description || "",
      content: surat.content || "",
      category: surat.category || "umum",
      file_format: surat.file_format || "pdf",
      is_active: surat.is_active,
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Nama surat harus diisi");
      return;
    }

    try {
      setSubmitting(true);

      if (editMode && selectedSurat) {
        // Update existing
        const response = await fetch(`/api/surat/${selectedSurat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Gagal mengupdate surat");
        }

        // Upload file if selected
        if (selectedFile) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", selectedFile);
          
          await fetch(`/api/surat/${selectedSurat.id}/upload-file`, {
            method: "POST",
            body: uploadFormData,
          });
        }
      } else {
        // Create new
        const response = await fetch("/api/surat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            content: formData.description || formData.name,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Gagal membuat surat");
        }

        const result = await response.json();

        // Upload file if selected
        if (selectedFile && result.data?.id) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", selectedFile);
          
          await fetch(`/api/surat/${result.data.id}/upload-file`, {
            method: "POST",
            body: uploadFormData,
          });
        }
      }

      setShowModal(false);
      fetchSurat();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (surat: SuratTemplate) => {
    if (!confirm(`Hapus surat "${surat.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/surat/${surat.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal menghapus surat");
      }

      fetchSurat();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus surat");
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];
      
      if (!validTypes.includes(file.type)) {
        alert("File harus berupa PDF, DOC, atau DOCX");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }

      setSelectedFile(file);
      
      if (file.name.endsWith(".pdf")) {
        setFormData(prev => ({ ...prev, file_format: "pdf" }));
      } else {
        setFormData(prev => ({ ...prev, file_format: "docx" }));
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats
  const activeSurat = suratList.filter((s) => s.is_active).length;
  const totalLogPages = Math.ceil(totalLogs / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F28A2E]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchSurat}
          className="px-4 py-2 bg-[#F28A2E] text-white rounded-lg hover:bg-[#e07a1e] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Layanan E-Surat"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Layanan E-Surat" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-[#F28A2E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{suratList.length}</p>
              <p className="text-sm text-gray-500">Total Jenis Surat</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ToggleRight className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeSurat}</p>
              <p className="text-sm text-gray-500">Surat Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - REMOVED */}
      {/* <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("jenis")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "jenis"
              ? "bg-white text-[#F28A2E] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Jenis Surat
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "log"
              ? "bg-white text-[#F28A2E] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Clock className="w-4 h-4 inline-block mr-2" />
          Log Unduhan
        </button>
      </div> */}

      {/* Jenis Surat Tab */}
      {activeTab === "jenis" && (
        <AdminCard>
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari surat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E] w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#F28A2E] text-white rounded-lg hover:bg-[#e07a1e] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Tambah Jenis Surat
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Nama Surat
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Format
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSurat.map((surat) => (
                  <tr
                    key={surat.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <FileText className="w-5 h-5 text-[#F28A2E]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{surat.name}</p>
                          <p className="text-xs text-gray-500">{surat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {surat.category || "Umum"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <FileDown className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 uppercase">{surat.file_format}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleStatus(surat)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          surat.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {surat.is_active ? (
                          <>
                            <ToggleRight className="w-3 h-3" /> Aktif
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3" /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => viewDetail(surat)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(surat)}
                          className="p-2 text-gray-400 hover:text-[#F28A2E] hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(surat)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSurat.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada data surat ditemukan</p>
            </div>
          )}
        </AdminCard>
      )}

      {/* Log Unduhan Tab */}
      {activeTab === "log" && (
        <AdminCard>
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama surat atau IP..."
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E] w-full sm:w-80"
              />
            </div>
            <button
              onClick={fetchDownloadLogs}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Log Table */}
          {loadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#F28A2E]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Jenis Surat
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Tanggal & Waktu
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        IP Address
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        User Agent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                              <FileText className="w-4 h-4 text-[#F28A2E]" />
                            </div>
                            <span className="font-medium text-gray-900">{log.surat_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(log.downloaded_at)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500 font-mono">
                            {log.ip_address || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-gray-400 truncate max-w-[200px] block">
                            {log.user_agent ? log.user_agent.substring(0, 50) + "..." : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada log unduhan</p>
                </div>
              )}

              {/* Pagination */}
              {totalLogs > itemsPerPage && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Menampilkan {filteredLogs.length} dari {totalLogs} log
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogsPage(Math.max(1, logsPage - 1))}
                      disabled={logsPage === 1}
                      className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      {logsPage} / {totalLogPages}
                    </span>
                    <button
                      onClick={() => setLogsPage(Math.min(totalLogPages, logsPage + 1))}
                      disabled={logsPage === totalLogPages}
                      className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </AdminCard>
      )}

      {/* Modal Tambah/Edit Surat */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editMode ? "Edit Jenis Surat" : "Tambah Jenis Surat Baru"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Surat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="contoh: Surat Keterangan Domisili"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi / Persyaratan
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tuliskan deskripsi atau persyaratan surat..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Surat (PDF/DOC/DOCX)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#F28A2E] transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {selectedFile ? (
                        <p className="text-sm text-[#F28A2E] font-medium">{selectedFile.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Klik untuk upload atau drag & drop</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX - max 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  {editMode && selectedSurat?.file_url && !selectedFile && (
                    <p className="text-xs text-gray-500 mt-2">
                      File saat ini: {selectedSurat.file_path || "Ada file"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#F28A2E] border-gray-300 rounded focus:ring-[#F28A2E]"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Aktifkan surat ini
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#F28A2E] text-white rounded-lg text-sm font-medium hover:bg-[#e07a1e] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editMode ? "Simpan Perubahan" : "Simpan Surat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Surat */}
      {showDetailModal && selectedSurat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail Jenis Surat
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FileText className="w-8 h-8 text-[#F28A2E]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedSurat.name}</h4>
                  <p className="text-sm text-gray-500">Slug: {selectedSurat.slug}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Kategori</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedSurat.category || "Umum"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Format</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">
                    {selectedSurat.file_format}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Dibuat</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedSurat.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedSurat.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedSurat.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
              {selectedSurat.description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Deskripsi</p>
                  <p className="text-sm text-gray-700">{selectedSurat.description}</p>
                </div>
              )}
              {selectedSurat.file_url && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Template</p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileDown className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {selectedSurat.file_path || "template.pdf"}
                    </span>
                    <a
                      href={selectedSurat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs font-medium text-[#F28A2E] hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedSurat);
                }}
                className="px-4 py-2 bg-[#F28A2E] text-white rounded-lg text-sm font-medium hover:bg-[#e07a1e] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
