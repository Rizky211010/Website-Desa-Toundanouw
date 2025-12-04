"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, Pencil, X, GraduationCap, Heart } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, StatsCard } from "@/components/admin/admin-card";
import {
  FormSection,
  Input,
  AdminButton,
} from "@/components/admin/admin-form";
import { Users, UserCheck } from "lucide-react";

interface StatistikData {
  id?: string;
  total_jiwa: number;
  total_kk: number;
  laki_laki: number;
  perempuan: number;
}

interface KelompokUmurData {
  id: string;
  range_umur: string;
  label: string | null;
  jumlah: number;
  urutan: number;
}

interface PekerjaanData {
  id: string;
  jenis: string;
  jumlah: number;
  icon: string | null;
  urutan: number;
  is_active: boolean;
}

interface PendidikanData {
  id: string;
  tingkat: string;
  jumlah: number;
  urutan: number;
}

interface AgamaData {
  id: string;
  nama: string;
  jumlah: number;
  urutan: number;
}

const initialStatistik: StatistikData = {
  total_jiwa: 0,
  total_kk: 0,
  laki_laki: 0,
  perempuan: 0,
};

const initialPekerjaan = {
  jenis: "",
  jumlah: 0,
  icon: "",
};

const initialPendidikan = {
  tingkat: "",
  jumlah: 0,
};

const initialAgama = {
  nama: "",
  jumlah: 0,
};

