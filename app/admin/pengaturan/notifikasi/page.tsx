"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Info,
  AlertTriangle,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  Clock,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'surat';
  link?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export default function AdminNotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications?limit=50');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengambil notifikasi");
      }

      setNotifications(result.data || []);
      setUnreadCount(result.unreadCount || 0);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedNotif = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        setTotal(prev => prev - 1);
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Get time ago
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get notification icon
  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      case 'surat': return FileText;
      default: return Info;
    }
  };

  // Get notification icon color
  const getNotifIconBg = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'surat': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500 mt-1">
            Kelola semua notifikasi sistem
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {unreadCount} belum dibaca
              </span>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Tandai semua dibaca
              </button>
            </>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="mt-3 text-gray-500">Memuat notifikasi...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="mt-3 text-red-600">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Bell className="w-12 h-12 text-gray-300" />
            <p className="mt-3 text-gray-500">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const NotifIcon = getNotifIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notif.is_read ? "bg-orange-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getNotifIconBg(notif.type)}`}>
                      <NotifIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-medium text-gray-900 ${!notif.is_read ? "font-semibold" : ""}`}>
                            {notif.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {formatDate(notif.created_at)}
                            </span>
                            {notif.is_read && notif.read_at && (
                              <span className="flex items-center gap-1 text-xs text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                Dibaca
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {notif.link && (
                            <Link
                              href={notif.link}
                              onClick={() => !notif.is_read && markAsRead(notif.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-orange-600"
                              title="Buka"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          )}
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="p-2 rounded-lg hover:bg-green-50 transition-colors text-green-600"
                              title="Tandai sudah dibaca"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 text-center">
              Menampilkan {notifications.length} dari {total} notifikasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
