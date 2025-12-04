import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, AlertTriangle, Home, ChevronRight, Eye } from "lucide-react";
import { Container, Badge, Button } from "@/components";
import { supabase, supabaseAdmin } from "@/lib/supabase";

interface BeritaDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Type for news category
type NewsCategory = "Pengumuman Penting" | "Kegiatan" | "Pembangunan" | "Bansos" | "Umum";

// Fetch news by slug from database
async function getNewsBySlug(slug: string) {
  const { data, error } = await supabase
    .from("berita")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      thumbnail_url,
      view_count,
      published_at,
      created_at,
      users:author_id (full_name)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// Increment view count
async function incrementViewCount(id: string) {
  try {
    // Simple update to increment view count
    const { data: current } = await supabaseAdmin
      .from("berita")
      .select("view_count")
      .eq("id", id)
      .single();
    
    if (current) {
      await supabaseAdmin
        .from("berita")
        .update({ view_count: (current.view_count || 0) + 1 })
        .eq("id", id);
    }
  } catch {
    // Silently fail if view count update fails
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BeritaDetailPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: news.title,
    description: news.excerpt || news.content.substring(0, 160),
  };
}

// Format date helper
function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCategoryBadgeVariant(category: string | null): "danger" | "success" | "info" | "warning" | "default" {
  switch (category) {
    case "Pengumuman Penting":
      return "danger";
    case "Kegiatan":
      return "success";
    case "Pembangunan":
      return "info";
    case "Bansos":
      return "warning";
    default:
      return "default";
  }
}

// Format content with basic markdown-like parsing
function formatContent(content: string) {
  return content.split("\n\n").map((paragraph, index) => {
    // Check if it's a heading (starts with **)
    if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
      return (
        <h3
          key={index}
          className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3"
        >
          {paragraph.replace(/\*\*/g, "")}
        </h3>
      );
    }

    // Check if line contains bold text
    if (paragraph.includes("**")) {
      const parts = paragraph.split(/\*\*([^*]+)\*\*/g);
      return (
        <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-semibold text-gray-900 dark:text-white">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }

    // Check if it's a list (starts with - or number)
    if (paragraph.match(/^[\d-]/m)) {
      const lines = paragraph.split("\n");
      const isNumbered = lines[0].match(/^\d/);

      if (isNumbered) {
        return (
          <ol key={index} className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
            {lines.map((line, i) => (
              <li key={i}>{line.replace(/^\d+\.\s*/, "")}</li>
            ))}
          </ol>
        );
      }

      return (
        <ul key={index} className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
          {lines.map((line, i) => (
            <li key={i}>{line.replace(/^-\s*/, "")}</li>
          ))}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {paragraph}
      </p>
    );
  });
}

export default async function BeritaDetailPage({ params }: BeritaDetailPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  // Get author name from users relation
  const authorName = Array.isArray(news.users)
    ? news.users[0]?.full_name || "Admin"
    : (news.users as { full_name: string } | null)?.full_name || "Admin";

  const isPenting = news.category === "Pengumuman Penting";
  
  // Increment view count (non-blocking)
  incrementViewCount(news.id);

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
        <Container compact className="py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href="/berita"
              className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Berita
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-none">
              {news.title}
            </span>
          </nav>
        </Container>
      </section>

      {/* Article Content */}
      <article className="bg-white dark:bg-slate-900">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Important Notice Box (for Pengumuman Penting) */}
            {isPenting && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    Pengumuman Penting
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Harap dibaca dan diperhatikan oleh seluruh warga Desa
                    Toundanouw.
                  </p>
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className="mb-4">
              <Badge variant={getCategoryBadgeVariant(news.category)}>
                {news.category || "Umum"}
              </Badge>
            </div>

            {/* Thumbnail Image */}
            {news.thumbnail_url && (
              <div className="mb-6 -mx-4 sm:mx-0">
                <img
                  src={news.thumbnail_url}
                  alt={news.title}
                  className="w-full h-64 sm:h-80 object-cover sm:rounded-xl"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {news.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={news.published_at || news.created_at}>
                  {formatDate(news.published_at || news.created_at)}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{news.view_count || 0} dilihat</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-orange dark:prose-invert max-w-none">
              {formatContent(news.content)}
            </div>

            {/* Back Button */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
              <Button href="/berita" variant="outline">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Berita
              </Button>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}
