"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AdminAuthProvider,
  AdminAuthGuard,
} from "@/lib/admin-auth";
import { NewsProvider } from "@/lib/news-context";
import { SuratProvider } from "@/lib/surat-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

// Halaman yang tidak perlu auth (ada di folder (auth))
const AUTH_PAGES = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Jika halaman auth, render tanpa AdminAuthGuard
  const isAuthPage = AUTH_PAGES.some(page => pathname?.startsWith(page));
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <NewsProvider>
          <SuratProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SuratProvider>
        </NewsProvider>
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onCloseAction={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <AdminTopbar onMenuClickAction={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto relative z-0 bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
