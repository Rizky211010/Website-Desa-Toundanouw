"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import {
  IconDashboard,
  IconProfil,
  IconJelajahi,
  IconOrganisasi,
  IconWilayah,
  IconPenduduk,
  IconPotensi,
  IconBerita,
  IconGaleri,
  IconSurat,
  IconKontak,
  IconPengaturan,
  IconManajemenUser,
  IconNotifikasi,
  IconKontakChat,
  IconClose,
} from "../icons";
import { Layout, Activity, ClipboardList } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, type ReactNode } from "react";
import { useAdminAuth, type Permission } from "@/lib/admin-auth";
import { type UserRole } from "@/lib/roles";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  submenu?: NavItem[];
  // Role-based access control
  roles?: UserRole[];         // Only visible to these roles
  permission?: Permission;    // Only visible if user has this permission
}

// All navigation items with role restrictions
const allNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <IconDashboard variant="muted" iconSize="md" strokeWeight="normal" />,
    // Accessible to all roles
  },
  {
    label: "Pesan Masuk",
    href: "/admin/pesan",
    icon: <IconKontakChat variant="muted" iconSize="md" strokeWeight="normal" />,
    roles: ['super_admin', 'admin'], // Editor tidak bisa akses pesan
    permission: 'pesan.read',
  },
  {
    label: "Konten Publik",
    href: "/admin/konten",
    icon: <Layout className="h-5 w-5" />,
    submenu: [
      {
        label: "Profil Desa",
        href: "/admin/konten/profil",
        icon: <IconProfil variant="muted" iconSize="sm" strokeWeight="normal" />,
        roles: ['super_admin', 'admin'],
        permission: 'profil.read',
      },
      {
        label: "Jelajahi",
        href: "/admin/konten/jelajahi",
        icon: <IconJelajahi variant="muted" iconSize="sm" strokeWeight="normal" />,
        roles: ['super_admin', 'admin'],
        submenu: [
          {
            label: "Sejarah Desa",
            href: "/admin/konten/jelajahi/sejarah",
            icon: <Activity className="h-4 w-4" />,
            permission: 'profil.read',
          },
          {
            label: "Organisasi Desa",
            href: "/admin/konten/jelajahi/organisasi",
            icon: <IconOrganisasi variant="muted" iconSize="sm" strokeWeight="normal" />,
            permission: 'organisasi.read',
          },
          {
            label: "Wilayah Desa",
            href: "/admin/konten/jelajahi/wilayah",
            icon: <IconWilayah variant="muted" iconSize="sm" strokeWeight="normal" />,
          },
          {
            label: "Penduduk & Pekerjaan",
            href: "/admin/konten/jelajahi/penduduk",
            icon: <IconPenduduk variant="muted" iconSize="sm" strokeWeight="normal" />,
          },
        ],
      },
      {
        label: "Potensi Desa",
        href: "/admin/konten/potensi",
        icon: <IconPotensi variant="muted" iconSize="sm" strokeWeight="normal" />,
        roles: ['super_admin', 'admin'],
        permission: 'potensi.read',
      },
      {
        label: "Berita & Pengumuman",
        href: "/admin/konten/berita",
        icon: <IconBerita variant="muted" iconSize="sm" strokeWeight="normal" />,
        // Accessible to all roles (editor can manage their own)
        permission: 'berita.read',
      },
      {
        label: "Galeri",
        href: "/admin/konten/galeri",
        icon: <IconGaleri variant="muted" iconSize="sm" strokeWeight="normal" />,
        // Accessible to all roles (editor can manage their own)
        permission: 'galeri.read',
      },
    ],
  },
  {
    label: "Layanan E-Surat",
    href: "/admin/layanan/surat",
    icon: <IconSurat variant="muted" iconSize="md" strokeWeight="normal" />,
    roles: ['super_admin', 'admin'], // Editor tidak bisa akses E-Surat
    permission: 'surat.read',
    submenu: [
      {
        label: "Jenis Surat",
        href: "/admin/layanan/surat",
        icon: <ClipboardList className="h-4 w-4" />,
      },
    ],
  },
  {
    label: "Activity Log",
    href: "/admin/activity-log",
    icon: <Activity className="h-5 w-5" />,
    roles: ['super_admin'], // Only Super Admin
    permission: 'log.read',
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: <IconPengaturan variant="muted" iconSize="md" strokeWeight="normal" />,
    roles: ['super_admin', 'admin'], // Editor tidak bisa akses pengaturan
    permission: 'pengaturan.read',
    submenu: [
      {
        label: "Kontak & Info Kantor",
        href: "/admin/pengaturan/kontak",
        icon: <IconKontak variant="muted" iconSize="sm" strokeWeight="normal" />,
      },
      {
        label: "Hero & Beranda",
        href: "/admin/pengaturan/hero",
        icon: <Layout className="h-4 w-4" />,
      },
      {
        label: "Notifikasi",
        href: "/admin/pengaturan/notifikasi",
        icon: <IconNotifikasi variant="muted" iconSize="sm" strokeWeight="normal" />,
      },
      {
        label: "Manajemen Admin",
        href: "/admin/pengaturan/admin",
        icon: <IconManajemenUser variant="muted" iconSize="sm" strokeWeight="normal" />,
        roles: ['super_admin'], // Only Super Admin can manage admins
        permission: 'admin.read',
      },
    ],
  },
];

