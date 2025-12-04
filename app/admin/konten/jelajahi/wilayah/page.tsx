"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import {
  FormSection,
  Input,
  Textarea,
  AdminButton,
} from "@/components/admin/admin-form";
import { MapPin, Pencil, Trash2, X, Loader2, Plus, Layers } from "lucide-react";

interface WilayahData {
  id?: string;
  luas_wilayah: number | null;
  ketinggian: number | null;
  curah_hujan: number | null;
  suhu_min: number | null;
  suhu_max: number | null;
  batas_utara: string | null;
  batas_selatan: string | null;
  batas_barat: string | null;
  batas_timur: string | null;
  google_maps_url: string | null;
  google_maps_embed: string | null;
}

interface JagaData {
  id: string;
  nama: string;
  kepala_jaga: string | null;
  area: string | null;
  jumlah_kk: number;
  jumlah_jiwa: number;
  deskripsi: string | null;
  urutan: number;
  is_active: boolean;
}

interface PenggunaanLahanData {
  id: string;
  jenis: string;
  luas: number | null;
  persentase: number | null;
  urutan: number;
}

const initialWilayah: WilayahData = {
  luas_wilayah: null,
  ketinggian: null,
  curah_hujan: null,
  suhu_min: null,
  suhu_max: null,
  batas_utara: "",
  batas_selatan: "",
  batas_barat: "",
  batas_timur: "",
  google_maps_url: "",
  google_maps_embed: "",
};

const initialJaga: Omit<JagaData, "id" | "urutan" | "is_active"> = {
  nama: "",
  kepala_jaga: "",
  area: "",
  jumlah_kk: 0,
  jumlah_jiwa: 0,
  deskripsi: "",
};

const initialPenggunaanLahan: Omit<PenggunaanLahanData, "id" | "urutan"> = {
  jenis: "",
  luas: null,
  persentase: null,
};

