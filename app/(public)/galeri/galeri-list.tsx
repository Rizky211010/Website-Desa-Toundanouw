"use client";

import { useState } from "react";
import { Camera, X, ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import { Container, Badge } from "@/components";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  kategori: string;
  foto_url: string | null;
  is_featured: boolean;
  uploaded_at: string;
}

interface GaleriListProps {
  galeri: GaleriItem[];
  categories: string[];
}

export function GaleriList({ galeri, categories }: GaleriListProps) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");

  const filteredGaleri =
    selectedCategory === "Semua"
      ? galeri
      : galeri.filter((item) => item.kategori === selectedCategory);

  const handlePrev = () => {
    if (selectedImage === null) return;
    const currentIndex = filteredGaleri.findIndex((item) => item.id === selectedImage);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredGaleri.length - 1;
    setSelectedImage(filteredGaleri[prevIndex].id);
  };

  const handleNext = () => {
    if (selectedImage === null) return;
    const currentIndex = filteredGaleri.findIndex((item) => item.id === selectedImage);
    const nextIndex = currentIndex < filteredGaleri.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(filteredGaleri[nextIndex].id);
  };

  const selectedItem = galeri.find((item) => item.id === selectedImage);

  const allCategories = ["Semua", ...categories];

  return (
    <>
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 py-16 sm:py-20">
        <Container>
          {/* Filter & View Toggle - Premium */}
          <div className="flex flex-col sm:flex-row justify-between gap-5 mb-12">
            {/* Category Filter - Premium Pills */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                      : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-orange-900/30 border border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {category}
                  {category !== "Semua" && (
                    <span className="ml-1.5 text-xs opacity-80">
                      ({galeri.filter((g) => g.kategori === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View Toggle - Premium */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-md text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("masonry")}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === "masonry"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-md text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gallery Grid - Premium */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                : "columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5"
            }
          >
            {filteredGaleri.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item.id)}
                className={`group cursor-pointer overflow-hidden rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 hover:shadow-2xl hover:shadow-gray-300/60 transition-all duration-500 hover:-translate-y-1 animate-fadeIn ${
                  viewMode === "masonry" ? "break-inside-avoid mb-5" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
              >
                <div
                  className={`relative bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center overflow-hidden ${
                    viewMode === "grid"
                      ? "aspect-square"
                      : index % 3 === 0
                      ? "aspect-[4/5]"
                      : index % 3 === 1
                      ? "aspect-square"
                      : "aspect-[4/3]"
                  }`}
                >
                  {item.foto_url ? (
                    <img
                      src={item.foto_url}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-orange-200/50 rounded-2xl flex items-center justify-center">
                      <Camera className="w-8 h-8 text-orange-400 dark:text-orange-600" />
                    </div>
                  )}

                  {/* Overlay - Premium */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                    <Badge variant="primary" className="w-fit mb-3 text-xs">
                      {item.kategori}
                    </Badge>
                    <h3 className="text-white font-bold text-sm line-clamp-2 leading-snug">
                      {item.judul}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State - Premium */}
          {filteredGaleri.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-gray-300 dark:text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Tidak Ada Foto
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {selectedCategory === "Semua"
                  ? "Belum ada foto di galeri."
                  : `Belum ada foto untuk kategori "${selectedCategory}".`}
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Lightbox Modal - Premium */}
      {selectedImage !== null && selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button - Premium */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all duration-300 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation - Premium */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-6 p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl text-white transition-all duration-300 hover:scale-105"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-6 p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl text-white transition-all duration-300 hover:scale-105"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full">
            <div className="aspect-video bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
              {selectedItem.foto_url ? (
                <img
                  src={selectedItem.foto_url}
                  alt={selectedItem.judul}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Camera className="w-24 h-24 text-orange-300/50" />
              )}
            </div>
            <div className="text-center">
              <Badge variant="primary" className="mb-2">
                {selectedItem.kategori}
              </Badge>
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedItem.judul}
              </h3>
              {selectedItem.deskripsi && (
                <p className="text-gray-300">{selectedItem.deskripsi}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
