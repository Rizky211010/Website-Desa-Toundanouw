"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, AlertTriangle, RefreshCw, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import {
  FormSection,
  Input,
  Textarea,
  AdminButton,
} from "@/components/admin/admin-form";
import {
  getProfilDesa,
  updateProfilDesa,
  getStrukturPemerintahan,
  createStrukturPemerintahan,
  updateStrukturPemerintahan,
  deleteStrukturPemerintahan,
  type ProfilDesa,
  type StrukturPemerintahan,
} from "@/lib/profil-api";

export default function ProfilDesaPage() {
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data states
  const [profil, setProfil] = useState<ProfilDesa | null>(null);
  const [struktur, setStruktur] = useState<StrukturPemerintahan[]>([]);
  
  // Form states for profil
  const [profilForm, setProfilForm] = useState({
    nama_desa: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    deskripsi: "",
    visi: "",
    misi: "",
    sejarah: "",
    geografis: "",
    statistik_penduduk: "",
    luas_wilayah: "",
    alamat: "",
    telepon: "",
    email: "",
    website: "",
    kepala_desa: "",
    sekretaris_desa: "",
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StrukturPemerintahan | null>(null);
  const [modalForm, setModalForm] = useState({
    nama: "",
    jabatan: "",
    nip: "",
    email: "",
    telepon: "",
  });
  const [isModalSaving, setIsModalSaving] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profilRes, strukturRes] = await Promise.all([
        getProfilDesa().catch(() => null),
        getStrukturPemerintahan(),
      ]);

      if (profilRes?.data) {
        setProfil(profilRes.data);
        setProfilForm({
          nama_desa: profilRes.data.nama_desa || "",
          kecamatan: profilRes.data.kecamatan || "",
          kabupaten: profilRes.data.kabupaten || "",
          provinsi: profilRes.data.provinsi || "",
          deskripsi: profilRes.data.deskripsi || "",
          visi: profilRes.data.visi || "",
          misi: profilRes.data.misi || "",
          sejarah: profilRes.data.sejarah || "",
          geografis: profilRes.data.geografis || "",
          statistik_penduduk: profilRes.data.statistik_penduduk?.toString() || "",
          luas_wilayah: profilRes.data.luas_wilayah || "",
          alamat: profilRes.data.alamat || "",
          telepon: profilRes.data.telepon || "",
          email: profilRes.data.email || "",
          website: profilRes.data.website || "",
          kepala_desa: profilRes.data.kepala_desa || "",
          sekretaris_desa: profilRes.data.sekretaris_desa || "",
        });
      }

      setStruktur(strukturRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle save profil
  const handleSaveProfil = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Convert statistik_penduduk to number before sending
      const updateData = {
        ...profilForm,
        statistik_penduduk: profilForm.statistik_penduduk ? parseInt(profilForm.statistik_penduduk, 10) : null,
      };
      await updateProfilDesa(updateData);
      
      setSuccessMessage("Profil desa berhasil disimpan!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle status struktur
  const handleToggleStatus = async (item: StrukturPemerintahan) => {
    try {
      await updateStrukturPemerintahan(item.id, { is_active: !item.is_active });
      setStruktur(struktur.map(s => 
        s.id === item.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  // Handle delete struktur
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) return;
    
    try {
      await deleteStrukturPemerintahan(id);
      setStruktur(struktur.filter(item => item.id !== id));
      setSuccessMessage("Anggota berhasil dihapus!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus anggota");
    }
  };

  // Handle open modal for add/edit
  const handleOpenModal = (item?: StrukturPemerintahan) => {
    if (item) {
      setEditingItem(item);
      setModalForm({
        nama: item.nama,
        jabatan: item.jabatan,
        nip: item.nip || "",
        email: item.email || "",
        telepon: item.telepon || "",
      });
    } else {
      setEditingItem(null);
      setModalForm({ nama: "", jabatan: "", nip: "", email: "", telepon: "" });
    }
    setIsModalOpen(true);
  };

  // Handle save modal (create/update struktur)
  const handleSaveModal = async () => {
    if (!modalForm.nama || !modalForm.jabatan) {
      setError("Nama dan jabatan harus diisi");
      return;
    }

    try {
      setIsModalSaving(true);
      setError(null);

      if (editingItem) {
        // Update
        const result = await updateStrukturPemerintahan(editingItem.id, {
          nama: modalForm.nama,
          jabatan: modalForm.jabatan,
          nip: modalForm.nip || null,
          email: modalForm.email || null,
          telepon: modalForm.telepon || null,
        });
        setStruktur(struktur.map(s => 
          s.id === editingItem.id ? result.data : s
        ));
        setSuccessMessage("Anggota berhasil diperbarui!");
      } else {
        // Create
        const result = await createStrukturPemerintahan(
          modalForm.jabatan,
          modalForm.nama,
          modalForm.nip || undefined,
          modalForm.email || undefined,
          modalForm.telepon || undefined
        );
        setStruktur([...struktur, result.data]);
        setSuccessMessage("Anggota berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan anggota");
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
          <p className="mt-2 text-gray-500">Memuat data profil desa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Profil Desa"
        subtitle="Kelola informasi profil dan struktur pemerintahan desa"
        breadcrumb={[
          { label: "Konten Publik", href: "/admin/konten" },
          { label: "Profil Desa" },
        ]}
        actions={
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
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

      {/* Informasi Dasar */}
      <FormSection
        title="Informasi Dasar"
        description="Data dasar tentang desa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Nama Desa"
            value={profilForm.nama_desa}
            onChange={(e) => setProfilForm({ ...profilForm, nama_desa: e.target.value })}
            required
          />
          <Input
            label="Kecamatan"
            value={profilForm.kecamatan}
            onChange={(e) => setProfilForm({ ...profilForm, kecamatan: e.target.value })}
            required
          />
          <Input
            label="Kabupaten"
            value={profilForm.kabupaten}
            onChange={(e) => setProfilForm({ ...profilForm, kabupaten: e.target.value })}
            required
          />
          <Input
            label="Provinsi"
            value={profilForm.provinsi}
            onChange={(e) => setProfilForm({ ...profilForm, provinsi: e.target.value })}
            required
          />
          <Input
            label="Kepala Desa"
            value={profilForm.kepala_desa}
            onChange={(e) => setProfilForm({ ...profilForm, kepala_desa: e.target.value })}
          />
          <Input
            label="Sekretaris Desa"
            value={profilForm.sekretaris_desa}
            onChange={(e) => setProfilForm({ ...profilForm, sekretaris_desa: e.target.value })}
          />
        </div>
        <Textarea
          label="Deskripsi Desa"
          rows={4}
          value={profilForm.deskripsi}
          onChange={(e) => setProfilForm({ ...profilForm, deskripsi: e.target.value })}
          helperText="Tuliskan deskripsi singkat tentang desa"
        />
      </FormSection>

      {/* Statistik & Geografis */}
      <FormSection
        title="Statistik & Geografis"
        description="Data statistik dan kondisi geografis desa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Jumlah Penduduk"
            type="number"
            value={profilForm.statistik_penduduk}
            onChange={(e) => setProfilForm({ ...profilForm, statistik_penduduk: e.target.value })}
            helperText="Jumlah penduduk dalam jiwa"
          />
          <Input
            label="Luas Wilayah"
            value={profilForm.luas_wilayah}
            onChange={(e) => setProfilForm({ ...profilForm, luas_wilayah: e.target.value })}
            helperText="Contoh: 12,5 km²"
          />
        </div>
        <Textarea
          label="Kondisi Geografis"
          rows={4}
          value={profilForm.geografis}
          onChange={(e) => setProfilForm({ ...profilForm, geografis: e.target.value })}
          helperText="Deskripsikan kondisi geografis, batas wilayah, topografi, dll"
        />
      </FormSection>

      {/* Kontak */}
      <FormSection
        title="Informasi Kontak"
        description="Alamat dan kontak desa"
      >
        <Textarea
          label="Alamat Lengkap"
          rows={2}
          value={profilForm.alamat}
          onChange={(e) => setProfilForm({ ...profilForm, alamat: e.target.value })}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="Telepon"
            value={profilForm.telepon}
            onChange={(e) => setProfilForm({ ...profilForm, telepon: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profilForm.email}
            onChange={(e) => setProfilForm({ ...profilForm, email: e.target.value })}
          />
          <Input
            label="Website"
            value={profilForm.website}
            onChange={(e) => setProfilForm({ ...profilForm, website: e.target.value })}
          />
        </div>
      </FormSection>

      {/* Visi & Misi */}
      <FormSection
        title="Visi & Misi"
        description="Visi dan misi pemerintahan desa"
      >
        <Textarea
          label="Visi"
          rows={3}
          value={profilForm.visi}
          onChange={(e) => setProfilForm({ ...profilForm, visi: e.target.value })}
          helperText="Tuliskan visi desa dengan jelas dan inspiratif"
        />
        <Textarea
          label="Misi"
          rows={6}
          value={profilForm.misi}
          onChange={(e) => setProfilForm({ ...profilForm, misi: e.target.value })}
          helperText="Tuliskan misi dalam bentuk poin-poin"
        />
      </FormSection>

      {/* Sejarah Desa */}
      <FormSection
        title="Sejarah Desa"
        description="Sejarah singkat tentang desa"
      >
        <Textarea
          label="Sejarah"
          rows={8}
          value={profilForm.sejarah}
          onChange={(e) => setProfilForm({ ...profilForm, sejarah: e.target.value })}
          helperText="Tuliskan sejarah desa secara ringkas dan informatif"
        />
      </FormSection>

      {/* Tombol Simpan Profil */}
      <div className="flex justify-end">
        <AdminButton
          variant="primary"
          size="lg"
          onClick={handleSaveProfil}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Profil Desa"
          )}
        </AdminButton>
      </div>

      {/* Struktur Pemerintahan */}
      <AdminCard
        title="Struktur Pemerintahan"
        subtitle="Daftar perangkat desa"
        action={
          <AdminButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal()}
          >
            Tambah Anggota
          </AdminButton>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Jabatan
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {struktur.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Belum ada data struktur pemerintahan
                  </td>
                </tr>
              ) : (
                struktur.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-orange-600">
                            {item.nama.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{item.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{item.jabatan}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          item.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {item.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
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

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <AdminButton variant="outline" onClick={fetchData}>Batal</AdminButton>
        <AdminButton 
          variant="primary" 
          onClick={handleSaveProfil}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </AdminButton>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? "Edit Anggota" : "Tambah Anggota Baru"}
            </h3>
            <div className="space-y-4">
              <Input
                label="Nama Lengkap"
                value={modalForm.nama}
                onChange={(e) => setModalForm({ ...modalForm, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
              />
              <Input
                label="Jabatan"
                value={modalForm.jabatan}
                onChange={(e) => setModalForm({ ...modalForm, jabatan: e.target.value })}
                placeholder="Masukkan jabatan"
                required
              />
              <Input
                label="NIP (opsional)"
                value={modalForm.nip}
                onChange={(e) => setModalForm({ ...modalForm, nip: e.target.value })}
                placeholder="Masukkan NIP"
              />
              <Input
                label="Email (opsional)"
                type="email"
                value={modalForm.email}
                onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                placeholder="Masukkan email"
              />
              <Input
                label="Telepon (opsional)"
                value={modalForm.telepon}
                onChange={(e) => setModalForm({ ...modalForm, telepon: e.target.value })}
                placeholder="Masukkan nomor telepon"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
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
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  editingItem ? "Simpan" : "Tambah"
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
