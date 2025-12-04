"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  History,
  Loader2,
  AlertTriangle,
  RefreshCw,
  X,
  ToggleLeft,
  ToggleRight,
  Star,
  StarOff,
  Calendar,
  User,
  Award,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminButton, Input, Textarea, Select } from "@/components/admin/admin-form";
import {
  getSejarahEvents,
  getSejarahKepala,
  createSejarahEvent,
  updateSejarahEvent,
  deleteSejarahEvent,
  createSejarahKepala,
  updateSejarahKepala,
  deleteSejarahKepala,
  KATEGORI_SEJARAH,
} from "@/lib/sejarah-api";
import { SejarahDesaRow, SejarahKepalaDesaRow } from "@/lib/supabase";

const kategoriOptions = KATEGORI_SEJARAH.filter(k => k.value !== 'semua').map(k => ({
  value: k.value,
  label: k.label,
}));

type TabType = "events" | "kepala";

export default function SejarahPage() {
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("events");

  // Data states
  const [sejarahEvents, setSejarahEvents] = useState<SejarahDesaRow[]>([]);
  const [kepalaList, setKepalaList] = useState<SejarahKepalaDesaRow[]>([]);

  // Modal states for Events
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SejarahDesaRow | null>(null);
  const [isEventModalSaving, setIsEventModalSaving] = useState(false);
  const [eventForm, setEventForm] = useState({
    tahun: "",
    judul: "",
    deskripsi: "",
    kategori: "umum",
    urutan: "",
    is_highlight: false,
  });

  // Modal states for Kepala
  const [isKepalaModalOpen, setIsKepalaModalOpen] = useState(false);
  const [editingKepala, setEditingKepala] = useState<SejarahKepalaDesaRow | null>(null);
  const [isKepalaModalSaving, setIsKepalaModalSaving] = useState(false);
  const [kepalaForm, setKepalaForm] = useState({
    nama: "",
    periode_mulai: "",
    periode_selesai: "",
    pencapaian: "",
    keterangan: "",
    urutan: "",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [eventsData, kepalaData] = await Promise.all([
        getSejarahEvents({ includeInactive: true }),
        getSejarahKepala({ includeInactive: true }),
      ]);

      setSejarahEvents(eventsData);
      setKepalaList(kepalaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleToggleEventStatus = async (item: SejarahDesaRow) => {
    try {
      await updateSejarahEvent(item.id, { is_active: !item.is_active });
      setSejarahEvents(
        sejarahEvents.map((e) =>
          e.id === item.id ? { ...e, is_active: !e.is_active } : e
        )
      );
      setSuccessMessage(`Status sejarah berhasil diubah`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  const handleToggleEventHighlight = async (item: SejarahDesaRow) => {
    try {
      await updateSejarahEvent(item.id, { is_highlight: !item.is_highlight });
      setSejarahEvents(
        sejarahEvents.map((e) =>
          e.id === item.id ? { ...e, is_highlight: !e.is_highlight } : e
        )
      );
      setSuccessMessage(`Highlight berhasil diubah`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update highlight");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sejarah ini?")) return;

    try {
      await deleteSejarahEvent(id);
      setSejarahEvents(sejarahEvents.filter((item) => item.id !== id));
      setSuccessMessage("Sejarah berhasil dihapus!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus sejarah");
    }
  };

  const handleOpenEventModal = (item?: SejarahDesaRow) => {
    if (item) {
      setEditingEvent(item);
      setEventForm({
        tahun: item.tahun,
        judul: item.judul,
        deskripsi: item.deskripsi,
        kategori: item.kategori,
        urutan: item.urutan.toString(),
        is_highlight: item.is_highlight,
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        tahun: "",
        judul: "",
        deskripsi: "",
        kategori: "umum",
        urutan: (sejarahEvents.length + 1).toString(),
        is_highlight: false,
      });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEventModal = async () => {
    if (!eventForm.tahun || !eventForm.judul || !eventForm.deskripsi) {
      setError("Tahun, judul, dan deskripsi harus diisi");
      return;
    }

    try {
      setIsEventModalSaving(true);
      setError(null);

      const payload = {
        tahun: eventForm.tahun,
        judul: eventForm.judul,
        deskripsi: eventForm.deskripsi,
        kategori: eventForm.kategori,
        urutan: parseInt(eventForm.urutan) || 0,
        is_highlight: eventForm.is_highlight,
      };

      if (editingEvent) {
        const updated = await updateSejarahEvent(editingEvent.id, payload);
        setSejarahEvents(
          sejarahEvents.map((e) => (e.id === editingEvent.id ? updated : e))
        );
        setSuccessMessage("Sejarah berhasil diperbarui!");
      } else {
        const created = await createSejarahEvent(payload);
        setSejarahEvents([...sejarahEvents, created]);
        setSuccessMessage("Sejarah berhasil ditambahkan!");
      }

      setIsEventModalOpen(false);
      setEditingEvent(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan sejarah");
    } finally {
      setIsEventModalSaving(false);
    }
  };

  // ============================================================================
  // KEPALA HANDLERS
  // ============================================================================

  const handleToggleKepalaStatus = async (item: SejarahKepalaDesaRow) => {
    try {
      await updateSejarahKepala(item.id, { is_active: !item.is_active });
      setKepalaList(
        kepalaList.map((k) =>
          k.id === item.id ? { ...k, is_active: !k.is_active } : k
        )
      );
      setSuccessMessage(`Status kepala desa berhasil diubah`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  const handleDeleteKepala = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data kepala desa ini?")) return;

    try {
      await deleteSejarahKepala(id);
      setKepalaList(kepalaList.filter((item) => item.id !== id));
      setSuccessMessage("Data kepala desa berhasil dihapus!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data kepala desa");
    }
  };

  const handleOpenKepalaModal = (item?: SejarahKepalaDesaRow) => {
    if (item) {
      setEditingKepala(item);
      setKepalaForm({
        nama: item.nama,
        periode_mulai: item.periode_mulai,
        periode_selesai: item.periode_selesai || "",
        pencapaian: item.pencapaian || "",
        keterangan: item.keterangan || "",
        urutan: item.urutan.toString(),
      });
    } else {
      setEditingKepala(null);
      setKepalaForm({
        nama: "",
        periode_mulai: "",
        periode_selesai: "",
        pencapaian: "",
        keterangan: "",
        urutan: (kepalaList.length + 1).toString(),
      });
    }
    setIsKepalaModalOpen(true);
  };

  const handleSaveKepalaModal = async () => {
    if (!kepalaForm.nama || !kepalaForm.periode_mulai) {
      setError("Nama dan periode mulai harus diisi");
      return;
    }

    try {
      setIsKepalaModalSaving(true);
      setError(null);

      const payload = {
        nama: kepalaForm.nama,
        periode_mulai: kepalaForm.periode_mulai,
        periode_selesai: kepalaForm.periode_selesai || null,
        pencapaian: kepalaForm.pencapaian || null,
        keterangan: kepalaForm.keterangan || null,
        urutan: parseInt(kepalaForm.urutan) || 0,
      };

      if (editingKepala) {
        const updated = await updateSejarahKepala(editingKepala.id, payload);
        setKepalaList(
          kepalaList.map((k) => (k.id === editingKepala.id ? updated : k))
        );
        setSuccessMessage("Data kepala desa berhasil diperbarui!");
      } else {
        const created = await createSejarahKepala(payload);
        setKepalaList([...kepalaList, created]);
        setSuccessMessage("Data kepala desa berhasil ditambahkan!");
      }

      setIsKepalaModalOpen(false);
      setEditingKepala(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data kepala desa");
    } finally {
      setIsKepalaModalSaving(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sejarah Desa"
        subtitle="Kelola sejarah dan daftar kepala desa"
        actions={
          <div className="flex gap-2">
            <AdminButton
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </AdminButton>
            <AdminButton
              onClick={() =>
                activeTab === "events"
                  ? handleOpenEventModal()
                  : handleOpenKepalaModal()
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "events" ? "Tambah Sejarah" : "Tambah Kepala Desa"}
            </AdminButton>
          </div>
        }
      />

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === "events"
              ? "text-orange-600 dark:text-orange-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Linimasa Sejarah
          </span>
          {activeTab === "events" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("kepala")}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === "kepala"
              ? "text-orange-600 dark:text-orange-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Kepala Desa
          </span>
          {activeTab === "kepala" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : activeTab === "events" ? (
        /* Events Table */
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Urutan
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Tahun
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Judul
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Kategori
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Highlight
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-right p-4 font-medium text-gray-600 dark:text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {sejarahEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Belum ada data sejarah. Klik &quot;Tambah Sejarah&quot; untuk menambah.
                    </td>
                  </tr>
                ) : (
                  sejarahEvents.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.urutan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {item.tahun}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <span className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {item.judul}
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {item.deskripsi}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 capitalize">
                          {KATEGORI_SEJARAH.find(k => k.value === item.kategori)?.label || item.kategori}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleEventHighlight(item)}
                          className="transition-colors"
                        >
                          {item.is_highlight ? (
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                          ) : (
                            <StarOff className="w-5 h-5 text-gray-400 hover:text-amber-500" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleEventStatus(item)}
                          className="transition-colors"
                        >
                          {item.is_active ? (
                            <ToggleRight className="w-8 h-8 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEventModal(item)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(item.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      ) : (
        /* Kepala Desa Table */
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Urutan
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Nama
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Periode
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Pencapaian
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-right p-4 font-medium text-gray-600 dark:text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {kepalaList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Belum ada data kepala desa. Klik &quot;Tambah Kepala Desa&quot; untuk menambah.
                    </td>
                  </tr>
                ) : (
                  kepalaList.map((item) => {
                    const isCurrent = !item.periode_selesai;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.urutan}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.nama}
                              </span>
                              {isCurrent && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                  Saat Ini
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.periode_mulai} - {item.periode_selesai || "Sekarang"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs">
                            {item.pencapaian || "-"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleKepalaStatus(item)}
                            className="transition-colors"
                          >
                            {item.is_active ? (
                              <ToggleRight className="w-8 h-8 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenKepalaModal(item)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKepala(item.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingEvent ? "Edit Sejarah" : "Tambah Sejarah"}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tahun"
                  placeholder="Contoh: 1945 atau 1950-1960"
                  value={eventForm.tahun}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, tahun: e.target.value })
                  }
                  required
                />
                <Input
                  label="Urutan"
                  type="number"
                  value={eventForm.urutan}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, urutan: e.target.value })
                  }
                />
              </div>

              <Input
                label="Judul"
                placeholder="Judul event sejarah"
                value={eventForm.judul}
                onChange={(e) =>
                  setEventForm({ ...eventForm, judul: e.target.value })
                }
                required
              />

              <Textarea
                label="Deskripsi"
                placeholder="Deskripsi lengkap event sejarah..."
                rows={4}
                value={eventForm.deskripsi}
                onChange={(e) =>
                  setEventForm({ ...eventForm, deskripsi: e.target.value })
                }
                required
              />

              <Select
                label="Kategori"
                options={kategoriOptions}
                value={eventForm.kategori}
                onChange={(e) =>
                  setEventForm({ ...eventForm, kategori: e.target.value })
                }
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eventForm.is_highlight}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, is_highlight: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Tandai sebagai momen penting (highlight)
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <AdminButton
                variant="outline"
                onClick={() => setIsEventModalOpen(false)}
              >
                Batal
              </AdminButton>
              <AdminButton
                onClick={handleSaveEventModal}
                disabled={isEventModalSaving}
              >
                {isEventModalSaving && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Simpan
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Kepala Modal */}
      {isKepalaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingKepala ? "Edit Kepala Desa" : "Tambah Kepala Desa"}
              </h3>
              <button
                onClick={() => setIsKepalaModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Input
                label="Nama Lengkap"
                placeholder="Nama kepala desa"
                value={kepalaForm.nama}
                onChange={(e) =>
                  setKepalaForm({ ...kepalaForm, nama: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Periode Mulai"
                  placeholder="Contoh: 1990"
                  value={kepalaForm.periode_mulai}
                  onChange={(e) =>
                    setKepalaForm({ ...kepalaForm, periode_mulai: e.target.value })
                  }
                  required
                />
                <Input
                  label="Periode Selesai"
                  placeholder="Kosongkan jika masih menjabat"
                  value={kepalaForm.periode_selesai}
                  onChange={(e) =>
                    setKepalaForm({ ...kepalaForm, periode_selesai: e.target.value })
                  }
                />
              </div>

              <Textarea
                label="Pencapaian"
                placeholder="Pencapaian selama menjabat..."
                rows={3}
                value={kepalaForm.pencapaian}
                onChange={(e) =>
                  setKepalaForm({ ...kepalaForm, pencapaian: e.target.value })
                }
              />

              <Textarea
                label="Keterangan"
                placeholder="Keterangan tambahan..."
                rows={2}
                value={kepalaForm.keterangan}
                onChange={(e) =>
                  setKepalaForm({ ...kepalaForm, keterangan: e.target.value })
                }
              />

              <Input
                label="Urutan"
                type="number"
                value={kepalaForm.urutan}
                onChange={(e) =>
                  setKepalaForm({ ...kepalaForm, urutan: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <AdminButton
                variant="outline"
                onClick={() => setIsKepalaModalOpen(false)}
              >
                Batal
              </AdminButton>
              <AdminButton
                onClick={handleSaveKepalaModal}
                disabled={isKepalaModalSaving}
              >
                {isKepalaModalSaving && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Simpan
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