export default function WilayahPage() {
  const [wilayah, setWilayah] = useState<WilayahData>(initialWilayah);
  const [jagaList, setJagaList] = useState<JagaData[]>([]);
  const [penggunaanLahanList, setPenggunaanLahanList] = useState<PenggunaanLahanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal state for Jaga
  const [showJagaModal, setShowJagaModal] = useState(false);
  const [editingJaga, setEditingJaga] = useState<JagaData | null>(null);
  const [jagaForm, setJagaForm] = useState(initialJaga);
  const [savingJaga, setSavingJaga] = useState(false);
  const [deletingJagaId, setDeletingJagaId] = useState<string | null>(null);

  // Modal state for Penggunaan Lahan
  const [showLahanModal, setShowLahanModal] = useState(false);
  const [editingLahan, setEditingLahan] = useState<PenggunaanLahanData | null>(null);
  const [lahanForm, setLahanForm] = useState(initialPenggunaanLahan);
  const [savingLahan, setSavingLahan] = useState(false);
  const [deletingLahanId, setDeletingLahanId] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wilayahRes, jagaRes, lahanRes] = await Promise.all([
        fetch("/api/wilayah"),
        fetch("/api/jaga"),
        fetch("/api/penggunaan-lahan"),
      ]);

      if (wilayahRes.ok) {
        const wilayahData = await wilayahRes.json();
        if (wilayahData.data) {
          setWilayah(wilayahData.data);
        }
      }

      if (jagaRes.ok) {
        const jagaData = await jagaRes.json();
        setJagaList(jagaData.data || []);
      }

      if (lahanRes.ok) {
        const lahanData = await lahanRes.json();
        setPenggunaanLahanList(lahanData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Gagal memuat data" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch only jaga data (to avoid resetting other unsaved changes)
  const fetchJagaOnly = useCallback(async () => {
    try {
      const response = await fetch("/api/jaga");
      if (response.ok) {
        const data = await response.json();
        setJagaList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching jaga:", error);
    }
  }, []);

  // Fetch only penggunaan lahan data (to avoid resetting other unsaved changes)
  const fetchLahanOnly = useCallback(async () => {
    try {
      const response = await fetch("/api/penggunaan-lahan");
      if (response.ok) {
        const data = await response.json();
        setPenggunaanLahanList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching penggunaan lahan:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save wilayah data
  const handleSaveWilayah = async () => {
    try {
      setSaving(true);
      
      // Prepare data - ensure proper types
      const dataToSave = {
        luas_wilayah: wilayah.luas_wilayah,
        ketinggian: wilayah.ketinggian,
        curah_hujan: wilayah.curah_hujan,
        suhu_min: wilayah.suhu_min,
        suhu_max: wilayah.suhu_max,
        batas_utara: wilayah.batas_utara || null,
        batas_selatan: wilayah.batas_selatan || null,
        batas_barat: wilayah.batas_barat || null,
        batas_timur: wilayah.batas_timur || null,
        google_maps_url: wilayah.google_maps_url || null,
        google_maps_embed: wilayah.google_maps_embed || null,
      };
      
      const response = await fetch("/api/wilayah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Data wilayah berhasil disimpan" });
        // Update local state with saved data
        if (result.data) {
          setWilayah(result.data);
        }
      } else {
        setMessage({ type: "error", text: result.error || "Gagal menyimpan data wilayah" });
      }
    } catch (error) {
      console.error("Error saving wilayah:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Jaga CRUD operations
  const openAddJagaModal = () => {
    setEditingJaga(null);
    setJagaForm(initialJaga);
    setShowJagaModal(true);
  };

  const openEditJagaModal = (jaga: JagaData) => {
    setEditingJaga(jaga);
    setJagaForm({
      nama: jaga.nama,
      kepala_jaga: jaga.kepala_jaga || "",
      area: jaga.area || "",
      jumlah_kk: jaga.jumlah_kk,
      jumlah_jiwa: jaga.jumlah_jiwa,
      deskripsi: jaga.deskripsi || "",
    });
    setShowJagaModal(true);
  };

  const closeJagaModal = () => {
    setShowJagaModal(false);
    setEditingJaga(null);
    setJagaForm(initialJaga);
  };

  const handleSaveJaga = async () => {
    if (!jagaForm.nama.trim()) {
      setMessage({ type: "error", text: "Nama jaga harus diisi" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSavingJaga(true);
      const url = editingJaga ? `/api/jaga/${editingJaga.id}` : "/api/jaga";
      const method = editingJaga ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jagaForm),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingJaga ? "Jaga berhasil diupdate" : "Jaga berhasil ditambahkan",
        });
        closeJagaModal();
        // Only refresh jaga data, not all data
        fetchJagaOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan jaga" });
      }
    } catch (error) {
      console.error("Error saving jaga:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSavingJaga(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteJaga = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jaga ini?")) return;

    try {
      setDeletingJagaId(id);
      const response = await fetch(`/api/jaga/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Jaga berhasil dihapus" });
        // Only refresh jaga data, not all data
        fetchJagaOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menghapus jaga" });
      }
    } catch (error) {
      console.error("Error deleting jaga:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setDeletingJagaId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Penggunaan Lahan CRUD operations
  const openAddLahanModal = () => {
    setEditingLahan(null);
    setLahanForm(initialPenggunaanLahan);
    setShowLahanModal(true);
  };

  const openEditLahanModal = (lahan: PenggunaanLahanData) => {
    setEditingLahan(lahan);
    setLahanForm({
      jenis: lahan.jenis,
      luas: lahan.luas,
      persentase: lahan.persentase,
    });
    setShowLahanModal(true);
  };

  const closeLahanModal = () => {
    setShowLahanModal(false);
    setEditingLahan(null);
    setLahanForm(initialPenggunaanLahan);
  };

  const handleSaveLahan = async () => {
    if (!lahanForm.jenis.trim()) {
      setMessage({ type: "error", text: "Jenis penggunaan lahan harus diisi" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSavingLahan(true);
      const url = editingLahan ? `/api/penggunaan-lahan/${editingLahan.id}` : "/api/penggunaan-lahan";
      const method = editingLahan ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lahanForm),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingLahan ? "Penggunaan lahan berhasil diupdate" : "Penggunaan lahan berhasil ditambahkan",
        });
        closeLahanModal();
        // Only refresh lahan data, not all data
        fetchLahanOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan penggunaan lahan" });
      }
    } catch (error) {
      console.error("Error saving penggunaan lahan:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSavingLahan(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteLahan = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus penggunaan lahan ini?")) return;

    try {
      setDeletingLahanId(id);
      const response = await fetch(`/api/penggunaan-lahan/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Penggunaan lahan berhasil dihapus" });
        // Only refresh lahan data, not all data
        fetchLahanOnly();
      } else {
        setMessage({ type: "error", text: "Gagal menghapus penggunaan lahan" });
      }
    } catch (error) {
      console.error("Error deleting penggunaan lahan:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setDeletingLahanId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Wilayah Desa"
        subtitle="Kelola data geografis dan pembagian wilayah desa"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Jelajahi", href: "/admin/konten/jelajahi" },
          { label: "Wilayah Desa" },
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

      {/* Data Geografis */}
      <FormSection
        title="Data Geografis"
        description="Informasi geografis tentang desa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Input
            label="Luas Wilayah (km²)"
            type="number"
            step="0.1"
            value={wilayah.luas_wilayah ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setWilayah({ ...wilayah, luas_wilayah: val === "" ? null : parseFloat(val) });
            }}
          />
          <Input
            label="Ketinggian (mdpl)"
            type="number"
            value={wilayah.ketinggian ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setWilayah({ ...wilayah, ketinggian: val === "" ? null : parseInt(val) });
            }}
          />
          <Input
            label="Curah Hujan (mm/tahun)"
            type="number"
            value={wilayah.curah_hujan ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setWilayah({ ...wilayah, curah_hujan: val === "" ? null : parseInt(val) });
            }}
          />
          <div className="flex gap-2">
            <Input
              label="Suhu Min (°C)"
              type="number"
              value={wilayah.suhu_min ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setWilayah({ ...wilayah, suhu_min: val === "" ? null : parseInt(val) });
              }}
            />
            <Input
              label="Suhu Max (°C)"
              type="number"
              value={wilayah.suhu_max ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setWilayah({ ...wilayah, suhu_max: val === "" ? null : parseInt(val) });
              }}
            />
          </div>
        </div>
      </FormSection>

      {/* Batas Wilayah */}
      <FormSection
        title="Batas Wilayah"
        description="Desa yang berbatasan dengan Desa Toundanouw"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Sebelah Utara"
            value={wilayah.batas_utara || ""}
            onChange={(e) => setWilayah({ ...wilayah, batas_utara: e.target.value })}
            placeholder="Nama desa sebelah utara"
          />
          <Input
            label="Sebelah Selatan"
            value={wilayah.batas_selatan || ""}
            onChange={(e) => setWilayah({ ...wilayah, batas_selatan: e.target.value })}
            placeholder="Nama desa sebelah selatan"
          />
          <Input
            label="Sebelah Barat"
            value={wilayah.batas_barat || ""}
            onChange={(e) => setWilayah({ ...wilayah, batas_barat: e.target.value })}
            placeholder="Nama desa sebelah barat"
          />
          <Input
            label="Sebelah Timur"
            value={wilayah.batas_timur || ""}
            onChange={(e) => setWilayah({ ...wilayah, batas_timur: e.target.value })}
            placeholder="Nama desa sebelah timur"
          />
        </div>
      </FormSection>

      {/* Daftar Dusun/Jaga */}
      <AdminCard
        title="Daftar Dusun/Jaga"
        subtitle="Pembagian wilayah desa"
        action={
          <AdminButton variant="primary" size="sm" onClick={openAddJagaModal}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Jaga
          </AdminButton>
        }
      >
        {jagaList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada data jaga</p>
            <p className="text-sm">Klik tombol &quot;Tambah Jaga&quot; untuk menambahkan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jagaList.map((jaga) => (
              <div
                key={jaga.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{jaga.nama}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {jaga.kepala_jaga || "-"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Area: {jaga.area || "-"}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>KK: {jaga.jumlah_kk}</span>
                      <span>Jiwa: {jaga.jumlah_jiwa}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditJagaModal(jaga)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJaga(jaga.id)}
                      disabled={deletingJagaId === jaga.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingJagaId === jaga.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Penggunaan Lahan */}
      <AdminCard
        title="Penggunaan Lahan"
        subtitle="Data penggunaan lahan di wilayah desa"
        action={
          <AdminButton variant="primary" size="sm" onClick={openAddLahanModal}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Lahan
          </AdminButton>
        }
      >
        {penggunaanLahanList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada data penggunaan lahan</p>
            <p className="text-sm">Klik tombol &quot;Tambah Lahan&quot; untuk menambahkan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {penggunaanLahanList.map((lahan) => (
              <div
                key={lahan.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Layers className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{lahan.jenis}</h4>
                    <div className="flex gap-3 mt-2 text-sm text-gray-600">
                      <span>{lahan.luas ? `${lahan.luas} km²` : "-"}</span>
                      <span>({lahan.persentase ? `${lahan.persentase}%` : "-"})</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditLahanModal(lahan)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLahan(lahan.id)}
                      disabled={deletingLahanId === lahan.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingLahanId === lahan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Peta Wilayah */}
      <AdminCard title="Peta Wilayah" subtitle="Embed Google Maps atau peta desa">
        <div className="space-y-4">
          <Input
            label="Link Google Maps"
            value={wilayah.google_maps_url || ""}
            onChange={(e) =>
              setWilayah({ ...wilayah, google_maps_url: e.target.value })
            }
            placeholder="https://maps.google.com/..."
            helperText="Salin link dari Google Maps"
          />
          <Textarea
            label="Embed Code Google Maps"
            value={wilayah.google_maps_embed || ""}
            onChange={(e) =>
              setWilayah({ ...wilayah, google_maps_embed: e.target.value })
            }
            placeholder='<iframe src="https://www.google.com/maps/embed?..." ...'
            helperText="Salin kode embed dari Google Maps (Share > Embed a map)"
            rows={4}
          />
          <div className="h-80 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
            {wilayah.google_maps_embed ? (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: wilayah.google_maps_embed }}
              />
            ) : (
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Preview peta akan muncul di sini</p>
                <p className="text-sm text-gray-400 mt-1">
                  Masukkan embed code Google Maps untuk menampilkan peta
                </p>
              </div>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <AdminButton variant="outline" onClick={() => fetchData()}>
          Batal
        </AdminButton>
        <AdminButton variant="primary" onClick={handleSaveWilayah} disabled={saving}>
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

      {/* Jaga Modal */}
      {showJagaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingJaga ? "Edit Jaga" : "Tambah Jaga Baru"}
              </h3>
              <button
                onClick={closeJagaModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Input
                label="Nama Jaga"
                value={jagaForm.nama}
                onChange={(e) => setJagaForm({ ...jagaForm, nama: e.target.value })}
                placeholder="Contoh: Jaga I"
                required
              />
              <Input
                label="Kepala Jaga"
                value={jagaForm.kepala_jaga || ""}
                onChange={(e) =>
                  setJagaForm({ ...jagaForm, kepala_jaga: e.target.value })
                }
                placeholder="Nama kepala jaga"
              />
              <Input
                label="Area/Lokasi"
                value={jagaForm.area || ""}
                onChange={(e) => setJagaForm({ ...jagaForm, area: e.target.value })}
                placeholder="Contoh: Pusat Desa, Utara, Selatan"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Jumlah KK"
                  type="number"
                  value={jagaForm.jumlah_kk}
                  onChange={(e) =>
                    setJagaForm({ ...jagaForm, jumlah_kk: parseInt(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Jumlah Jiwa"
                  type="number"
                  value={jagaForm.jumlah_jiwa}
                  onChange={(e) =>
                    setJagaForm({
                      ...jagaForm,
                      jumlah_jiwa: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <Textarea
                label="Deskripsi (Opsional)"
                value={jagaForm.deskripsi || ""}
                onChange={(e) =>
                  setJagaForm({ ...jagaForm, deskripsi: e.target.value })
                }
                placeholder="Deskripsi singkat tentang jaga ini"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <AdminButton variant="outline" onClick={closeJagaModal}>
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSaveJaga}
                disabled={savingJaga}
              >
                {savingJaga ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingJaga ? (
                  "Update Jaga"
                ) : (
                  "Tambah Jaga"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Penggunaan Lahan Modal */}
      {showLahanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLahan ? "Edit Penggunaan Lahan" : "Tambah Penggunaan Lahan"}
              </h3>
              <button
                onClick={closeLahanModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Input
                label="Jenis Penggunaan"
                value={lahanForm.jenis}
                onChange={(e) => setLahanForm({ ...lahanForm, jenis: e.target.value })}
                placeholder="Contoh: Pemukiman, Pertanian, Hutan"
                required
              />
              <Input
                label="Luas (km²)"
                type="number"
                step="0.1"
                value={lahanForm.luas ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setLahanForm({ ...lahanForm, luas: val === "" ? null : parseFloat(val) });
                }}
                placeholder="Contoh: 2.5"
              />
              <Input
                label="Persentase (%)"
                type="number"
                step="0.1"
                value={lahanForm.persentase ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setLahanForm({ ...lahanForm, persentase: val === "" ? null : parseFloat(val) });
                }}
                placeholder="Contoh: 20"
              />
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <AdminButton variant="outline" onClick={closeLahanModal}>
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSaveLahan}
                disabled={savingLahan}
              >
                {savingLahan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingLahan ? (
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
