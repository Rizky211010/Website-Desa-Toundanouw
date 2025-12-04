"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Users, Loader2, AlertTriangle, RefreshCw, X, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminButton, Input, Textarea, Select } from "@/components/admin/admin-form";
import {
  getOrganisasiList,
  createOrganisasi,
  updateOrganisasi,
  deleteOrganisasi,
  type Organisasi,
} from "@/lib/organisasi-api";

const kategoriOptions = [
  { value: "lembaga_desa", label: "Lembaga Desa" },
  { value: "organisasi_masyarakat", label: "Organisasi Masyarakat" },
  { value: "kelompok_usaha", label: "Kelompok Usaha" },
];

export default function OrganisasiPage() {
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data states
  const [organisasi, setOrganisasi] = useState<Organisasi[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Organisasi | null>(null);
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [modalForm, setModalForm] = useState({
    nama: "",
    singkatan: "",
    ketua: "",
    wakil_ketua: "",
    sekretaris: "",
    bendahara: "",
    jumlah_anggota: "",
    deskripsi: "",
    alamat: "",
    telepon: "",
    email: "",
    kategori: "organisasi_masyarakat",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getOrganisasiList(true);
      setOrganisasi(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle toggle status
  const handleToggleStatus = async (item: Organisasi) => {
    try {
      await updateOrganisasi(item.id, { is_active: !item.is_active });
      setOrganisasi(organisasi.map(o => 
        o.id === item.id ? { ...o, is_active: !o.is_active } : o
      ));
      setSuccessMessage(`Status organisasi berhasil diubah`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus organisasi ini?")) return;
    
    try {
      await deleteOrganisasi(id);
      setOrganisasi(organisasi.filter(item => item.id !== id));
      setSuccessMessage("Organisasi berhasil dihapus!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus organisasi");
    }
  };

  // Handle open modal
  const handleOpenModal = (item?: Organisasi) => {
    if (item) {
      setEditingItem(item);
      setModalForm({
        nama: item.nama,
        singkatan: item.singkatan || "",
        ketua: item.ketua,
        wakil_ketua: item.wakil_ketua || "",
        sekretaris: item.sekretaris || "",
        bendahara: item.bendahara || "",
        jumlah_anggota: item.jumlah_anggota?.toString() || "",
        deskripsi: item.deskripsi || "",
        alamat: item.alamat || "",
        telepon: item.telepon || "",
        email: item.email || "",
        kategori: item.kategori || "organisasi_masyarakat",
      });
    } else {
      setEditingItem(null);
      setModalForm({
        nama: "",
        singkatan: "",
        ketua: "",
        wakil_ketua: "",
        sekretaris: "",
        bendahara: "",
        jumlah_anggota: "",
        deskripsi: "",
        alamat: "",
        telepon: "",
        email: "",
        kategori: "organisasi_masyarakat",
      });
    }
    setIsModalOpen(true);
  };

  // Handle save modal
  const handleSaveModal = async () => {
    if (!modalForm.nama || !modalForm.ketua) {
      setError("Nama organisasi dan ketua harus diisi");
      return;
    }

    try {
      setIsModalSaving(true);
      setError(null);

      const payload = {
        nama: modalForm.nama,
        singkatan: modalForm.singkatan || undefined,
        ketua: modalForm.ketua,
        wakil_ketua: modalForm.wakil_ketua || undefined,
        sekretaris: modalForm.sekretaris || undefined,
        bendahara: modalForm.bendahara || undefined,
        jumlah_anggota: modalForm.jumlah_anggota ? parseInt(modalForm.jumlah_anggota, 10) : 0,
        deskripsi: modalForm.deskripsi || undefined,
        alamat: modalForm.alamat || undefined,
        telepon: modalForm.telepon || undefined,
        email: modalForm.email || undefined,
        kategori: modalForm.kategori,
      };

      if (editingItem) {
        const result = await updateOrganisasi(editingItem.id, payload);
        setOrganisasi(organisasi.map(o => 
          o.id === editingItem.id ? result.data : o
        ));
        setSuccessMessage("Organisasi berhasil diperbarui!");
      } else {
        const result = await createOrganisasi(payload);
        setOrganisasi([...organisasi, result.data]);
        setSuccessMessage("Organisasi berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan organisasi");
    } finally {
      setIsModalSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-2 text-gray-500">Memuat data organisasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Organisasi Desa"
        subtitle="Kelola data lembaga dan organisasi di desa"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Jelajahi", href: "/admin/konten/jelajahi" },
          { label: "Organisasi Desa" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <AdminButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenModal()}
            >
              Tambah Organisasi
            </AdminButton>
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Organisasi Table */}
      <AdminCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Organisasi
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ketua
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Anggota
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {organisasi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Belum ada organisasi</p>
                    <p className="text-sm">Klik tombol &quot;Tambah Organisasi&quot; untuk menambahkan</p>
                  </td>
                </tr>
              ) : (
                organisasi.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{item.nama}</span>
                          {item.singkatan && (
                            <span className="text-xs text-gray-500">({item.singkatan})</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.ketua}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {kategoriOptions.find(k => k.value === item.kategori)?.label || item.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        <Users className="w-3.5 h-3.5" />
                        {item.jumlah_anggota}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          item.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {item.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Hapus"
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

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? "Edit Organisasi" : "Tambah Organisasi Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Organisasi"
                  value={modalForm.nama}
                  onChange={(e) => setModalForm({ ...modalForm, nama: e.target.value })}
                  placeholder="Contoh: Karang Taruna"
                  required
                />
                <Input
                  label="Singkatan"
                  value={modalForm.singkatan}
                  onChange={(e) => setModalForm({ ...modalForm, singkatan: e.target.value })}
                  placeholder="Contoh: KT"
                />
              </div>

              <Select
                label="Kategori"
                value={modalForm.kategori}
                onChange={(e) => setModalForm({ ...modalForm, kategori: e.target.value })}
                options={kategoriOptions}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Ketua"
                  value={modalForm.ketua}
                  onChange={(e) => setModalForm({ ...modalForm, ketua: e.target.value })}
                  placeholder="Masukkan nama ketua"
                  required
                />
                <Input
                  label="Wakil Ketua"
                  value={modalForm.wakil_ketua}
                  onChange={(e) => setModalForm({ ...modalForm, wakil_ketua: e.target.value })}
                  placeholder="Masukkan nama wakil ketua"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sekretaris"
                  value={modalForm.sekretaris}
                  onChange={(e) => setModalForm({ ...modalForm, sekretaris: e.target.value })}
                  placeholder="Masukkan nama sekretaris"
                />
                <Input
                  label="Bendahara"
                  value={modalForm.bendahara}
                  onChange={(e) => setModalForm({ ...modalForm, bendahara: e.target.value })}
                  placeholder="Masukkan nama bendahara"
                />
              </div>

              <Input
                label="Jumlah Anggota"
                type="number"
                value={modalForm.jumlah_anggota}
                onChange={(e) => setModalForm({ ...modalForm, jumlah_anggota: e.target.value })}
                placeholder="0"
              />

              <Textarea
                label="Deskripsi"
                value={modalForm.deskripsi}
                onChange={(e) => setModalForm({ ...modalForm, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang organisasi"
                rows={3}
              />

              <Input
                label="Alamat Sekretariat"
                value={modalForm.alamat}
                onChange={(e) => setModalForm({ ...modalForm, alamat: e.target.value })}
                placeholder="Alamat kantor/sekretariat"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Telepon"
                  value={modalForm.telepon}
                  onChange={(e) => setModalForm({ ...modalForm, telepon: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
                <Input
                  label="Email"
                  type="email"
                  value={modalForm.email}
                  onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSaveModal}
                disabled={isModalSaving}
              >
                {isModalSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  editingItem ? "Simpan Perubahan" : "Tambah Organisasi"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
