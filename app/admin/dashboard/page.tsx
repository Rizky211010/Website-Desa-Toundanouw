"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Newspaper,
  FileText,
  Mountain,
  Plus,
  ArrowRight,
  Calendar,
  Image,
  Edit,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  UserCog,
  Loader2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, StatsCard } from "@/components/admin/admin-card";
import { AdminButton } from "@/components/admin/admin-form";
import { getBerita } from "@/lib/berita-api";
import { getSuratTemplates } from "@/lib/surat-api";
import { getProfilDesa } from "@/lib/profil-api";
import { useAdminAuth, PermissionGuard, RoleGuard } from "@/lib/admin-auth";
import { getBeritaStatusInfo } from "@/lib/roles";

export default function DashboardPage() {
  const { user, isLoading: authLoading, roleDisplayName } = useAdminAuth();
  
  // Compute role checks directly from user to avoid stale state
  const currentRole = user?.role;
  const isSuperAdmin = currentRole === 'super_admin';
  const isAdmin = currentRole === 'admin';
  
  const [stats, setStats] = useState({
    totalBerita: 0,
    totalBeritaPublished: 0,
    totalBeritaPending: 0,
    totalSurat: 0,
    totalBeritaViews: 0,
  });
  const [recentBerita, setRecentBerita] = useState<any[]>([]);
  const [profil, setProfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all berita
        const beritaResponse = await getBerita(undefined, undefined, 100, 0);
        const allBerita = beritaResponse.data || [];
        
        // Fetch published berita
        const publishedResponse = await getBerita("published", undefined, 100, 0);
        const publishedBerita = publishedResponse.data || [];

        // Fetch all surat templates
        const suratResponse = await getSuratTemplates(undefined, 100, 0);
        const suratCount = (suratResponse.data || []).length;

        // Fetch profil desa
        const profilResponse = await getProfilDesa();
        setProfil(profilResponse.data);

        // Calculate total views
        const totalViews = allBerita.reduce((sum: number, b: any) => sum + (b.view_count || 0), 0);

        setStats({
          totalBerita: allBerita.length,
          totalBeritaPublished: publishedBerita.length,
          totalBeritaPending: 0,
          totalSurat: suratCount,
          totalBeritaViews: totalViews,
        });

        // Set recent berita (sorted by published date)
        const sorted = publishedBerita
          .sort((a: any, b: any) => {
            const dateA = new Date(b.published_at || 0).getTime();
            const dateB = new Date(a.published_at || 0).getTime();
            return dateA - dateB;
          })
          .slice(0, 5);
        
        setRecentBerita(sorted);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data dashboard");
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch when user and role are available
    if (user && currentRole) {
      fetchData();
    }
  }, [user, currentRole]);

  // Dummy data for charts (dapat diganti dengan data real dari DB)
  const pekerjaanData = [
    { label: "Petani", value: 35, color: "bg-orange-500" },
    { label: "Wiraswasta", value: 25, color: "bg-blue-500" },
    { label: "PNS/ASN", value: 15, color: "bg-green-500" },
    { label: "Karyawan", value: 15, color: "bg-purple-500" },
    { label: "Lainnya", value: 10, color: "bg-gray-400" },
  ];

  // Show loading while auth is checking
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#F28A2E] animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title={`Selamat Datang, ${user?.full_name || 'Admin'}!`}
        subtitle={`Role: ${roleDisplayName} • Sistem Admin Desa Toundanouw`}
      />

      {/* Error Alert - Premium */}
      {error && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-100/80 text-red-700 rounded-2xl shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading State - Premium */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-lg opacity-40 animate-pulse" />
            <div className="relative w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-gray-500 text-sm">Memuat data dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards - Different for each role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Super Admin & Admin Stats */}
            <RoleGuard roles={['super_admin', 'admin']}>
              <StatsCard
                title="Total Penduduk"
                value={profil?.statistik_penduduk || "1,508"}
                icon={<Users className="w-6 h-6" />}
                color="orange"
                trend={{ value: profil?.provinsi ? `${profil.provinsi}` : "+12 bulan ini", positive: true }}
              />
              <StatsCard
                title="Total Berita"
                value={stats.totalBerita}
                icon={<Newspaper className="w-6 h-6" />}
                color="blue"
                trend={{ value: `${stats.totalBeritaPublished} published`, positive: true }}
              />
              <StatsCard
                title="Menunggu Review"
                value={stats.totalBeritaPending}
                icon={<Clock className="w-6 h-6" />}
                color="yellow"
                trend={{ value: "Perlu ditinjau", positive: stats.totalBeritaPending === 0 }}
              />
              <StatsCard
                title="Jenis E-Surat"
                value={stats.totalSurat}
                icon={<FileText className="w-6 h-6" />}
                color="green"
              />
            </RoleGuard>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Quick Actions */}
            <AdminCard
              title="Aksi Cepat"
              subtitle="Pintasan ke halaman yang sering digunakan"
              className="xl:col-span-1"
            >
              <div className="space-y-3">
                <Link
                  href="/admin/konten/berita"
                  className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
                >
                  <div className="p-2 bg-orange-500 rounded-lg text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Kelola Berita</p>
                    <p className="text-sm text-gray-500">
                      {stats.totalBerita} artikel
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </Link>

                <PermissionGuard permission="surat.read">
                  <Link
                    href="/admin/layanan/surat"
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                  >
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Kelola E-Surat</p>
                      <p className="text-sm text-gray-500">{stats.totalSurat} template</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </Link>
                </PermissionGuard>

                <PermissionGuard permission="profil.update">
                  <Link
                    href="/admin/konten/profil"
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                  >
                    <div className="p-2 bg-green-500 rounded-lg text-white">
                      <Edit className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Update Profil Desa</p>
                      <p className="text-sm text-gray-500">Edit informasi desa</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </Link>
                </PermissionGuard>

                <Link
                  href="/admin/konten/galeri"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                >
                  <div className="p-2 bg-purple-500 rounded-lg text-white">
                    <Image className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Upload Galeri</p>
                    <p className="text-sm text-gray-500">Tambah foto kegiatan</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </Link>

                {/* Super Admin Only - Admin Management */}
                <RoleGuard roles={['super_admin']}>
                  <Link
                    href="/admin/pengaturan/admin"
                    className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
                  >
                    <div className="p-2 bg-red-500 rounded-lg text-white">
                      <UserCog className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Manajemen Admin</p>
                      <p className="text-sm text-gray-500">Kelola akun admin</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </Link>

                  <Link
                    href="/admin/activity-log"
                    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <div className="p-2 bg-gray-500 rounded-lg text-white">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Activity Log</p>
                      <p className="text-sm text-gray-500">Lihat semua aktivitas</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </Link>
                </RoleGuard>
              </div>
            </AdminCard>

            {/* Recent Activity */}
            <AdminCard
              title="Aktivitas Terbaru"
              subtitle="Berita dan update terkini"
              className="xl:col-span-2"
              action={
                <Link href="/admin/konten/berita">
                  <AdminButton variant="ghost" size="sm">
                    Lihat Semua
                    <ArrowRight className="w-4 h-4" />
                  </AdminButton>
                </Link>
              }
            >
              <div className="space-y-4">
                {recentBerita.length > 0 ? (
                  recentBerita.map((berita) => (
                    <div
                      key={berita.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Newspaper className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{berita.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {berita.published_at
                              ? new Date(berita.published_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            {berita.view_count || 0} views
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              berita.status === "published"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {berita.status === "published" ? "Terbit" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Belum ada berita</p>
                  </div>
                )}
              </div>
            </AdminCard>
          </div>

          {/* Charts Section - Only for Admin & Super Admin */}
          <RoleGuard roles={['super_admin', 'admin']}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Komposisi Pekerjaan */}
              <AdminCard
                title="Komposisi Pekerjaan Penduduk"
                subtitle="Distribusi jenis pekerjaan warga desa"
              >
                <div className="flex items-center gap-8">
                  {/* Simple Pie Chart Visualization */}
                  <div className="relative w-40 h-40 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      {(() => {
                        const elements: React.ReactElement[] = [];
                        let offset = 0;
                        const colors = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#9ca3af"];
                        
                        pekerjaanData.forEach((item, index) => {
                          const startAngle = offset;
                          const angle = (item.value / 100) * 360;
                          const endAngle = startAngle + angle;
                          
                          const x1 = 18 + 15 * Math.cos((Math.PI * startAngle) / 180);
                          const y1 = 18 + 15 * Math.sin((Math.PI * startAngle) / 180);
                          const x2 = 18 + 15 * Math.cos((Math.PI * endAngle) / 180);
                          const y2 = 18 + 15 * Math.sin((Math.PI * endAngle) / 180);
                          
                          const largeArc = angle > 180 ? 1 : 0;
                          
                          elements.push(
                            <path
                              key={index}
                              d={`M 18 18 L ${x1} ${y1} A 15 15 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={colors[index]}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          );
                          offset = endAngle;
                        });
                        return elements;
                      })()}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-3">
                    {pekerjaanData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminCard>

              {/* Statistics Info */}
              <AdminCard
                title="Informasi Desa"
                subtitle="Data dari profil desa"
              >
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs text-orange-600 font-medium mb-1">Nama Desa</p>
                    <p className="text-lg font-semibold text-gray-900">{profil?.nama_desa || "Desa Toundanouw"}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">Lokasi</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profil?.kecamatan || "Touluaan"}, {profil?.kabupaten || "Minahasa Tenggara"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{profil?.provinsi || "Sulawesi Utara"}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-medium mb-1">Kepala Desa</p>
                    <p className="text-lg font-semibold text-gray-900">{profil?.kepala_desa || "-"}</p>
                  </div>
                  <Link href="/admin/konten/profil" className="block">
                    <AdminButton className="w-full" variant="outline">
                      Edit Profil Desa
                      <ArrowRight className="w-4 h-4" />
                    </AdminButton>
                  </Link>
                </div>
              </AdminCard>
            </div>
          </RoleGuard>

          {/* Footer Info - Premium */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-3xl p-6 lg:p-8 text-white shadow-2xl shadow-orange-500/25">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold">Dashboard Terintegrasi</h3>
                <p className="text-orange-100 mt-2 max-w-xl leading-relaxed">
                  Semua data disinkronkan real-time dengan database Supabase. Perubahan akan langsung terlihat di website publik.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/" target="_blank">
                  <AdminButton variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl shadow-black/10 font-semibold">
                    Lihat Website
                  </AdminButton>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
