import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components";
import { BeritaList } from "./berita-list";
import { Loader2 } from "lucide-react";

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fetch published news from database
async function getPublishedNews() {
  const { data, error } = await supabase
    .from("berita")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      category,
      thumbnail_url,
      view_count,
      published_at,
      created_at,
      users:author_id (full_name)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching news:", error);
    return [];
  }

  return data || [];
}

// Loading skeleton for news grid
function NewsListSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      <span className="ml-3 text-gray-500">Memuat berita...</span>
    </div>
  );
}

export default async function BeritaPage() {
  const news = await getPublishedNews();

  // Get unique categories from the news data
  const categories = Array.from(
    new Set(news.map((n) => n.category).filter(Boolean))
  ) as string[];

  return (
    <>
      {/* Header Section */}
      <PageHeader
        title="Berita & Pengumuman Desa"
        subtitle="Informasi terkini seputar kegiatan, pengumuman, dan perkembangan Desa Toundanouw."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
      />

      {/* News List with Client-side Filtering */}
      <Suspense fallback={<NewsListSkeleton />}>
        <BeritaList news={news} categories={categories} />
      </Suspense>
    </>
  );
}
