"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Image as ImageIcon,
  Type,
  MousePointer,
  Upload,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Edit2,
  X,
  Loader2,
  ExternalLink,
  Info,
  Sparkles,
} from "lucide-react";
import { AdminPageHeader, AdminCard } from "@/components/admin";

interface HeroSlide {
  id: string;
  order_index: number;
  headline: string;
  subheadline: string | null;
  image_url: string | null;
  primary_button_text: string | null;
  primary_button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const defaultSlide: Partial<HeroSlide> = {
  headline: "",
  subheadline: "",
  image_url: "",
  primary_button_text: "",
  primary_button_url: "",
  secondary_button_text: "",
  secondary_button_url: "",
  is_active: true,
};

export default function HeroSettingsPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  // Edit state
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch slides
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/hero-slides?active=false');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengambil data slides');
      }

      setSlides(result.data || []);
    } catch (err) {
      console.error('Error fetching slides:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Save slide (create or update)
  const saveSlide = async () => {
    if (!editingSlide?.headline) {
      alert('Headline harus diisi');
      return;
    }

    try {
      setSaving(true);

      const url = isNew ? '/api/hero-slides' : `/api/hero-slides/${editingSlide.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSlide),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan slide');
      }

      await fetchSlides();
      setEditingSlide(null);
      setIsNew(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving slide:', err);
      alert(err instanceof Error ? err.message : 'Gagal menyimpan slide');
    } finally {
      setSaving(false);
    }
  };

  // Delete slide
  const deleteSlide = async (id: string) => {
    if (slides.length <= 1) {
      alert('Minimal harus ada 1 slide');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus slide ini?')) return;

    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus slide');
      }

      await fetchSlides();
      
      if (editingSlide?.id === id) {
        setEditingSlide(null);
      }
      setActiveSlideIndex(0);
    } catch (err) {
      console.error('Error deleting slide:', err);
      alert(err instanceof Error ? err.message : 'Gagal menghapus slide');
    }
  };

  // Toggle slide active
  const toggleActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/hero-slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !slide.is_active }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal mengubah status');
      }

      await fetchSlides();
    } catch (err) {
      console.error('Error toggling active:', err);
      alert(err instanceof Error ? err.message : 'Gagal mengubah status');
    }
  };

  // Move slide up/down
  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

    // Update order_index
    const reorderedSlides = newSlides.map((slide, i) => ({
      ...slide,
      order_index: i + 1,
    }));

    setSlides(reorderedSlides);
    setActiveSlideIndex(targetIndex);

    // Save to API
    try {
      await fetch('/api/hero-slides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: reorderedSlides.map((s) => ({ id: s.id, order_index: s.order_index })),
        }),
      });
    } catch (err) {
      console.error('Error reordering:', err);
      fetchSlides(); // Refresh on error
    }
  };

  // Add new slide
  const addNewSlide = () => {
    if (slides.length >= 5) {
      alert('Maksimal 5 slide diizinkan');
      return;
    }
    setEditingSlide({ ...defaultSlide });
    setIsNew(true);
  };

  // Seed template slides
  const seedSlides = async () => {
    if (slides.length > 0) {
      const confirmed = confirm('Ini akan menghapus semua slide yang ada dan menggantinya dengan template baru. Lanjutkan?');
      if (!confirmed) return;

      // Delete all existing slides first
      try {
        setSeeding(true);
        const deleteResponse = await fetch('/api/hero-slides/seed', {
          method: 'DELETE',
        });

        if (!deleteResponse.ok) {
          const result = await deleteResponse.json();
          throw new Error(result.error || 'Gagal menghapus slides');
        }
      } catch (err) {
        console.error('Error deleting slides:', err);
        alert(err instanceof Error ? err.message : 'Gagal menghapus slides');
        setSeeding(false);
        return;
      }
    }

    try {
      setSeeding(true);
      const response = await fetch('/api/hero-slides/seed', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat template slides');
      }

      await fetchSlides();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error seeding slides:', err);
      alert(err instanceof Error ? err.message : 'Gagal membuat template slides');
    } finally {
      setSeeding(false);
    }
  };

  // Edit existing slide
  const editSlide = (slide: HeroSlide, index: number) => {
    setEditingSlide({ ...slide });
    setIsNew(false);
    setActiveSlideIndex(index);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSlide(null);
    setIsNew(false);
  };

  // Handle input change
  const handleChange = (field: keyof HeroSlide, value: string | boolean) => {
    if (!editingSlide) return;
    setEditingSlide({ ...editingSlide, [field]: value });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Hanya file JPG, PNG, atau WebP yang diizinkan');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'hero-images');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengupload gambar');
      }

      // Update image_url with the uploaded URL
      handleChange('image_url', result.url);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Gagal mengupload gambar');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const currentSlide = slides[activeSlideIndex];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengaturan Hero Banner"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Pengaturan" },
          { label: "Hero Banner" },
        ]}
      />

      {/* Success Alert */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Pengaturan hero banner berhasil disimpan!</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchSlides}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="mt-4 text-gray-500">Memuat data slides...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Slide List */}
          <div className="xl:col-span-1">
            <AdminCard title="Daftar Slide" subtitle="Kelola slide hero banner">
              <div className="space-y-3 mb-4">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => {
                      setActiveSlideIndex(index);
                      setEditingSlide(null);
                    }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      activeSlideIndex === index
                        ? "border-[#F28A2E] bg-orange-50"
                        : "border-gray-100 hover:border-gray-200"
                    } ${!slide.is_active ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Order Controls */}
                      <div className="flex flex-col">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSlide(index, 'up'); }}
                          disabled={index === 0}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSlide(index, 'down'); }}
                          disabled={index === slides.length - 1}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                      
                      {/* Thumbnail */}
                      <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden shrink-0">
                        {slide.image_url ? (
                          <img
                            src={slide.image_url}
                            alt={slide.headline}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Slide {index + 1}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {slide.headline}
                        </p>
                      </div>
                      
                      {/* Status */}
                      <div
                        className={`w-2 h-2 rounded-full ${
                          slide.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addNewSlide}
                  disabled={slides.length >= 5}
                  className="flex-1 py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-[#F28A2E] hover:text-[#F28A2E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Slide
                </button>
                <button
                  onClick={seedSlides}
                  disabled={seeding}
                  className="py-2 px-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm hover:from-purple-600 hover:to-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  title="Buat 5 template slide otomatis"
                >
                  {seeding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {seeding ? 'Loading...' : 'Template'}
                </button>
              </div>
            </AdminCard>

            {/* Tips */}
            <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-[#F28A2E] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Tips</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Gunakan gambar berukuran 1920x600 px</li>
                    <li>• Maksimal 5 slide untuk performa optimal</li>
                    <li>• Headline singkat, maksimal 10 kata</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Editor */}
          <div className="xl:col-span-2 space-y-6">
            {/* Preview */}
            <AdminCard title="Preview Slide" padding="none">
              <div className="relative h-64 bg-gradient-to-r from-gray-900 to-gray-700 rounded-b-lg overflow-hidden">
                {/* Background Image */}
                {(editingSlide?.image_url || currentSlide?.image_url) && (
                  <img
                    src={editingSlide?.image_url || currentSlide?.image_url || ''}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {editingSlide?.headline || currentSlide?.headline || "Judul Headline"}
                  </h2>
                  <p className="text-sm md:text-base text-white/80 mb-4">
                    {editingSlide?.subheadline || currentSlide?.subheadline || "Subjudul atau deskripsi singkat"}
                  </p>
                  <div className="flex gap-3">
                    {(editingSlide?.primary_button_text || currentSlide?.primary_button_text) && (
                      <span className="px-4 py-2 bg-[#F28A2E] text-white text-sm rounded-lg">
                        {editingSlide?.primary_button_text || currentSlide?.primary_button_text}
                      </span>
                    )}
                    {(editingSlide?.secondary_button_text || currentSlide?.secondary_button_text) && (
                      <span className="px-4 py-2 border border-white text-white text-sm rounded-lg">
                        {editingSlide?.secondary_button_text || currentSlide?.secondary_button_text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      (editingSlide?.is_active ?? currentSlide?.is_active)
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {(editingSlide?.is_active ?? currentSlide?.is_active) ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </AdminCard>

            {/* Editor Form */}
            {(editingSlide || currentSlide) && (
              <AdminCard 
                title={editingSlide ? (isNew ? 'Tambah Slide Baru' : `Edit Slide ${activeSlideIndex + 1}`) : `Slide ${activeSlideIndex + 1}`}
                action={
                  !editingSlide && currentSlide ? (
                    <button
                      onClick={() => editSlide(currentSlide, activeSlideIndex)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : editingSlide ? (
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : null
                }
              >
                {editingSlide ? (
                  <div className="space-y-5">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ImageIcon className="w-4 h-4 inline-block mr-2 text-gray-400" />
                        Gambar Background
                      </label>
                      
                      {/* Current Image Preview */}
                      {editingSlide.image_url && (
                        <div className="mb-3 relative">
                          <img
                            src={editingSlide.image_url}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleChange('image_url', '')}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* Upload Area */}
                      <div 
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                          uploading ? 'border-gray-300 bg-gray-50' : 'border-gray-200 hover:border-[#F28A2E]'
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-[#F28A2E] mx-auto mb-2 animate-spin" />
                            <p className="text-sm text-gray-600">Mengupload gambar...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">
                              Klik untuk upload atau drag & drop
                            </p>
                            <p className="text-xs text-gray-400">
                              JPG, PNG, atau WebP. Max 5MB. Rekomendasi: 1920 x 600 px
                            </p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      
                      {/* Upload Error */}
                      {uploadError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{uploadError}</p>
                        </div>
                      )}
                      
                      {/* Manual URL Input */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Atau masukkan URL gambar secara manual:</p>
                        <input
                          type="text"
                          value={editingSlide.image_url || ''}
                          onChange={(e) => handleChange('image_url', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                        />
                      </div>
                    </div>

                    {/* Headline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Type className="w-4 h-4 inline-block mr-2 text-gray-400" />
                        Headline <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingSlide.headline || ''}
                        onChange={(e) => handleChange('headline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                        placeholder="Judul utama slide"
                      />
                    </div>

                    {/* Subheadline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-headline
                      </label>
                      <input
                        type="text"
                        value={editingSlide.subheadline || ''}
                        onChange={(e) => handleChange('subheadline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                        placeholder="Deskripsi singkat"
                      />
                    </div>

                    {/* CTA Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          <MousePointer className="w-4 h-4 inline-block mr-2 text-gray-400" />
                          Tombol Utama
                        </p>
                        <input
                          type="text"
                          value={editingSlide.primary_button_text || ''}
                          onChange={(e) => handleChange('primary_button_text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                          placeholder="Teks tombol"
                        />
                        <input
                          type="text"
                          value={editingSlide.primary_button_url || ''}
                          onChange={(e) => handleChange('primary_button_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                          placeholder="Link tujuan (contoh: /profil)"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          Tombol Sekunder (Opsional)
                        </p>
                        <input
                          type="text"
                          value={editingSlide.secondary_button_text || ''}
                          onChange={(e) => handleChange('secondary_button_text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                          placeholder="Teks tombol"
                        />
                        <input
                          type="text"
                          value={editingSlide.secondary_button_url || ''}
                          onChange={(e) => handleChange('secondary_button_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F28A2E]/20 focus:border-[#F28A2E]"
                          placeholder="Link tujuan"
                        />
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleChange('is_active', !editingSlide.is_active)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            editingSlide.is_active ? 'bg-[#F28A2E]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              editingSlide.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-700">
                          Tampilkan slide ini
                        </span>
                      </div>
                      {!isNew && (
                        <button
                          onClick={() => deleteSlide(editingSlide.id!)}
                          disabled={slides.length <= 1}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus Slide
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Headline</p>
                        <p className="font-medium">{currentSlide?.headline || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sub-headline</p>
                        <p className="font-medium">{currentSlide?.subheadline || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tombol Utama</p>
                        <p className="font-medium">{currentSlide?.primary_button_text || '-'} → {currentSlide?.primary_button_url || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tombol Sekunder</p>
                        <p className="font-medium">{currentSlide?.secondary_button_text || '-'} → {currentSlide?.secondary_button_url || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => toggleActive(currentSlide!)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                          currentSlide?.is_active
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {currentSlide?.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Nonaktifkan
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Aktifkan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </AdminCard>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      {editingSlide && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Preview di Website
          </a>
          <button
            onClick={saveSlide}
            disabled={saving || !editingSlide.headline}
            className="px-6 py-2 bg-[#F28A2E] text-white rounded-lg text-sm font-medium hover:bg-[#e07a1e] transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
