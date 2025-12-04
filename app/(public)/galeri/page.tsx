import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/page-header";
import { GaleriList } from "./galeri-list";

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch galeri from database
async function getGaleri() {
  const { data, error } = await supabase
    .from("galeri")
    .select("*")
    .order("urutan", { ascending: true, nullsFirst: false })
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching galeri:", error);
    return [];
  }

  return data || [];
}

function GaleriSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      <span className="ml-3 text-gray-500">Memuat galeri...</span>
    </div>
  );
}

export default async function GaleriPage() {
  const galeri = await getGaleri();

  // Get unique categories
  const categories = Array.from(
    new Set(galeri.map((g) => g.kategori).filter(Boolean))
  ) as string[];

  return (
    <>
      <PageHeader
        title="Galeri Desa"
        subtitle="Dokumentasi foto kegiatan dan keindahan Desa Toundanouw"
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]}
      />

      <Suspense fallback={<GaleriSkeleton />}>
        <GaleriList galeri={galeri} categories={categories} />
      </Suspense>
    </>
  );
}
