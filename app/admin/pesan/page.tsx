"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  Reply,
  Archive,
  Loader2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  MailOpen,
} from "lucide-react";

interface ContactMessage {
  id: string;
  nama: string;
  kontak: string;
  pesan: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  ip_address?: string;
  user_agent?: string;
  read_at?: string;
  replied_at?: string;
  reply_message?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPesanPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
  });

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("limit", pagination.limit.toString());
      params.append("offset", pagination.offset.toString());

      const response = await fetch(`/api/messages?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengambil pesan");
      }

      setMessages(result.data || []);
      setUnreadCount(result.unreadCount || 0);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination?.total || 0,
      }));
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.limit, pagination.offset]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Update message status
  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal memperbarui status");
      }

      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error("Error updating message:", err);
      alert(err instanceof Error ? err.message : "Gagal memperbarui status");
    }
  };

  // Delete message
  const deleteMessage = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal menghapus pesan");
      }

      // Close detail if deleting selected message
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
        setIsDetailOpen(false);
      }

      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error("Error deleting message:", err);
      alert(err instanceof Error ? err.message : "Gagal menghapus pesan");
    }
  };

  // View message detail
  const viewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);

    // Mark as read if unread
    if (message.status === "unread") {
      await updateMessageStatus(message.id, "read");
    }
  };

  // Filter messages by search query
  const filteredMessages = messages.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.nama.toLowerCase().includes(query) ||
      m.kontak.toLowerCase().includes(query) ||
      m.pesan.toLowerCase().includes(query)
    );
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
            <Mail className="w-3 h-3" />
            Belum Dibaca
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
            <MailOpen className="w-3 h-3" />
            Sudah Dibaca
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Dibalas
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            <Archive className="w-3 h-3" />
            Diarsipkan
          </span>
        );
      default:
        return null;
    }
  };

  // Pagination
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  const goToPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesan Masuk</h1>
          <p className="text-gray-500 mt-1">
            Kelola pesan dari pengunjung website
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {unreadCount} belum dibaca
            </span>
          )}
          <button
            onClick={fetchMessages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, kontak, atau pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="unread">Belum Dibaca</option>
              <option value="read">Sudah Dibaca</option>
              <option value="replied">Dibalas</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="mt-3 text-gray-500">Memuat pesan...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="mt-3 text-red-600">{error}</p>
            <button
              onClick={fetchMessages}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <MessageSquare className="w-12 h-12 text-gray-300" />
            <p className="mt-3 text-gray-500">Tidak ada pesan</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Pengirim
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Pesan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMessages.map((message) => (
                    <tr
                      key={message.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        message.status === "unread" ? "bg-orange-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className={`font-medium text-gray-900 ${message.status === "unread" ? "font-semibold" : ""}`}>
                            {message.nama}
                          </p>
                          <p className="text-sm text-gray-500">{message.kontak}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-gray-600 line-clamp-2 max-w-xs">
                          {message.pesan}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatDate(message.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => viewMessage(message)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {message.status !== "archived" && (
                            <button
                              onClick={() => updateMessageStatus(message.id, "archived")}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                              title="Arsipkan"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Menampilkan {pagination.offset + 1}-
                  {Math.min(pagination.offset + pagination.limit, pagination.total)} dari{" "}
                  {pagination.total} pesan
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Detail Modal */}
      {isDetailOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Detail Pesan
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Nama
                </label>
                <p className="text-gray-900 mt-1">{selectedMessage.nama}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Kontak
                </label>
                <p className="text-gray-900 mt-1">{selectedMessage.kontak}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Pesan
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedMessage.pesan}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Status
                </label>
                <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex flex-wrap gap-2">
              {selectedMessage.status !== "replied" && (
                <button
                  onClick={() => {
                    updateMessageStatus(selectedMessage.id, "replied");
                    setIsDetailOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Tandai Sudah Dibalas
                </button>
              )}
              {selectedMessage.status !== "archived" && (
                <button
                  onClick={() => {
                    updateMessageStatus(selectedMessage.id, "archived");
                    setIsDetailOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Arsipkan
                </button>
              )}
              <button
                onClick={() => {
                  deleteMessage(selectedMessage.id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
              
              {/* Quick contact links */}
              <div className="w-full mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Balas melalui:</p>
                <div className="flex gap-2">
                  {selectedMessage.kontak.includes("@") ? (
                    <a
                      href={`mailto:${selectedMessage.kontak}`}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  ) : (
                    <a
                      href={`https://wa.me/${selectedMessage.kontak.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
