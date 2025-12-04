"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  FileText,
  Loader2,
  MessageSquare,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'surat';
  link?: string;
  is_read: boolean;
  created_at: string;
}

interface AdminTopbarProps {
  onMenuClickAction: () => void;
}

export function AdminTopbar({ onMenuClickAction }: AdminTopbarProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const response = await fetch('/api/notifications?limit=10');
      
      if (!response.ok) return;
      
      const result = await response.json();
      setNotifications(result.data || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    
    if (notif.link) {
      router.push(notif.link);
      setIsNotifOpen(false);
    }
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
    return date.toLocaleDateString('id-ID');
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
  const getNotifIconColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-red-500';
      case 'surat': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 h-[72px] shadow-sm shadow-gray-900/5">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClickAction}
            className="lg:hidden p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 active:scale-95"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          {/* Title */}
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Sistem Admin Desa Toundanouw
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Kec. Touluaan, Kab. Minahasa Tenggara
            </p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-bold text-gray-900">Admin Desa</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/30 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown - Premium */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-[360px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/15 border border-gray-200/80 overflow-hidden z-50">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                  <div>
                    <h3 className="font-bold text-gray-900">Notifikasi</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{unreadCount} belum dibaca</p>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                  {notifLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                      <p className="text-xs text-gray-500 mt-2">Memuat notifikasi...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi</p>
                      <p className="text-xs text-gray-400 mt-1">Anda akan menerima notifikasi di sini</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const NotifIcon = getNotifIcon(notif.type);
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full px-5 py-4 text-left transition-all duration-200 border-b border-gray-50 last:border-0 ${
                            !notif.is_read 
                              ? "bg-gradient-to-r from-orange-50/80 to-amber-50/50 hover:from-orange-50 hover:to-amber-50" 
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-2 rounded-xl ${
                              notif.type === 'success' ? 'bg-green-100' :
                              notif.type === 'warning' ? 'bg-amber-100' :
                              notif.type === 'error' ? 'bg-red-100' :
                              notif.type === 'message' ? 'bg-blue-100' :
                              notif.type === 'surat' ? 'bg-purple-100' :
                              'bg-gray-100'
                            } ${getNotifIconColor(notif.type)}`}>
                              <NotifIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2 font-medium">
                                {getTimeAgo(notif.created_at)}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 mt-2 shadow-lg shadow-orange-500/30" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="px-5 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <Link 
                    href="/admin/pengaturan/notifikasi"
                    onClick={() => setIsNotifOpen(false)}
                    className="w-full block text-center text-sm text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                  >
                    Lihat semua notifikasi →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full blur opacity-40" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg shadow-orange-500/25">
                  <span className="text-white text-sm font-bold">
                    {user?.full_name?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {user?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 font-medium">Super Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block transition-transform duration-200" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Profile dropdown menu - Premium */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/15 border border-gray-200/80 overflow-hidden z-50">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <span className="text-white text-lg font-bold">
                          {user?.full_name?.charAt(0).toUpperCase() || "A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 capitalize">
                        {user?.full_name || "Admin"}
                      </p>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">Super Admin</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link
                    href="/admin/pengaturan/admin"
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    Profil Saya
                  </Link>
                  <Link
                    href="/admin/pengaturan"
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="h-4 w-4 text-gray-500" />
                    </div>
                    Pengaturan
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    Lihat Website
                  </Link>
                </div>
                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    {isLoggingOut ? "Keluar..." : "Logout dari Akun"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