function NavItemComponent({
  item,
  depth = 0,
  onCloseAction,
  userRole,
  checkPermission,
  unreadCount = 0,
}: {
  item: NavItem;
  depth?: number;
  onCloseAction?: () => void;
  userRole?: UserRole;
  checkPermission: (permission: Permission) => boolean;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if user has access to this item
  const hasAccess = useMemo(() => {
    // If item has role restriction, check if user's role is in the list
    if (item.roles && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    // If item has permission restriction, check if user has the permission
    if (item.permission && !checkPermission(item.permission)) {
      return false;
    }
    return true;
  }, [item.roles, item.permission, userRole, checkPermission]);

  // Filter submenu items based on access
  const accessibleSubmenu = useMemo(() => {
    if (!item.submenu) return [];
    return item.submenu.filter(subItem => {
      if (subItem.roles && userRole && !subItem.roles.includes(userRole)) {
        return false;
      }
      if (subItem.permission && !checkPermission(subItem.permission)) {
        return false;
      }
      return true;
    });
  }, [item.submenu, userRole, checkPermission]);

  const hasSubmenu = accessibleSubmenu.length > 0;
  
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const isChildActive = accessibleSubmenu?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );

  // Auto expand if child is active
  useState(() => {
    if (isChildActive) setIsExpanded(true);
  });

  // Don't render if no access
  if (!hasAccess) return null;

  if (hasSubmenu) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium
            transition-all duration-300 relative overflow-hidden
            ${depth > 0 ? "pl-10" : ""}
            ${
              isActive || isChildActive
                ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }
          `}
        >
          {/* Active indicator bar */}
          {(isActive || isChildActive) && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-400 to-amber-500 rounded-r-full" />
          )}
          <span className={`transition-colors duration-300 ${isActive || isChildActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`}>
            {item.icon}
          </span>
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="ml-5 space-y-1 border-l-2 border-gray-100 pl-3 py-1">
            {accessibleSubmenu.map((subItem) => (
              <NavItemComponent
                key={subItem.href}
                item={subItem}
                depth={depth + 1}
                onCloseAction={onCloseAction}
                userRole={userRole}
                checkPermission={checkPermission}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onCloseAction}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
        transition-all duration-300 relative overflow-hidden
        ${depth > 0 ? "pl-7" : ""}
        ${
          isActive
            ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
      `}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-400 to-amber-500 rounded-r-full" />
      )}
      <span className={`transition-colors duration-300 ${isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {/* Show unread badge for Pesan Masuk */}
      {item.href === "/admin/pesan" && unreadCount > 0 && (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {isActive && <ChevronRight className="h-4 w-4 text-orange-500" />}
    </Link>
  );
}

interface AdminSidebarProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function AdminSidebar({ isOpen, onCloseAction }: AdminSidebarProps) {
  const { user, isLoading, hasPermission } = useAdminAuth();
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);

  // Get current role directly from user to avoid stale data
  const currentRole = user?.role;

  // Fetch messages unread count
  const fetchMessagesUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/messages?limit=1');
      if (response.ok) {
        const result = await response.json();
        setMessagesUnreadCount(result.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching messages unread count:', err);
    }
  }, []);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    if (user) {
      fetchMessagesUnreadCount();
      const interval = setInterval(fetchMessagesUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchMessagesUnreadCount]);

  // Filter nav items based on user role and permissions
  const navItems = useMemo(() => {
    if (!user || !currentRole) return [];
    
    return allNavItems.filter(item => {
      // If item has role restriction, check if user's role is in the list
      if (item.roles && !item.roles.includes(currentRole)) {
        return false;
      }
      // If item has permission restriction, check if user has the permission
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }
      return true;
    });
  }, [user, currentRole, hasPermission]);

  // Compute role badge info
  const roleBadge = useMemo(() => {
    switch (currentRole) {
      case 'super_admin':
        return { 
          label: '🛡️ Super Admin', 
          className: 'bg-red-100 text-red-700 border border-red-200' 
        };
      case 'admin':
        return { 
          label: '👑 Admin', 
          className: 'bg-blue-100 text-blue-700 border border-blue-200' 
        };
      default:
        return { label: 'User', className: 'bg-gray-100 text-gray-700' };
    }
  }, [currentRole]);

  // Show loading skeleton while auth is loading
  if (isLoading || !user || !currentRole) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onCloseAction}
          />
        )}

        {/* Sidebar Skeleton */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 
            transform transition-transform duration-300 ease-out
            lg:translate-x-0 lg:static lg:z-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="hidden sm:block space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Navigation Skeleton */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseAction}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 
          bg-white/95 backdrop-blur-xl border-r border-gray-200/80
          transform transition-all duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-10
          ${isOpen ? "translate-x-0 shadow-2xl shadow-gray-900/20" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Header - Premium Design */}
        <div className="flex items-center justify-between h-[72px] px-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
          <Link href="/admin/dashboard" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-0.5 shadow-lg shadow-orange-500/25">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Logo Desa Toundanouw"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 text-sm leading-tight tracking-tight">Admin Panel</p>
              <p className="text-xs text-gray-500 font-medium">Desa Toundanouw</p>
            </div>
          </Link>
          <button
            onClick={onCloseAction}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <IconClose variant="muted" iconSize="md" />
          </button>
        </div>

        {/* Navigation - Premium Scroll */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          {navItems.map((item) => (
            <NavItemComponent 
              key={item.href} 
              item={item} 
              onCloseAction={onCloseAction}
              userRole={currentRole}
              checkPermission={hasPermission}
              unreadCount={item.href === "/admin/pesan" ? messagesUnreadCount : 0}
            />
          ))}
        </nav>

        {/* Role Badge - Premium */}
        <div className="px-4 pb-3">
          <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-center shadow-sm ${roleBadge.className}`}>
            {roleBadge.label}
          </div>
        </div>

        {/* Footer - Premium Help Card */}
        <div className="p-4 border-t border-gray-100">
          <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-5 overflow-hidden border border-orange-100/50">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-200/30 rounded-full blur-xl" />
            
            <div className="relative z-10">
              <p className="text-sm font-bold text-orange-900">Butuh Bantuan?</p>
              <p className="text-xs text-orange-700/80 mt-1.5 leading-relaxed">
                Hubungi via Instagram untuk bantuan teknis.
              </p>
              <a 
                href="https://www.instagram.com/rizkymema?igsh=cGJ5NjBuZm41NXc2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white text-xs font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Hubungi via Instagram
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