export default function PendudukPage() {
  const [statistik, setStatistik] = useState<StatistikData>(initialStatistik);
  const [kelompokUmur, setKelompokUmur] = useState<KelompokUmurData[]>([]);
  const [pekerjaan, setPekerjaan] = useState<PekerjaanData[]>([]);
  const [pendidikan, setPendidikan] = useState<PendidikanData[]>([]);
  const [agama, setAgama] = useState<AgamaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal state for Pekerjaan
  const [showPekerjaanModal, setShowPekerjaanModal] = useState(false);
  const [editingPekerjaan, setEditingPekerjaan] = useState<PekerjaanData | null>(null);
  const [pekerjaanForm, setPekerjaanForm] = useState(initialPekerjaan);
  const [savingPekerjaan, setSavingPekerjaan] = useState(false);
  const [deletingPekerjaanId, setDeletingPekerjaanId] = useState<string | null>(null);

  // Modal state for Pendidikan
  const [showPendidikanModal, setShowPendidikanModal] = useState(false);
  const [editingPendidikan, setEditingPendidikan] = useState<PendidikanData | null>(null);
  const [pendidikanForm, setPendidikanForm] = useState(initialPendidikan);
  const [savingPendidikan, setSavingPendidikan] = useState(false);
  const [deletingPendidikanId, setDeletingPendidikanId] = useState<string | null>(null);

  // Modal state for Agama
  const [showAgamaModal, setShowAgamaModal] = useState(false);
  const [editingAgama, setEditingAgama] = useState<AgamaData | null>(null);
  const [agamaForm, setAgamaForm] = useState(initialAgama);
  const [savingAgama, setSavingAgama] = useState(false);
  const [deletingAgamaId, setDeletingAgamaId] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/penduduk");
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          if (result.data.statistik) {
            setStatistik(result.data.statistik);
          }
          setKelompokUmur(result.data.kelompokUmur || []);
          setPekerjaan(result.data.pekerjaan || []);
          setPendidikan(result.data.pendidikan || []);
          setAgama(result.data.agama || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Gagal memuat data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-calculate total jiwa
  useEffect(() => {
    const total = statistik.laki_laki + statistik.perempuan;
    if (total !== statistik.total_jiwa && statistik.laki_laki > 0 && statistik.perempuan > 0) {
      setStatistik(prev => ({ ...prev, total_jiwa: total }));
    }
  }, [statistik.laki_laki, statistik.perempuan, statistik.total_jiwa]);

  // Save all data
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/penduduk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statistik,
          kelompokUmur,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Data berhasil disimpan" });
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan data" });
      }
    } catch (error) {
      console.error("Error saving:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Pekerjaan CRUD
  const openAddPekerjaanModal = () => {
    setEditingPekerjaan(null);
    setPekerjaanForm(initialPekerjaan);
    setShowPekerjaanModal(true);
  };

  const openEditPekerjaanModal = (item: PekerjaanData) => {
    setEditingPekerjaan(item);
    setPekerjaanForm({
      jenis: item.jenis,
      jumlah: item.jumlah,
      icon: item.icon || "",
    });
    setShowPekerjaanModal(true);
  };

  const closePekerjaanModal = () => {
    setShowPekerjaanModal(false);
    setEditingPekerjaan(null);
    setPekerjaanForm(initialPekerjaan);
  };

  // Fetch only pekerjaan data (to avoid resetting other unsaved changes)
  const fetchPekerjaanOnly = useCallback(async () => {
    try {
      const response = await fetch("/api/penduduk");
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.pekerjaan) {
          setPekerjaan(result.data.pekerjaan);
        }
      }
    } catch (error) {
      console.error("Error fetching pekerjaan:", error);
    }
  }, []);

  // Fetch only pendidikan data
  const fetchPendidikanOnly = useCallback(async () => {
    try {
      const response = await fetch("/api/penduduk");
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.pendidikan) {
          setPendidikan(result.data.pendidikan);
        }
      }
    } catch (error) {
      console.error("Error fetching pendidikan:", error);
    }
  }, []);

  // Fetch only agama data
  const fetchAgamaOnly = useCallback(async () => {
    try {
      const response = await fetch("/api/penduduk");
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.agama) {
          setAgama(result.data.agama);
        }
      }
    } catch (error) {
      console.error("Error fetching agama:", error);
    }
  }, []);

  const handleSavePekerjaan = async () => {
    if (!pekerjaanForm.jenis.trim()) {
      setMessage({ type: "error", text: "Jenis pekerjaan harus diisi" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSavingPekerjaan(true);
      const url = editingPekerjaan
        ? `/api/penduduk/pekerjaan/${editingPekerjaan.id}`
        : "/api/penduduk/pekerjaan";
      const method = editingPekerjaan ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pekerjaanForm),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingPekerjaan ? "Pekerjaan berhasil diupdate" : "Pekerjaan berhasil ditambahkan",
        });
        closePekerjaanModal();
        // Only refresh pekerjaan data, not all data
        fetchPekerjaanOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan pekerjaan" });
      }
    } catch (error) {
      console.error("Error saving pekerjaan:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSavingPekerjaan(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeletePekerjaan = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pekerjaan ini?")) return;

    try {
      setDeletingPekerjaanId(id);
      const response = await fetch(`/api/penduduk/pekerjaan/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Pekerjaan berhasil dihapus" });
        // Only refresh pekerjaan data, not all data
        fetchPekerjaanOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menghapus pekerjaan" });
      }
    } catch (error) {
      console.error("Error deleting pekerjaan:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setDeletingPekerjaanId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Pendidikan CRUD
  const openAddPendidikanModal = () => {
    setEditingPendidikan(null);
    setPendidikanForm(initialPendidikan);
    setShowPendidikanModal(true);
  };

  const openEditPendidikanModal = (item: PendidikanData) => {
    setEditingPendidikan(item);
    setPendidikanForm({
      tingkat: item.tingkat,
      jumlah: item.jumlah,
    });
    setShowPendidikanModal(true);
  };

  const closePendidikanModal = () => {
    setShowPendidikanModal(false);
    setEditingPendidikan(null);
    setPendidikanForm(initialPendidikan);
  };

  const handleSavePendidikan = async () => {
    if (!pendidikanForm.tingkat.trim()) {
      setMessage({ type: "error", text: "Tingkat pendidikan harus diisi" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSavingPendidikan(true);
      const url = editingPendidikan
        ? `/api/penduduk/pendidikan/${editingPendidikan.id}`
        : "/api/penduduk/pendidikan";
      const method = editingPendidikan ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendidikanForm),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingPendidikan ? "Pendidikan berhasil diupdate" : "Pendidikan berhasil ditambahkan",
        });
        closePendidikanModal();
        fetchPendidikanOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan pendidikan" });
      }
    } catch (error) {
      console.error("Error saving pendidikan:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSavingPendidikan(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeletePendidikan = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tingkat pendidikan ini?")) return;

    try {
      setDeletingPendidikanId(id);
      const response = await fetch(`/api/penduduk/pendidikan/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Pendidikan berhasil dihapus" });
        fetchPendidikanOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menghapus pendidikan" });
      }
    } catch (error) {
      console.error("Error deleting pendidikan:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setDeletingPendidikanId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Agama CRUD
  const openAddAgamaModal = () => {
    setEditingAgama(null);
    setAgamaForm(initialAgama);
    setShowAgamaModal(true);
  };

  const openEditAgamaModal = (item: AgamaData) => {
    setEditingAgama(item);
    setAgamaForm({
      nama: item.nama,
      jumlah: item.jumlah,
    });
    setShowAgamaModal(true);
  };

  const closeAgamaModal = () => {
    setShowAgamaModal(false);
    setEditingAgama(null);
    setAgamaForm(initialAgama);
  };

  const handleSaveAgama = async () => {
    if (!agamaForm.nama.trim()) {
      setMessage({ type: "error", text: "Nama agama harus diisi" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSavingAgama(true);
      const url = editingAgama
        ? `/api/penduduk/agama/${editingAgama.id}`
        : "/api/penduduk/agama";
      const method = editingAgama ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agamaForm),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingAgama ? "Agama berhasil diupdate" : "Agama berhasil ditambahkan",
        });
        closeAgamaModal();
        fetchAgamaOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan agama" });
      }
    } catch (error) {
      console.error("Error saving agama:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSavingAgama(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteAgama = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus agama ini?")) return;

    try {
      setDeletingAgamaId(id);
      const response = await fetch(`/api/penduduk/agama/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Agama berhasil dihapus" });
        fetchAgamaOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menghapus agama" });
      }
    } catch (error) {
      console.error("Error deleting agama:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setDeletingAgamaId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Update kelompok umur jumlah
  const handleKelompokUmurChange = (id: string, jumlah: number) => {
    setKelompokUmur(prev =>
      prev.map(item => (item.id === id ? { ...item, jumlah } : item))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const maxKelompokUmur = Math.max(...kelompokUmur.map((k) => k.jumlah), 1);
  const totalPekerjaan = pekerjaan.reduce((sum, p) => sum + p.jumlah, 0);
  const totalPendidikan = pendidikan.reduce((sum, p) => sum + p.jumlah, 0);
  const totalAgama = agama.reduce((sum, a) => sum + a.jumlah, 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Penduduk & Pekerjaan"
        subtitle="Kelola data statistik kependudukan desa"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Jelajahi", href: "/admin/konten/jelajahi" },
          { label: "Penduduk & Pekerjaan" },
        ]}
      />

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Jiwa"
          value={statistik.total_jiwa.toLocaleString()}
          icon={<Users className="w-6 h-6" />}
          color="orange"
        />
        <StatsCard
          title="Kepala Keluarga"
          value={statistik.total_kk.toLocaleString()}
          icon={<UserCheck className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Laki-laki"
          value={statistik.laki_laki.toLocaleString()}
          icon={<span className="text-2xl">👨</span>}
          color="green"
        />
        <StatsCard
          title="Perempuan"
          value={statistik.perempuan.toLocaleString()}
          icon={<span className="text-2xl">👩</span>}
          color="purple"
        />
      </div>

      {/* Statistik Input */}
      <FormSection
        title="Data Statistik Penduduk"
        description="Edit jumlah total penduduk"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Total Jiwa"
            type="number"
            value={statistik.total_jiwa}
            onChange={(e) =>
              setStatistik({ ...statistik, total_jiwa: parseInt(e.target.value) || 0 })
            }
          />
          <Input
            label="Kepala Keluarga"
            type="number"
            value={statistik.total_kk}
            onChange={(e) =>
              setStatistik({ ...statistik, total_kk: parseInt(e.target.value) || 0 })
            }
          />
          <Input
            label="Laki-laki"
            type="number"
            value={statistik.laki_laki}
            onChange={(e) =>
              setStatistik({ ...statistik, laki_laki: parseInt(e.target.value) || 0 })
            }
          />
          <Input
            label="Perempuan"
            type="number"
            value={statistik.perempuan}
            onChange={(e) =>
              setStatistik({ ...statistik, perempuan: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </FormSection>

      {/* Data Input & Chart Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Kelompok Umur */}
        <FormSection
          title="Data Kelompok Umur"
          description="Edit jumlah penduduk berdasarkan umur"
        >
          <div className="space-y-4">
            {kelompokUmur.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">{item.range_umur}</div>
                <Input
                  type="number"
                  value={item.jumlah}
                  onChange={(e) =>
                    handleKelompokUmurChange(item.id, parseInt(e.target.value) || 0)
                  }
                  className="flex-1"
                />
                <div className="w-20 text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </FormSection>

        {/* Chart Preview */}
        <AdminCard
          title="Preview Kelompok Umur"
          subtitle="Grafik distribusi usia penduduk"
        >
          <div className="space-y-3">
            {kelompokUmur.map((item) => {
              const percentage = (item.jumlah / maxKelompokUmur) * 100;

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.range_umur}</span>
                    <span className="font-medium text-gray-900">{item.jumlah}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      </div>

      {/* Pekerjaan Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Data Pekerjaan Input */}
        <AdminCard
          title="Data Pekerjaan"
          subtitle="Edit jenis dan jumlah pekerjaan"
          action={
            <AdminButton
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={openAddPekerjaanModal}
            >
              Tambah
            </AdminButton>
          }
        >
          <div className="space-y-3">
            {pekerjaan.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada data pekerjaan</p>
                <p className="text-sm">Klik tombol &quot;Tambah&quot; untuk menambahkan</p>
              </div>
            ) : (
              pekerjaan.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
                >
                  <span className="text-xl">{item.icon || "📋"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.jenis}</p>
                  </div>
                  <span className="font-semibold text-orange-600">{item.jumlah}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditPekerjaanModal(item)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePekerjaan(item.id)}
                      disabled={deletingPekerjaanId === item.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingPekerjaanId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        {/* Pekerjaan Chart Preview */}
        <AdminCard
          title="Preview Komposisi Pekerjaan"
          subtitle="Grafik distribusi pekerjaan"
        >
          <div className="flex items-center gap-8">
            {/* Pie Chart */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const elements: React.ReactElement[] = [];
                  let offset = 0;
                  const colors = [
                    "#f97316",
                    "#3b82f6",
                    "#22c55e",
                    "#a855f7",
                    "#ec4899",
                    "#06b6d4",
                    "#eab308",
                    "#9ca3af",
                  ];

                  pekerjaan.forEach((item, index) => {
                    const percentage = totalPekerjaan > 0 ? (item.jumlah / totalPekerjaan) * 100 : 0;
                    const startAngle = offset;
                    const angle = (percentage / 100) * 360;
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
                        fill={colors[index % colors.length]}
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
            <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
              {pekerjaan.slice(0, 6).map((item, index) => {
                const percentage = totalPekerjaan > 0 ? ((item.jumlah / totalPekerjaan) * 100).toFixed(1) : "0.0";
                const colors = [
                  "bg-orange-500",
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-purple-500",
                  "bg-pink-500",
                  "bg-cyan-500",
                ];

                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                      />
                      <span className="text-xs text-gray-600 truncate max-w-[100px]">
                        {item.jenis}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
              {pekerjaan.length > 6 && (
                <p className="text-xs text-gray-400">+{pekerjaan.length - 6} lainnya</p>
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Pendidikan Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Data Pendidikan Input */}
        <AdminCard
          title="Data Tingkat Pendidikan"
          subtitle="Edit tingkat pendidikan penduduk"
          action={
            <AdminButton
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={openAddPendidikanModal}
            >
              Tambah
            </AdminButton>
          }
        >
          <div className="space-y-3">
            {pendidikan.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada data pendidikan</p>
                <p className="text-sm">Klik tombol &quot;Tambah&quot; untuk menambahkan</p>
              </div>
            ) : (
              pendidikan.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.tingkat}</p>
                  </div>
                  <span className="font-semibold text-blue-600">{item.jumlah}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditPendidikanModal(item)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePendidikan(item.id)}
                      disabled={deletingPendidikanId === item.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingPendidikanId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        {/* Pendidikan Chart Preview */}
        <AdminCard
          title="Preview Komposisi Pendidikan"
          subtitle="Grafik distribusi tingkat pendidikan"
        >
          <div className="space-y-3">
            {pendidikan.map((item) => {
              const percentage = totalPendidikan > 0 ? (item.jumlah / totalPendidikan) * 100 : 0;

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.tingkat}</span>
                    <span className="font-medium text-gray-900">{item.jumlah} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {pendidikan.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Tidak ada data untuk ditampilkan</p>
              </div>
            )}
          </div>
        </AdminCard>
      </div>

      {/* Agama Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Data Agama Input */}
        <AdminCard
          title="Data Agama"
          subtitle="Edit data agama penduduk"
          action={
            <AdminButton
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={openAddAgamaModal}
            >
              Tambah
            </AdminButton>
          }
        >
          <div className="space-y-3">
            {agama.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada data agama</p>
                <p className="text-sm">Klik tombol &quot;Tambah&quot; untuk menambahkan</p>
              </div>
            ) : (
              agama.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group"
                >
                  <Heart className="w-5 h-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.nama}</p>
                  </div>
                  <span className="font-semibold text-purple-600">{item.jumlah}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditAgamaModal(item)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAgama(item.id)}
                      disabled={deletingAgamaId === item.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingAgamaId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        {/* Agama Chart Preview */}
        <AdminCard
          title="Preview Komposisi Agama"
          subtitle="Grafik distribusi agama penduduk"
        >
          <div className="flex items-center gap-8">
            {/* Pie Chart */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const elements: React.ReactElement[] = [];
                  let offset = 0;
                  const colors = [
                    "#a855f7",
                    "#3b82f6",
                    "#22c55e",
                    "#f97316",
                    "#ec4899",
                    "#06b6d4",
                  ];

                  agama.forEach((item, index) => {
                    const percentage = totalAgama > 0 ? (item.jumlah / totalAgama) * 100 : 0;
                    const startAngle = offset;
                    const angle = (percentage / 100) * 360;
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
                        fill={colors[index % colors.length]}
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
            <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
              {agama.map((item, index) => {
                const percentage = totalAgama > 0 ? ((item.jumlah / totalAgama) * 100).toFixed(1) : "0.0";
                const colors = [
                  "bg-purple-500",
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-orange-500",
                  "bg-pink-500",
                  "bg-cyan-500",
                ];

                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                      />
                      <span className="text-xs text-gray-600 truncate max-w-[100px]">
                        {item.nama}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
              {agama.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">Tidak ada data</p>
                </div>
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <AdminButton variant="outline" onClick={() => fetchData()}>
          Batal
        </AdminButton>
        <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </AdminButton>
      </div>

      {/* Pekerjaan Modal */}
      {showPekerjaanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPekerjaan ? "Edit Pekerjaan" : "Tambah Pekerjaan Baru"}
              </h3>
              <button
                onClick={closePekerjaanModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Input
                label="Jenis Pekerjaan"
                value={pekerjaanForm.jenis}
                onChange={(e) =>
                  setPekerjaanForm({ ...pekerjaanForm, jenis: e.target.value })
                }
                placeholder="Contoh: Petani, Wiraswasta"
                required
              />
              <Input
                label="Jumlah"
                type="number"
                value={pekerjaanForm.jumlah}
                onChange={(e) =>
                  setPekerjaanForm({
                    ...pekerjaanForm,
                    jumlah: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Icon (Emoji)"
                value={pekerjaanForm.icon}
                onChange={(e) =>
                  setPekerjaanForm({ ...pekerjaanForm, icon: e.target.value })
                }
                placeholder="Contoh: 🌾, 👔, 💼"
              />
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <AdminButton variant="outline" onClick={closePekerjaanModal}>
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSavePekerjaan}
                disabled={savingPekerjaan}
              >
                {savingPekerjaan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingPekerjaan ? (
                  "Update"
                ) : (
                  "Tambah"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Pendidikan Modal */}
      {showPendidikanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPendidikan ? "Edit Pendidikan" : "Tambah Pendidikan Baru"}
              </h3>
              <button
                onClick={closePendidikanModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Input
                label="Tingkat Pendidikan"
                value={pendidikanForm.tingkat}
                onChange={(e) =>
                  setPendidikanForm({ ...pendidikanForm, tingkat: e.target.value })
                }
                placeholder="Contoh: SD, SMP, SMA, S1"
                required
              />
              <Input
                label="Jumlah"
                type="number"
                value={pendidikanForm.jumlah}
                onChange={(e) =>
                  setPendidikanForm({
                    ...pendidikanForm,
                    jumlah: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <AdminButton variant="outline" onClick={closePendidikanModal}>
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSavePendidikan}
                disabled={savingPendidikan}
              >
                {savingPendidikan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingPendidikan ? (
                  "Update"
                ) : (
                  "Tambah"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Agama Modal */}
      {showAgamaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAgama ? "Edit Agama" : "Tambah Agama Baru"}
              </h3>
              <button
                onClick={closeAgamaModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Input
                label="Nama Agama"
                value={agamaForm.nama}
                onChange={(e) =>
                  setAgamaForm({ ...agamaForm, nama: e.target.value })
                }
                placeholder="Contoh: Islam, Kristen, Hindu, Buddha"
                required
              />
              <Input
                label="Jumlah"
                type="number"
                value={agamaForm.jumlah}
                onChange={(e) =>
                  setAgamaForm({
                    ...agamaForm,
                    jumlah: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <AdminButton variant="outline" onClick={closeAgamaModal}>
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSaveAgama}
                disabled={savingAgama}
              >
                {savingAgama ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingAgama ? (
                  "Update"
                ) : (
                  "Tambah"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
